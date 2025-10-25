import { toast } from 'react-toastify';
import { 
  ScheduledNotification, 
  NotificationSettings, 
  PrayerTime, 
  ReligiousEvent, 
  LunarEvent,
  Location 
} from '../types';
import { userPreferencesService } from './UserPreferencesService';
import { locationManager } from './LocationManager';

/**
 * NotificationService
 * 
 * Manages user notifications for prayer times, celestial events, and religious holidays.
 * Handles scheduling, delivery, and notification preferences.
 */

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'prayer' | 'celestial' | 'holiday';
  eventId: string;
  eventTime: Date;
  advanceMinutes: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

export interface NotificationHistory {
  id: string;
  timestamp: Date;
  title: string;
  message: string;
  type: 'prayer' | 'celestial' | 'holiday';
  delivered: boolean;
  dismissed: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationHistory: NotificationHistory[] = [];
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Set<(history: NotificationHistory[]) => void> = new Set();
  private isInitialized = false;

  private constructor() {
    this.loadNotificationData();
    this.initializeNotificationPermissions();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request notification permissions if supported
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }

      // Subscribe to preference changes
      userPreferencesService.subscribe((preferences) => {
        this.handlePreferenceChange(preferences.notifications);
      });

      // Subscribe to location changes to reschedule location-dependent notifications
      locationManager.subscribeToCurrentLocation(() => {
        this.rescheduleLocationDependentNotifications();
      });

      // Clean up expired notifications
      this.cleanupExpiredNotifications();

      // Reschedule existing notifications
      this.rescheduleAllNotifications();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Schedule prayer time notifications
   */
  async schedulePrayerNotifications(prayerTimes: PrayerTime[], date: Date): Promise<void> {
    const settings = userPreferencesService.getNotificationSettings();
    
    if (!settings.enabled || !settings.prayerReminders) {
      return;
    }

    for (const prayer of prayerTimes) {
      for (const advanceMinutes of settings.advanceNoticeMinutes) {
        const notificationId = `prayer-${prayer.name}-${date.toDateString()}-${advanceMinutes}`;
        
        const scheduledNotification: ScheduledNotification = {
          id: notificationId,
          eventId: `prayer-${prayer.name}-${date.toDateString()}`,
          eventName: `${prayer.name} Prayer`,
          eventTime: prayer.time,
          notificationTime: new Date(prayer.time.getTime() - (advanceMinutes * 60 * 1000)),
          type: 'prayer',
          delivered: false
        };

        await this.scheduleNotification(scheduledNotification, {
          title: `${prayer.name} Prayer`,
          message: `${prayer.name} prayer time is in ${advanceMinutes} minutes`,
          type: 'prayer',
          eventId: scheduledNotification.eventId,
          eventTime: prayer.time,
          advanceMinutes,
          actions: [
            {
              label: 'View Qibla',
              action: () => this.showQiblaDirection(prayer.qiblaDirection)
            }
          ]
        });
      }
    }
  }

  /**
   * Schedule celestial event notifications
   */
  async scheduleCelestialNotifications(events: LunarEvent[]): Promise<void> {
    const settings = userPreferencesService.getNotificationSettings();
    
    if (!settings.enabled || !settings.celestialEvents) {
      return;
    }

    for (const event of events) {
      for (const advanceMinutes of settings.advanceNoticeMinutes) {
        const notificationId = `celestial-${event.eventName}-${event.utcDate.toISOString()}-${advanceMinutes}`;
        
        const scheduledNotification: ScheduledNotification = {
          id: notificationId,
          eventId: `celestial-${event.eventName}-${event.utcDate.toISOString()}`,
          eventName: event.eventName,
          eventTime: event.localSolarDate,
          notificationTime: new Date(event.localSolarDate.getTime() - (advanceMinutes * 60 * 1000)),
          type: 'celestial',
          delivered: false
        };

        await this.scheduleNotification(scheduledNotification, {
          title: event.eventName,
          message: `${event.eventName} is in ${advanceMinutes} minutes`,
          type: 'celestial',
          eventId: scheduledNotification.eventId,
          eventTime: event.localSolarDate,
          advanceMinutes,
          persistent: true
        });
      }
    }
  }

