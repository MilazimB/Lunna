import { 
  UserPreferences, 
  ReligiousTradition, 
  IslamicCalculationConfig, 
  JewishCalculationConfig,
  NotificationSettings,
  DisplaySettings,
  SavedLocation,
  AppStorage
} from '../types';

/**
 * UserPreferencesService
 * 
 * Manages user preferences and settings with local storage persistence.
 * Handles religious tradition selection, calculation method preferences,
 * and other user configuration options.
 */

const STORAGE_KEY = 'celestial-app-preferences';
const STORAGE_VERSION = '1.0';

export class UserPreferencesService {
  private preferences: UserPreferences;
  private listeners: Set<(preferences: UserPreferences) => void> = new Set();

  constructor() {
    this.preferences = this.loadPreferences();
  }

  /**
   * Get current user preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Update user preferences and persist to storage
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Get selected religious traditions
   */
  getSelectedTraditions(): ReligiousTradition[] {
    return [...this.preferences.selectedTraditions];
  }

  /**
   * Set selected religious traditions
   */
  setSelectedTraditions(traditions: ReligiousTradition[]): void {
    this.updatePreferences({ selectedTraditions: [...traditions] });
  }

  /**
   * Add a religious tradition to selection
   */
  addTradition(tradition: ReligiousTradition): void {
    if (!this.preferences.selectedTraditions.includes(tradition)) {
      const traditions = [...this.preferences.selectedTraditions, tradition];
      this.setSelectedTraditions(traditions);
    }
  }

  /**
   * Remove a religious tradition from selection
   */
  removeTradition(tradition: ReligiousTradition): void {
    const traditions = this.preferences.selectedTraditions.filter(t => t !== tradition);
    this.setSelectedTraditions(traditions);
  }

  /**
   * Get Islamic calculation configuration
   */
  getIslamicCalculation(): IslamicCalculationConfig | undefined {
    return this.preferences.islamicCalculation ? { ...this.preferences.islamicCalculation } : undefined;
  }

  /**
   * Set Islamic calculation configuration
   */
  setIslamicCalculation(config: IslamicCalculationConfig): void {
    this.updatePreferences({ islamicCalculation: { ...config } });
  }

  /**
   * Get Jewish calculation configuration
   */
  getJewishCalculation(): JewishCalculationConfig | undefined {
    return this.preferences.jewishCalculation ? { ...this.preferences.jewishCalculation } : undefined;
  }

  /**
   * Set Jewish calculation configuration
   */
  setJewishCalculation(config: JewishCalculationConfig): void {
    this.updatePreferences({ jewishCalculation: { ...config } });
  }

  /**
   * Get notification settings
   */
  getNotificationSettings(): NotificationSettings {
    return { ...this.preferences.notifications };
  }

  /**
   * Update notification settings
   */
  setNotificationSettings(settings: NotificationSettings): void {
    this.updatePreferences({ notifications: { ...settings } });
  }

  /**
   * Get display settings
   */
  getDisplaySettings(): DisplaySettings {
    return { ...this.preferences.displaySettings };
  }

  /**
   * Update display settings
   */
  setDisplaySettings(settings: DisplaySettings): void {
    this.updatePreferences({ displaySettings: { ...settings } });
  }

  /**
   * Get saved locations
   */
  getSavedLocations(): SavedLocation[] {
    return [...this.preferences.locations];
  }

  /**
   * Add a saved location
   */
  addSavedLocation(location: SavedLocation): void {
    const locations = [...this.preferences.locations];
    const existingIndex = locations.findIndex(l => l.id === location.id);
    
    if (existingIndex >= 0) {
      locations[existingIndex] = { ...location };
    } else {
      locations.push({ ...location });
    }
    
    this.updatePreferences({ locations });
  }

  /**
   * Remove a saved location
   */
  removeSavedLocation(locationId: string): void {
    const locations = this.preferences.locations.filter(l => l.id !== locationId);
    let updates: Partial<UserPreferences> = { locations };
    
    // If removing the current location, clear the current location ID
    if (this.preferences.currentLocationId === locationId) {
      updates.currentLocationId = undefined;
    }
    
    this.updatePreferences(updates);
  }

