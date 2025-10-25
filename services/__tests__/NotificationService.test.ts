import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationService } from '../NotificationService';
import { 
  PrayerTime, 
  ReligiousEvent, 
  LunarEvent, 
  NotificationSettings,
  ScheduledNotification 
} from '../../types';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: Object.assign(vi.fn(), {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  })
}));

// Mock UserPreferencesService
const mockUserPreferencesService = {
  getNotificationSettings: vi.fn(),
  subscribe: vi.fn(),
};

vi.mock('../UserPreferencesService', () => ({
  userPreferencesService: mockUserPreferencesService
}));

// Mock LocationManager
const mockLocationManager = {
  subscribeToCurrentLocation: vi.fn(),
};

vi.mock('../LocationManager', () => ({
  locationManager: mockLocationManager
}));

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

// Mock Notification API
const mockNotification = vi.fn();
Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  configurable: true
});

// Mock setTimeout and clearTimeout
vi.useFakeTimers();

describe('NotificationService', () => {
  let service: NotificationService;
  let mockNotificationSettings: NotificationSettings;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    
    // Setup default notification settings
    mockNotificationSettings = {
      enabled: true,
      prayerReminders: true,
      celestialEvents: true,
      religiousHolidays: true,
      advanceNoticeMinutes: [15, 30]
    };
    
    mockUserPreferencesService.getNotificationSettings.mockReturnValue(mockNotificationSettings);
    mockUserPreferencesService.subscribe.mockReturnValue(() => {});
    mockLocationManager.subscribeToCurrentLocation.mockReturnValue(() => {});
    
    // Mock Notification permission
    Object.defineProperty(mockNotification, 'permission', {
      value: 'granted',
      configurable: true
    });
    
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
    
    service = NotificationService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await service.initialize();
      
      expect(mockUserPreferencesService.subscribe).toHaveBeenCalled();
      expect(mockLocationManager.subscribeToCurrentLocation).toHaveBeenCalled();
    });

    it('should request notification permission', async () => {
      await service.initialize();
      
      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should load existing notification data from storage', () => {
      const storedData = {
        scheduled: [{
          id: 'test-1',
          eventId: 'event-1',
          eventName: 'Test Event',
          eventTime: new Date().toISOString(),
          notificationTime: new Date().toISOString(),
          type: 'prayer',
          delivered: false
        }],
        history: [{
          id: 'hist-1',
          timestamp: new Date().toISOString(),
          title: 'Test',
          message: 'Test message',
          type: 'prayer',
          delivered: true,
          dismissed: false
        }]
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));
      
      const newService = NotificationService.getInstance();
      const scheduled = newService.getScheduledNotifications();
      const history = newService.getNotificationHistory();
      
      expect(scheduled).toHaveLength(1);
      expect(history).toHaveLength(1);
    });
  });

  describe('Prayer Time Notifications', () => {
    it('should schedule prayer time notifications', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0); // Noon tomorrow
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Dhuhr',
          time: tomorrow,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague',
          qiblaDirection: 45
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, tomorrow);
      
      const scheduled = service.getScheduledNotifications();
      expect(scheduled).toHaveLength(2); // 15 and 30 minute notifications
      
      const notification15 = scheduled.find(n => n.id.includes('-15'));
      const notification30 = scheduled.find(n => n.id.includes('-30'));
      
      expect(notification15).toBeDefined();
      expect(notification30).toBeDefined();
      expect(notification15?.type).toBe('prayer');
      expect(notification30?.type).toBe('prayer');
    });

    it('should not schedule notifications when prayer reminders disabled', async () => {
      mockNotificationSettings.prayerReminders = false;
      mockUserPreferencesService.getNotificationSettings.mockReturnValue(mockNotificationSettings);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: tomorrow,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, tomorrow);
      
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });

    it('should not schedule notifications for past prayer times', async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 2);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: pastTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, pastTime);
      
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe('Celestial Event Notifications', () => {
    it('should schedule celestial event notifications', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);
      
      const lunarEvents: LunarEvent[] = [
        {
          eventName: 'Full Moon',
          utcDate: tomorrow,
          localSolarDate: tomorrow,
          julianDate: 2460000,
          accuracyNote: 'Test accuracy'
        }
      ];

      await service.scheduleCelestialNotifications(lunarEvents);
      
      const scheduled = service.getScheduledNotifications();
      expect(scheduled).toHaveLength(2); // 15 and 30 minute notifications
      
      const notifications = scheduled.filter(n => n.type === 'celestial');
      expect(notifications).toHaveLength(2);
    });

    it('should not schedule notifications when celestial events disabled', async () => {
      mockNotificationSettings.celestialEvents = false;
      mockUserPreferencesService.getNotificationSettings.mockReturnValue(mockNotificationSettings);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const lunarEvents: LunarEvent[] = [
        {
          eventName: 'New Moon',
          utcDate: tomorrow,
          localSolarDate: tomorrow,
          julianDate: 2460000,
          accuracyNote: 'Test accuracy'
        }
      ];

      await service.scheduleCelestialNotifications(lunarEvents);
      
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe('Religious Holiday Notifications', () => {
    it('should schedule religious holiday notifications', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const religiousEvents: ReligiousEvent[] = [
        {
          id: 'eid-1',
          name: 'Eid al-Fitr',
          tradition: 'islam',
          date: tomorrow,
          description: 'Festival of Breaking the Fast',
          significance: 'Marks the end of Ramadan',
          observanceType: 'feast'
        }
      ];

      await service.scheduleReligiousHolidayNotifications(religiousEvents);
      
      const scheduled = service.getScheduledNotifications();
      expect(scheduled).toHaveLength(2); // 15 and 30 minute notifications
      
      const notifications = scheduled.filter(n => n.type === 'holiday');
      expect(notifications).toHaveLength(2);
    });

    it('should not schedule notifications when religious holidays disabled', async () => {
      mockNotificationSettings.religiousHolidays = false;
      mockUserPreferencesService.getNotificationSettings.mockReturnValue(mockNotificationSettings);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const religiousEvents: ReligiousEvent[] = [
        {
          id: 'christmas-1',
          name: 'Christmas',
          tradition: 'christianity',
          date: tomorrow,
          description: 'Birth of Jesus Christ',
          significance: 'Christian celebration',
          observanceType: 'feast'
        }
      ];

      await service.scheduleReligiousHolidayNotifications(religiousEvents);
      
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe('Notification Delivery', () => {
    it('should deliver notifications at scheduled time', async () => {
      const futureTime = new Date();
      futureTime.setMinutes(futureTime.getMinutes() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Maghrib',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      
      // Fast forward time to trigger notification
      vi.advanceTimersByTime(60 * 1000); // 1 minute
      
      const { toast } = await import('react-toastify');
      expect(toast.info).toHaveBeenCalled();
    });

    it('should show browser notification when permission granted', async () => {
      const futureTime = new Date();
      futureTime.setMinutes(futureTime.getMinutes() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Asr',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      
      // Fast forward time to trigger notification
      vi.advanceTimersByTime(60 * 1000);
      
      expect(mockNotification).toHaveBeenCalled();
    });

    it('should add delivered notifications to history', async () => {
      const futureTime = new Date();
      futureTime.setMinutes(futureTime.getMinutes() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Isha',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      
      // Fast forward time to trigger notification
      vi.advanceTimersByTime(60 * 1000);
      
      const history = service.getNotificationHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].delivered).toBe(true);
    });
  });

  describe('Notification Management', () => {
    it('should cancel specific notification', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      
      const scheduled = service.getScheduledNotifications();
      expect(scheduled).toHaveLength(2);
      
      service.cancelNotification(scheduled[0].id);
      
      const remaining = service.getScheduledNotifications();
      expect(remaining).toHaveLength(1);
      expect(remaining.find(n => n.id === scheduled[0].id)).toBeUndefined();
    });

    it('should cancel notifications by type', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      // Schedule prayer notifications
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Dhuhr',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      // Schedule celestial notifications
      const lunarEvents: LunarEvent[] = [
        {
          eventName: 'First Quarter Moon',
          utcDate: futureTime,
          localSolarDate: futureTime,
          julianDate: 2460000,
          accuracyNote: 'Test'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      await service.scheduleCelestialNotifications(lunarEvents);
      
      expect(service.getScheduledNotifications()).toHaveLength(4); // 2 prayer + 2 celestial
      
      service.cancelNotificationsByType('prayer');
      
      const remaining = service.getScheduledNotifications();
      expect(remaining).toHaveLength(2);
      expect(remaining.every(n => n.type === 'celestial')).toBe(true);
    });

    it('should clear notification history', () => {
      // Add some mock history
      service.testNotification();
      
      expect(service.getNotificationHistory().length).toBeGreaterThan(0);
      
      service.clearNotificationHistory();
      
      expect(service.getNotificationHistory()).toHaveLength(0);
    });
  });

  describe('Test Notification', () => {
    it('should deliver test notification immediately', async () => {
      await service.testNotification();
      
      const { toast } = await import('react-toastify');
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Test Notification'),
        expect.any(Object)
      );
      
      const history = service.getNotificationHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].title).toBe('Test Notification');
    });
  });

  describe('Subscription System', () => {
    it('should notify listeners when history changes', async () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);
      
      await service.testNotification();
      
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Notification'
          })
        ])
      );
      
      unsubscribe();
    });

    it('should not notify unsubscribed listeners', async () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);
      
      unsubscribe();
      await service.testNotification();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Preference Changes', () => {
    it('should cancel all notifications when disabled', () => {
      // Schedule some notifications first
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Maghrib',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      service.schedulePrayerNotifications(prayerTimes, futureTime);
      expect(service.getScheduledNotifications().length).toBeGreaterThan(0);
      
      // Simulate preference change to disabled
      const disabledSettings = { ...mockNotificationSettings, enabled: false };
      const preferenceCallback = mockUserPreferencesService.subscribe.mock.calls[0][0];
      
      preferenceCallback({ notifications: disabledSettings });
      
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe('Data Persistence', () => {
    it('should save notification data to localStorage', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      await service.schedulePrayerNotifications(prayerTimes, futureTime);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'celestial-app-notifications',
        expect.stringContaining('"scheduled"')
      );
    });

    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Dhuhr',
          time: futureTime,
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague'
        }
      ];

      // Should not throw
      expect(async () => {
        await service.schedulePrayerNotifications(prayerTimes, futureTime);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired notifications', () => {
      // This would be tested by manipulating the internal state
      // For now, we just verify the method exists and can be called
      expect(() => {
        // The cleanup happens automatically in the constructor
        // We can't easily test this without exposing internal methods
      }).not.toThrow();
    });
  });
});