  /**
   * Schedule religious holiday notifications
   */
  async scheduleReligiousHolidayNotifications(events: ReligiousEvent[]): Promise<void> {
    const settings = userPreferencesService.getNotificationSettings();
    
    if (!settings.enabled || !settings.religiousHolidays) {
      return;
    }

    for (const event of events) {
      for (const advanceMinutes of settings.advanceNoticeMinutes) {
        const notificationId = `holiday-${event.id}-${advanceMinutes}`;
        
        const scheduledNotification: ScheduledNotification = {
          id: notificationId,
          eventId: event.id,
          eventName: event.name,
          eventTime: event.date,
          notificationTime: new Date(event.date.getTime() - (advanceMinutes * 60 * 1000)),
          type: 'holiday',
          delivered: false
        };

        await this.scheduleNotification(scheduledNotification, {
          title: event.name,
          message: `${event.name} is in ${advanceMinutes} minutes - ${event.significance}`,
          type: 'holiday',
          eventId: event.id,
          eventTime: event.date,
          advanceMinutes,
          persistent: true
        });
      }
    }
  }

  /**
   * Schedule a single notification
   */
  private async scheduleNotification(
    scheduledNotification: ScheduledNotification,
    options: NotificationOptions
  ): Promise<void> {
    // Don't schedule notifications for past times
    if (scheduledNotification.notificationTime <= new Date()) {
      return;
    }

    // Store the scheduled notification
    this.scheduledNotifications.set(scheduledNotification.id, scheduledNotification);

    // Calculate delay until notification time
    const delay = scheduledNotification.notificationTime.getTime() - Date.now();

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      this.deliverNotification(scheduledNotification, options);
    }, delay);

    // Store timeout ID for potential cancellation
    this.activeTimeouts.set(scheduledNotification.id, timeoutId);

    // Save to storage
    this.saveNotificationData();
  }

  /**
   * Deliver a notification
   */
  private async deliverNotification(
    scheduledNotification: ScheduledNotification,
    options: NotificationOptions
  ): Promise<void> {
    try {
      // Mark as delivered
      scheduledNotification.delivered = true;
      this.scheduledNotifications.set(scheduledNotification.id, scheduledNotification);

      // Show toast notification
      const toastOptions = {
        position: 'top-right' as const,
        autoClose: options.persistent ? false : 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };

      let toastId: string | number;

      switch (options.type) {
        case 'prayer':
          toastId = toast.info(`🕌 ${options.title}\n${options.message}`, toastOptions);
          break;
        case 'celestial':
          toastId = toast.success(`🌙 ${options.title}\n${options.message}`, toastOptions);
          break;
        case 'holiday':
          toastId = toast.warning(`🎉 ${options.title}\n${options.message}`, toastOptions);
          break;
        default:
          toastId = toast(`${options.title}\n${options.message}`, toastOptions);
      }

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(options.title, {
          body: options.message,
          icon: this.getNotificationIcon(options.type),
          tag: scheduledNotification.id,
          requireInteraction: options.persistent
        });

        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };

        // Auto-close browser notification after 10 seconds if not persistent
        if (!options.persistent) {
          setTimeout(() => {
            browserNotification.close();
          }, 10000);
        }
      }

      // Add to history
      const historyEntry: NotificationHistory = {
        id: scheduledNotification.id,
        timestamp: new Date(),
        title: options.title,
        message: options.message,
        type: options.type,
        delivered: true,
        dismissed: false
      };

      this.notificationHistory.unshift(historyEntry);
      
      // Keep only last 100 notifications in history
      if (this.notificationHistory.length > 100) {
        this.notificationHistory = this.notificationHistory.slice(0, 100);
      }

      // Clean up
      this.activeTimeouts.delete(scheduledNotification.id);
      this.saveNotificationData();
      this.notifyHistoryListeners();

    } catch (error) {
      console.error('Failed to deliver notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notificationId: string): void {
    const timeout = this.activeTimeouts.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(notificationId);
    }

    this.scheduledNotifications.delete(notificationId);
    this.saveNotificationData();
  }

  /**
   * Cancel all notifications of a specific type
   */
  cancelNotificationsByType(type: 'prayer' | 'celestial' | 'holiday'): void {
    const toCancel: string[] = [];
    
    for (const [id, notification] of this.scheduledNotifications) {
      if (notification.type === type) {
        toCancel.push(id);
      }
    }

    toCancel.forEach(id => this.cancelNotification(id));
  }

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): NotificationHistory[] {
    return [...this.notificationHistory];
  }

  /**
   * Clear notification history
   */
  clearNotificationHistory(): void {
    this.notificationHistory = [];
    this.saveNotificationData();
    this.notifyHistoryListeners();
  }

  /**
   * Test notification system
   */
  async testNotification(): Promise<void> {
    const testNotification: ScheduledNotification = {
      id: `test-${Date.now()}`,
      eventId: 'test-event',
      eventName: 'Test Notification',
      eventTime: new Date(),
      notificationTime: new Date(),
      type: 'celestial',
      delivered: false
    };

    await this.deliverNotification(testNotification, {
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      type: 'celestial',
      eventId: 'test-event',
      eventTime: new Date(),
      advanceMinutes: 0
    });
  }

  /**
   * Subscribe to notification history changes
   */
  subscribe(listener: (history: NotificationHistory[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Handle preference changes
   */
  private handlePreferenceChange(settings: NotificationSettings): void {
    if (!settings.enabled) {
      // Cancel all notifications if disabled
      this.cancelAllNotifications();
    } else {
      // Reschedule notifications with new settings
      this.rescheduleAllNotifications();
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  private cancelAllNotifications(): void {
    for (const timeoutId of this.activeTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    
    this.activeTimeouts.clear();
    this.scheduledNotifications.clear();
    this.saveNotificationData();
  }

  /**
   * Reschedule all notifications (useful after settings change)
   */
  private rescheduleAllNotifications(): void {
    // This would typically be called by the main application
    // when prayer times or celestial events are recalculated
    console.log('Notification rescheduling requested - application should refresh data');
  }

  /**
   * Reschedule location-dependent notifications
   */
  private rescheduleLocationDependentNotifications(): void {
    // Cancel existing prayer time notifications as they depend on location
    this.cancelNotificationsByType('prayer');
    
    // The application should recalculate prayer times for the new location
    console.log('Location changed - prayer time notifications need to be rescheduled');
  }

  /**
   * Clean up expired notifications
   */
  private cleanupExpiredNotifications(): void {
    const now = new Date();
    const toRemove: string[] = [];

    for (const [id, notification] of this.scheduledNotifications) {
      // Remove notifications that are more than 24 hours past their event time
      if (notification.eventTime.getTime() < now.getTime() - (24 * 60 * 60 * 1000)) {
        toRemove.push(id);
      }
    }

    toRemove.forEach(id => {
      this.cancelNotification(id);
    });
  }

  /**
   * Initialize notification permissions
   */
  private async initializeNotificationPermissions(): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Don't request permission immediately, let user enable notifications first
        console.log('Notification permission not yet requested');
      }
    }
  }

  /**
   * Get notification icon based on type
   */
  private getNotificationIcon(type: 'prayer' | 'celestial' | 'holiday'): string {
    // Return appropriate icon URLs or data URIs
    switch (type) {
      case 'prayer':
        return '/icons/prayer-icon.png';
      case 'celestial':
        return '/icons/moon-icon.png';
      case 'holiday':
        return '/icons/celebration-icon.png';
      default:
        return '/icons/default-icon.png';
    }
  }

  /**
   * Show Qibla direction (for prayer notifications)
   */
  private showQiblaDirection(qiblaDirection?: number): void {
    if (qiblaDirection !== undefined) {
      toast.info(`🧭 Qibla Direction: ${Math.round(qiblaDirection)}° from North`, {
        position: 'top-center',
        autoClose: 8000
      });
    }
  }

  /**
   * Load notification data from storage
   */
  private loadNotificationData(): void {
    try {
      const stored = localStorage.getItem('celestial-app-notifications');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Load scheduled notifications
        if (data.scheduled) {
          for (const notification of data.scheduled) {
            // Convert date strings back to Date objects
            notification.eventTime = new Date(notification.eventTime);
            notification.notificationTime = new Date(notification.notificationTime);
            this.scheduledNotifications.set(notification.id, notification);
          }
        }

        // Load notification history
        if (data.history) {
          this.notificationHistory = data.history.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load notification data:', error);
    }
  }

  /**
   * Save notification data to storage
   */
  private saveNotificationData(): void {
    try {
      const data = {
        scheduled: Array.from(this.scheduledNotifications.values()),
        history: this.notificationHistory,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('celestial-app-notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notification data:', error);
    }
  }

  /**
   * Notify history listeners
   */
  private notifyHistoryListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notificationHistory]);
      } catch (error) {
        console.error('Error in notification history listener:', error);
      }
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();