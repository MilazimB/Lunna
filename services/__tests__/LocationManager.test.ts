import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocationManager } from '../LocationManager';
import { SavedLocation } from '../../types';

// Mock moment-timezone
vi.mock('moment-timezone', () => {
  const mockMomentInstance = {
    utcOffset: vi.fn(() => -300), // -5 hours (EST)
    isDST: vi.fn(() => false),
    format: vi.fn(() => 'EST'),
    toDate: vi.fn(() => new Date('2024-01-15T12:00:00Z')),
    tz: vi.fn(() => mockMomentInstance)
  };

  const mockMoment = vi.fn(() => mockMomentInstance);
  mockMoment.tz = vi.fn(() => mockMomentInstance);
  mockMoment.utc = vi.fn(() => ({
    tz: vi.fn(() => ({
      toDate: vi.fn(() => new Date('2024-01-15T07:00:00Z'))
    }))
  }));
  
  mockMoment.tz.zone = vi.fn((timezone: string) => {
    const validTimezones = ['America/New_York', 'Europe/London', 'UTC', 'Asia/Tokyo'];
    return validTimezones.includes(timezone) ? { name: timezone } : null;
  });
  
  return {
    default: mockMoment
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn()
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('LocationManager', () => {
  let locationManager: LocationManager;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Get fresh instance
    locationManager = LocationManager.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = LocationManager.getInstance();
      const instance2 = LocationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Location Management', () => {
    it('should save and retrieve locations', async () => {
      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      };

      const savedLocation = await locationManager.saveLocation(testLocation);
      
      expect(savedLocation.timezone).toBeDefined();
      expect(savedLocation.name).toBe('Test City');
      
      const locations = locationManager.getSavedLocations();
      expect(locations).toHaveLength(1);
      expect(locations[0].id).toBe('test-1');
    });

    it('should update existing location', async () => {
      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      };

      await locationManager.saveLocation(testLocation);
      
      const updatedLocation = {
        ...testLocation,
        name: 'Updated City'
      };
      
      await locationManager.saveLocation(updatedLocation);
      
      const locations = locationManager.getSavedLocations();
      expect(locations).toHaveLength(1);
      expect(locations[0].name).toBe('Updated City');
    });

    it('should remove location', async () => {
      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      };

      await locationManager.saveLocation(testLocation);
      expect(locationManager.getSavedLocations()).toHaveLength(1);
      
      const removed = locationManager.removeLocation('test-1');
      expect(removed).toBe(true);
      expect(locationManager.getSavedLocations()).toHaveLength(0);
    });

    it('should return false when removing non-existent location', () => {
      const removed = locationManager.removeLocation('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Current Location Management', () => {
    it('should set and get current location', async () => {
      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: false
      };

      await locationManager.saveLocation(testLocation);
      
      const success = locationManager.setCurrentLocation('test-1');
      expect(success).toBe(true);
      
      const currentLocation = locationManager.getCurrentLocation();
      expect(currentLocation?.id).toBe('test-1');
    });

    it('should return false when setting non-existent current location', () => {
      const success = locationManager.setCurrentLocation('non-existent');
      expect(success).toBe(false);
    });

    it('should set first location as current when marked as default', async () => {
      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      };

      await locationManager.saveLocation(testLocation);
      
      const currentLocation = locationManager.getCurrentLocation();
      expect(currentLocation?.id).toBe('test-1');
    });
  });

  describe('Coordinate Validation', () => {
    it('should validate correct coordinates', () => {
      const result = locationManager.validateCoordinates(40.7128, -74.0060);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid latitude', () => {
      const result = locationManager.validateCoordinates(91, -74.0060);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    });

    it('should reject invalid longitude', () => {
      const result = locationManager.validateCoordinates(40.7128, 181);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180 degrees');
    });

    it('should reject NaN coordinates', () => {
      const result = locationManager.validateCoordinates(NaN, -74.0060);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    });
  });

  describe('Polar Region Detection', () => {
    it('should detect Arctic region', () => {
      expect(locationManager.isPolarRegion(70)).toBe(true);
    });

    it('should detect Antarctic region', () => {
      expect(locationManager.isPolarRegion(-70)).toBe(true);
    });

    it('should not detect temperate regions as polar', () => {
      expect(locationManager.isPolarRegion(40)).toBe(false);
      expect(locationManager.isPolarRegion(-40)).toBe(false);
    });

    it('should handle boundary cases', () => {
      expect(locationManager.isPolarRegion(66.5)).toBe(false);
      expect(locationManager.isPolarRegion(66.6)).toBe(true);
      expect(locationManager.isPolarRegion(-66.6)).toBe(true);
    });
  });

  describe('Timezone Information', () => {
    it('should get timezone information', () => {
      const timezoneInfo = locationManager.getTimezoneInfo('America/New_York');
      
      expect(timezoneInfo.timezone).toBe('America/New_York');
      expect(timezoneInfo.offset).toBe(-300);
      expect(timezoneInfo.isDST).toBe(false);
      expect(timezoneInfo.abbreviation).toBe('EST');
      expect(timezoneInfo.utcOffset).toBe('-05:00');
    });
  });

  describe('GPS Integration', () => {
    it('should get current position successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null
        },
        timestamp: Date.now()
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await locationManager.getCurrentPosition();
      
      expect(result.location.latitude).toBe(40.7128);
      expect(result.location.longitude).toBe(-74.0060);
      expect(result.accuracy).toBe(10);
      expect(result.location.timezone).toBeDefined();
    });

    it('should handle geolocation errors', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      await expect(locationManager.getCurrentPosition()).rejects.toThrow('Location access denied by user');
    });

    it('should handle unsupported geolocation', async () => {
      // Create a new LocationManager instance with mocked navigator
      const originalNavigator = global.navigator;
      // @ts-ignore
      global.navigator = {};

      // Create a fresh instance to test unsupported geolocation
      const testLocationManager = LocationManager.getInstance();

      await expect(testLocationManager.getCurrentPosition()).rejects.toThrow('Geolocation is not supported by this browser');

      // Restore navigator
      global.navigator = originalNavigator;
    });
  });

  describe('Event Listeners', () => {
    it('should notify listeners on location changes', async () => {
      const listener = vi.fn();
      const unsubscribe = locationManager.subscribe(listener);

      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true
      };

      await locationManager.saveLocation(testLocation);
      
      expect(listener).toHaveBeenCalledWith([expect.objectContaining({ id: 'test-1' })]);
      
      unsubscribe();
    });

    it('should notify current location listeners', async () => {
      const listener = vi.fn();
      const unsubscribe = locationManager.subscribeToCurrentLocation(listener);

      const testLocation: Omit<SavedLocation, 'timezone'> = {
        id: 'test-1',
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: false
      };

      await locationManager.saveLocation(testLocation);
      locationManager.setCurrentLocation('test-1');
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ id: 'test-1' }));
      
      unsubscribe();
    });
  });
});