  /**
   * Get current location
   */
  getCurrentLocation(): SavedLocation | undefined {
    if (!this.preferences.currentLocationId) {
      return undefined;
    }
    return this.preferences.locations.find(l => l.id === this.preferences.currentLocationId);
  }

  /**
   * Set current location
   */
  setCurrentLocation(locationId: string): void {
    const location = this.preferences.locations.find(l => l.id === locationId);
    if (location) {
      this.updatePreferences({ currentLocationId: locationId });
    }
  }

  /**
   * Get favorite events
   */
  getFavoriteEvents(): string[] {
    return [...this.preferences.favoriteEvents];
  }

  /**
   * Add event to favorites
   */
  addFavoriteEvent(eventId: string): void {
    if (!this.preferences.favoriteEvents.includes(eventId)) {
      const favoriteEvents = [...this.preferences.favoriteEvents, eventId];
      this.updatePreferences({ favoriteEvents });
    }
  }

  /**
   * Remove event from favorites
   */
  removeFavoriteEvent(eventId: string): void {
    const favoriteEvents = this.preferences.favoriteEvents.filter(id => id !== eventId);
    this.updatePreferences({ favoriteEvents });
  }

  /**
   * Check if event is favorited
   */
  isFavoriteEvent(eventId: string): boolean {
    return this.preferences.favoriteEvents.includes(eventId);
  }

  /**
   * Reset preferences to defaults
   */
  resetToDefaults(): void {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (preferences: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Export preferences as JSON
   */
  exportPreferences(): string {
    return JSON.stringify({
      version: STORAGE_VERSION,
      preferences: this.preferences,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import preferences from JSON
   */
  importPreferences(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.version !== STORAGE_VERSION) {
        console.warn('Preference version mismatch, attempting migration');
      }
      
      if (data.preferences && this.validatePreferences(data.preferences)) {
        this.preferences = data.preferences;
        this.savePreferences();
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.version === STORAGE_VERSION && this.validatePreferences(data.preferences)) {
          return data.preferences;
        }
      }
    } catch (error) {
      console.error('Failed to load preferences from storage:', error);
    }
    
    return this.getDefaultPreferences();
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      const data = {
        version: STORAGE_VERSION,
        preferences: this.preferences,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save preferences to storage:', error);
    }
  }

  /**
   * Notify all listeners of preference changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getPreferences());
      } catch (error) {
        console.error('Error in preference change listener:', error);
      }
    });
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      selectedTraditions: [],
      notifications: {
        enabled: false,
        prayerReminders: false,
        celestialEvents: false,
        religiousHolidays: false,
        advanceNoticeMinutes: [15, 30]
      },
      displaySettings: {
        theme: 'auto',
        language: 'en',
        timeFormat: '12h',
        dateFormat: 'MMM dd, yyyy',
        showAstronomicalBasis: true,
        showCalculationMethods: true,
        highContrastMode: false,
        fontSize: 'medium'
      },
      locations: [],
      favoriteEvents: []
    };
  }

  /**
   * Validate preferences object structure
   */
  private validatePreferences(preferences: any): preferences is UserPreferences {
    if (!preferences || typeof preferences !== 'object') {
      return false;
    }

    // Check required properties
    const requiredProps = ['selectedTraditions', 'notifications', 'displaySettings', 'locations', 'favoriteEvents'];
    for (const prop of requiredProps) {
      if (!(prop in preferences)) {
        return false;
      }
    }

    // Validate selectedTraditions
    if (!Array.isArray(preferences.selectedTraditions)) {
      return false;
    }

    // Validate notifications
    if (!preferences.notifications || typeof preferences.notifications !== 'object') {
      return false;
    }

    // Validate displaySettings
    if (!preferences.displaySettings || typeof preferences.displaySettings !== 'object') {
      return false;
    }

    // Validate locations
    if (!Array.isArray(preferences.locations)) {
      return false;
    }

    // Validate favoriteEvents
    if (!Array.isArray(preferences.favoriteEvents)) {
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();