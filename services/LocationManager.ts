import moment from 'moment-timezone';
import { Location, SavedLocation } from '../types';

/**
 * LocationManager Service
 * 
 * Manages multiple locations, automatic timezone detection, and saved location functionality.
 * Enhances existing location handling with comprehensive location management capabilities.
 */

export interface LocationWithTimezone extends Location {
  timezone: string;
  timezoneOffset: number; // minutes from UTC
  isDST: boolean;
  city?: string;
  country?: string;
}

export interface GeolocationResult {
  location: LocationWithTimezone;
  accuracy: number; // meters
  timestamp: Date;
}

export interface TimezoneInfo {
  timezone: string;
  offset: number; // minutes from UTC
  isDST: boolean;
  abbreviation: string;
  utcOffset: string; // e.g., "+05:30"
}

export class LocationManager {
  private static instance: LocationManager;
  private savedLocations: SavedLocation[] = [];
  private currentLocation: SavedLocation | null = null;
  private listeners: Set<(locations: SavedLocation[]) => void> = new Set();
  private currentLocationListeners: Set<(location: SavedLocation | null) => void> = new Set();

  private constructor() {
    this.loadSavedLocations();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  /**
   * Get current location with timezone information
   */
  getCurrentLocation(): SavedLocation | null {
    return this.currentLocation ? { ...this.currentLocation } : null;
  }

  /**
   * Set current location
   */
  setCurrentLocation(locationId: string): boolean {
    const location = this.savedLocations.find(loc => loc.id === locationId);
    if (location) {
      this.currentLocation = { ...location };
      this.saveCurrentLocation();
      this.notifyCurrentLocationListeners();
      return true;
    }
    return false;
  }

  /**
   * Get all saved locations
   */
  getSavedLocations(): SavedLocation[] {
    return [...this.savedLocations];
  }

  /**
   * Add or update a saved location
   */
  async saveLocation(location: Omit<SavedLocation, 'timezone'> & { timezone?: string }): Promise<SavedLocation> {
    // Detect timezone if not provided
    let timezone = location.timezone;
    if (!timezone) {
      timezone = await this.detectTimezone(location.latitude, location.longitude);
    }

    const savedLocation: SavedLocation = {
      ...location,
      timezone
    };

    const existingIndex = this.savedLocations.findIndex(loc => loc.id === location.id);
    if (existingIndex >= 0) {
      this.savedLocations[existingIndex] = savedLocation;
    } else {
      this.savedLocations.push(savedLocation);
    }

    // If this is marked as default or it's the first location, set as current
    if (location.isDefault || this.savedLocations.length === 1) {
      this.currentLocation = { ...savedLocation };
      this.saveCurrentLocation();
      this.notifyCurrentLocationListeners();
    }

    this.saveSavedLocations();
    this.notifyListeners();
    return { ...savedLocation };
  }

  /**
   * Remove a saved location
   */
  removeLocation(locationId: string): boolean {
    const initialLength = this.savedLocations.length;
    this.savedLocations = this.savedLocations.filter(loc => loc.id !== locationId);
    
    if (this.savedLocations.length < initialLength) {
      // If we removed the current location, set a new current location
      if (this.currentLocation?.id === locationId) {
        this.currentLocation = this.savedLocations.length > 0 ? { ...this.savedLocations[0] } : null;
        this.saveCurrentLocation();
        this.notifyCurrentLocationListeners();
      }
      
      this.saveSavedLocations();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get location by ID
   */
  getLocationById(locationId: string): SavedLocation | undefined {
    const location = this.savedLocations.find(loc => loc.id === locationId);
    return location ? { ...location } : undefined;
  }

  /**
   * Get current location with enhanced timezone information
   */
  async getCurrentLocationWithTimezone(): Promise<LocationWithTimezone | null> {
    if (!this.currentLocation) {
      return null;
    }

    return this.enhanceLocationWithTimezone(this.currentLocation);
  }

  /**
   * Enhance a location with detailed timezone information
   */
  async enhanceLocationWithTimezone(location: Location): Promise<LocationWithTimezone> {
    const timezone = location.timezone || await this.detectTimezone(location.latitude, location.longitude);
    const timezoneInfo = this.getTimezoneInfo(timezone);
    
    return {
      ...location,
      timezone,
      timezoneOffset: timezoneInfo.offset,
      isDST: timezoneInfo.isDST
    };
  }

  /**
   * Get current position using GPS
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            const timezone = await this.detectTimezone(latitude, longitude);
            const timezoneInfo = this.getTimezoneInfo(timezone);
            
            const locationWithTimezone: LocationWithTimezone = {
              latitude: parseFloat(latitude.toFixed(6)),
              longitude: parseFloat(longitude.toFixed(6)),
              elevation: position.coords.altitude || undefined,
              timezone,
              timezoneOffset: timezoneInfo.offset,
              isDST: timezoneInfo.isDST
            };

            resolve({
              location: locationWithTimezone,
              accuracy: accuracy || 0,
              timestamp: new Date(position.timestamp)
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let message = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        defaultOptions
      );
    });
  }

  /**
   * Detect timezone for given coordinates
   */
  async detectTimezone(latitude: number, longitude: number): Promise<string> {
    // For client-side timezone detection, we'll use a combination of approaches
    
    // First, try to use the browser's timezone if coordinates are close to user's location
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // For now, we'll use a simple approach based on longitude for basic timezone detection
    // In a production app, you'd want to use a proper timezone API service
    const timezoneFromLongitude = this.getTimezoneFromLongitude(longitude);
    
    // Validate the detected timezone
    if (moment.tz.zone(timezoneFromLongitude)) {
      return timezoneFromLongitude;
    }
    
    // Fallback to browser timezone if it's valid
    if (moment.tz.zone(browserTimezone)) {
      return browserTimezone;
    }
    
    // Final fallback to UTC
    return 'UTC';
  }

  /**
   * Get timezone information for a given timezone
   */
  getTimezoneInfo(timezone: string): TimezoneInfo {
    const now = moment().tz(timezone);
    const offset = now.utcOffset();
    const isDST = now.isDST();
    const abbreviation = now.format('z');
    
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    const utcOffset = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return {
      timezone,
      offset,
      isDST,
      abbreviation,
      utcOffset
    };
  }

  /**
   * Convert time between timezones
   */
  convertTime(time: Date, fromTimezone: string, toTimezone: string): Date {
    return moment.tz(time, fromTimezone).tz(toTimezone).toDate();
  }

  /**
   * Get local time for a specific location
   */
  getLocalTime(location: Location, utcTime?: Date): Date {
    const time = utcTime || new Date();
    const timezone = location.timezone || 'UTC';
    return moment.utc(time).tz(timezone).toDate();
  }

  /**
   * Check if location is in polar region (where normal calculations may fail)
   */
  isPolarRegion(latitude: number): boolean {
    return Math.abs(latitude) > 66.5; // Arctic/Antarctic circles
  }

  /**
   * Validate location coordinates
   */
  validateCoordinates(latitude: number, longitude: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Subscribe to saved locations changes
   */
  subscribe(listener: (locations: SavedLocation[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to current location changes
   */
  subscribeToCurrentLocation(listener: (location: SavedLocation | null) => void): () => void {
    this.currentLocationListeners.add(listener);
    return () => {
      this.currentLocationListeners.delete(listener);
    };
  }

  /**
   * Get approximate timezone from longitude (basic implementation)
   */
  private getTimezoneFromLongitude(longitude: number): string {
    // This is a simplified approach - in production, use a proper timezone service
    const timezoneOffset = Math.round(longitude / 15);
    
    // Map to common timezone names based on offset
    const timezoneMap: { [key: number]: string } = {
      '-12': 'Pacific/Kwajalein',
      '-11': 'Pacific/Midway',
      '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage',
      '-8': 'America/Los_Angeles',
      '-7': 'America/Denver',
      '-6': 'America/Chicago',
      '-5': 'America/New_York',
      '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo',
      '-2': 'Atlantic/South_Georgia',
      '-1': 'Atlantic/Azores',
      '0': 'Europe/London',
      '1': 'Europe/Paris',
      '2': 'Europe/Berlin',
      '3': 'Europe/Moscow',
      '4': 'Asia/Dubai',
      '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka',
      '7': 'Asia/Bangkok',
      '8': 'Asia/Shanghai',
      '9': 'Asia/Tokyo',
      '10': 'Australia/Sydney',
      '11': 'Pacific/Noumea',
      '12': 'Pacific/Auckland'
    };
    
    return timezoneMap[timezoneOffset] || 'UTC';
  }

  /**
   * Load saved locations from localStorage
   */
  private loadSavedLocations(): void {
    try {
      const stored = localStorage.getItem('celestial-app-saved-locations');
      if (stored) {
        this.savedLocations = JSON.parse(stored);
      }
      
      const currentStored = localStorage.getItem('celestial-app-current-location');
      if (currentStored) {
        this.currentLocation = JSON.parse(currentStored);
      }
    } catch (error) {
      console.error('Failed to load saved locations:', error);
      this.savedLocations = [];
      this.currentLocation = null;
    }
  }

  /**
   * Save locations to localStorage
   */
  private saveSavedLocations(): void {
    try {
      localStorage.setItem('celestial-app-saved-locations', JSON.stringify(this.savedLocations));
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }

  /**
   * Save current location to localStorage
   */
  private saveCurrentLocation(): void {
    try {
      if (this.currentLocation) {
        localStorage.setItem('celestial-app-current-location', JSON.stringify(this.currentLocation));
      } else {
        localStorage.removeItem('celestial-app-current-location');
      }
    } catch (error) {
      console.error('Failed to save current location:', error);
    }
  }

  /**
   * Notify listeners of saved locations changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.savedLocations]);
      } catch (error) {
        console.error('Error in location change listener:', error);
      }
    });
  }

  /**
   * Notify listeners of current location changes
   */
  private notifyCurrentLocationListeners(): void {
    this.currentLocationListeners.forEach(listener => {
      try {
        listener(this.currentLocation ? { ...this.currentLocation } : null);
      } catch (error) {
        console.error('Error in current location change listener:', error);
      }
    });
  }
}

// Export singleton instance
export const locationManager = LocationManager.getInstance();