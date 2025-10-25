import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserPreferencesService } from '../UserPreferencesService';
import { 
  UserPreferences, 
  ReligiousTradition, 
  IslamicCalculationConfig, 
  JewishCalculationConfig,
  SavedLocation 
} from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    service = new UserPreferencesService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default preferences when no stored data', () => {
      const preferences = service.getPreferences();
      
      expect(preferences.selectedTraditions).toEqual([]);
      expect(preferences.notifications.enabled).toBe(false);
      expect(preferences.displaySettings.theme).toBe('auto');
      expect(preferences.locations).toEqual([]);
      expect(preferences.favoriteEvents).toEqual([]);
    });

    it('should load stored preferences when available', () => {
      const storedPreferences: UserPreferences = {
        selectedTraditions: ['islam', 'judaism'],
        notifications: {
          enabled: true,
          prayerReminders: true,
          celestialEvents: false,
          religiousHolidays: true,
          advanceNoticeMinutes: [15, 30, 60]
        },
        displaySettings: {
          theme: 'dark',
          language: 'en',
          timeFormat: '24h',
          dateFormat: 'yyyy-MM-dd',
          showAstronomicalBasis: false,
          showCalculationMethods: true,
          highContrastMode: true,
          fontSize: 'large'
        },
        locations: [],
        favoriteEvents: ['event1', 'event2']
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        version: '1.0',
        preferences: storedPreferences
      }));

      const newService = new UserPreferencesService();
      const preferences = newService.getPreferences();

      expect(preferences.selectedTraditions).toEqual(['islam', 'judaism']);
      expect(preferences.notifications.enabled).toBe(true);
      expect(preferences.displaySettings.theme).toBe('dark');
    });
  });

  describe('Religious Traditions Management', () => {
    it('should get selected traditions', () => {
      const traditions = service.getSelectedTraditions();
      expect(traditions).toEqual([]);
    });

    it('should set selected traditions', () => {
      const traditions: ReligiousTradition[] = ['islam', 'christianity'];
      service.setSelectedTraditions(traditions);
      
      expect(service.getSelectedTraditions()).toEqual(['islam', 'christianity']);
    });

    it('should add tradition', () => {
      service.addTradition('islam');
      expect(service.getSelectedTraditions()).toContain('islam');
    });

    it('should not add duplicate tradition', () => {
      service.addTradition('islam');
      service.addTradition('islam');
      
      const traditions = service.getSelectedTraditions();
      expect(traditions.filter(t => t === 'islam')).toHaveLength(1);
    });

    it('should remove tradition', () => {
      service.setSelectedTraditions(['islam', 'judaism', 'christianity']);
      service.removeTradition('judaism');
      
      expect(service.getSelectedTraditions()).toEqual(['islam', 'christianity']);
    });
  });

  describe('Islamic Calculation Configuration', () => {
    it('should get undefined when no Islamic config set', () => {
      expect(service.getIslamicCalculation()).toBeUndefined();
    });

    it('should set and get Islamic calculation config', () => {
      const config: IslamicCalculationConfig = {
        method: 'MuslimWorldLeague',
        madhab: 'shafi',
        adjustments: { fajr: 2, isha: -2 }
      };

      service.setIslamicCalculation(config);
      const retrieved = service.getIslamicCalculation();

      expect(retrieved).toEqual(config);
      expect(retrieved).not.toBe(config); // Should be a copy
    });
  });

  describe('Jewish Calculation Configuration', () => {
    it('should get undefined when no Jewish config set', () => {
      expect(service.getJewishCalculation()).toBeUndefined();
    });

    it('should set and get Jewish calculation config', () => {
      const config: JewishCalculationConfig = {
        method: 'standard',
        candleLightingMinutes: 18,
        havdalahMinutes: 42,
        useElevation: true
      };

      service.setJewishCalculation(config);
      const retrieved = service.getJewishCalculation();

      expect(retrieved).toEqual(config);
      expect(retrieved).not.toBe(config); // Should be a copy
    });
  });

  describe('Notification Settings', () => {
    it('should get default notification settings', () => {
      const settings = service.getNotificationSettings();
      
      expect(settings.enabled).toBe(false);
      expect(settings.prayerReminders).toBe(false);
      expect(settings.advanceNoticeMinutes).toEqual([15, 30]);
    });

    it('should update notification settings', () => {
      const newSettings = {
        enabled: true,
        prayerReminders: true,
        celestialEvents: true,
        religiousHolidays: false,
        advanceNoticeMinutes: [10, 20, 30]
      };

      service.setNotificationSettings(newSettings);
      const retrieved = service.getNotificationSettings();

      expect(retrieved).toEqual(newSettings);
    });
  });

  describe('Display Settings', () => {
    it('should get default display settings', () => {
      const settings = service.getDisplaySettings();
      
      expect(settings.theme).toBe('auto');
      expect(settings.timeFormat).toBe('12h');
      expect(settings.fontSize).toBe('medium');
    });

    it('should update display settings', () => {
      const newSettings = {
        theme: 'dark' as const,
        language: 'es',
        timeFormat: '24h' as const,
        dateFormat: 'dd/MM/yyyy',
        showAstronomicalBasis: false,
        showCalculationMethods: false,
        highContrastMode: true,
        fontSize: 'large' as const
      };

      service.setDisplaySettings(newSettings);
      const retrieved = service.getDisplaySettings();

      expect(retrieved).toEqual(newSettings);
    });
  });

  describe('Saved Locations Management', () => {
    const mockLocation: SavedLocation = {
      id: 'loc1',
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      timezone: 'America/New_York',
      isDefault: false
    };

    it('should get empty locations initially', () => {
      expect(service.getSavedLocations()).toEqual([]);
    });

    it('should add saved location', () => {
      service.addSavedLocation(mockLocation);
      
      const locations = service.getSavedLocations();
      expect(locations).toHaveLength(1);
      expect(locations[0]).toEqual(mockLocation);
    });

    it('should update existing location', () => {
      service.addSavedLocation(mockLocation);
      
      const updatedLocation = { ...mockLocation, name: 'NYC' };
      service.addSavedLocation(updatedLocation);
      
      const locations = service.getSavedLocations();
      expect(locations).toHaveLength(1);
      expect(locations[0].name).toBe('NYC');
    });

    it('should remove saved location', () => {
      service.addSavedLocation(mockLocation);
      service.removeSavedLocation('loc1');
      
      expect(service.getSavedLocations()).toEqual([]);
    });

    it('should clear current location when removing it', () => {
      service.addSavedLocation(mockLocation);
      service.setCurrentLocation('loc1');
      
      expect(service.getCurrentLocation()).toEqual(mockLocation);
      
      service.removeSavedLocation('loc1');
      expect(service.getCurrentLocation()).toBeUndefined();
    });

    it('should set and get current location', () => {
      service.addSavedLocation(mockLocation);
      service.setCurrentLocation('loc1');
      
      expect(service.getCurrentLocation()).toEqual(mockLocation);
    });

    it('should not set current location if location does not exist', () => {
      service.setCurrentLocation('nonexistent');
      expect(service.getCurrentLocation()).toBeUndefined();
    });
  });

  describe('Favorite Events Management', () => {
    it('should get empty favorites initially', () => {
      expect(service.getFavoriteEvents()).toEqual([]);
    });

    it('should add favorite event', () => {
      service.addFavoriteEvent('event1');
      
      expect(service.getFavoriteEvents()).toContain('event1');
      expect(service.isFavoriteEvent('event1')).toBe(true);
    });

    it('should not add duplicate favorite', () => {
      service.addFavoriteEvent('event1');
      service.addFavoriteEvent('event1');
      
      const favorites = service.getFavoriteEvents();
      expect(favorites.filter(id => id === 'event1')).toHaveLength(1);
    });

    it('should remove favorite event', () => {
      service.addFavoriteEvent('event1');
      service.addFavoriteEvent('event2');
      service.removeFavoriteEvent('event1');
      
      expect(service.getFavoriteEvents()).toEqual(['event2']);
      expect(service.isFavoriteEvent('event1')).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should save preferences to localStorage when updated', () => {
      service.addTradition('islam');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'celestial-app-preferences',
        expect.stringContaining('"selectedTraditions":["islam"]')
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => service.addTradition('islam')).not.toThrow();
    });
  });

  describe('Subscription System', () => {
    it('should notify listeners on preference changes', () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);
      
      service.addTradition('islam');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedTraditions: ['islam']
        })
      );
      
      unsubscribe();
    });

    it('should not notify unsubscribed listeners', () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);
      
      unsubscribe();
      service.addTradition('islam');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      service.subscribe(errorListener);
      service.subscribe(goodListener);
      
      // Should not throw and should still call good listener
      expect(() => service.addTradition('islam')).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Import/Export', () => {
    it('should export preferences as JSON', () => {
      service.addTradition('islam');
      service.addFavoriteEvent('event1');
      
      const exported = service.exportPreferences();
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.preferences.selectedTraditions).toEqual(['islam']);
      expect(parsed.preferences.favoriteEvents).toEqual(['event1']);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should import valid preferences', () => {
      const preferences = {
        selectedTraditions: ['judaism'],
        notifications: {
          enabled: true,
          prayerReminders: false,
          celestialEvents: true,
          religiousHolidays: false,
          advanceNoticeMinutes: [5, 10]
        },
        displaySettings: {
          theme: 'light',
          language: 'en',
          timeFormat: '24h',
          dateFormat: 'yyyy-MM-dd',
          showAstronomicalBasis: true,
          showCalculationMethods: false,
          highContrastMode: false,
          fontSize: 'small'
        },
        locations: [],
        favoriteEvents: ['event2']
      };

      const importData = JSON.stringify({
        version: '1.0',
        preferences
      });

      const result = service.importPreferences(importData);
      
      expect(result).toBe(true);
      expect(service.getSelectedTraditions()).toEqual(['judaism']);
      expect(service.getFavoriteEvents()).toEqual(['event2']);
    });

    it('should reject invalid import data', () => {
      const result = service.importPreferences('invalid json');
      expect(result).toBe(false);
    });

    it('should reject import data with invalid structure', () => {
      const invalidData = JSON.stringify({
        version: '1.0',
        preferences: {
          selectedTraditions: 'not an array'
        }
      });

      const result = service.importPreferences(invalidData);
      expect(result).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default preferences', () => {
      // Make some changes
      service.addTradition('islam');
      service.addFavoriteEvent('event1');
      service.setNotificationSettings({
        enabled: true,
        prayerReminders: true,
        celestialEvents: true,
        religiousHolidays: true,
        advanceNoticeMinutes: [60]
      });

      // Reset
      service.resetToDefaults();

      // Check defaults are restored
      const preferences = service.getPreferences();
      expect(preferences.selectedTraditions).toEqual([]);
      expect(preferences.favoriteEvents).toEqual([]);
      expect(preferences.notifications.enabled).toBe(false);
    });

    it('should notify listeners when reset', () => {
      const listener = vi.fn();
      service.subscribe(listener);
      
      service.resetToDefaults();
      
      expect(listener).toHaveBeenCalled();
    });
  });
});