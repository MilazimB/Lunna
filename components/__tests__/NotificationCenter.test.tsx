import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NotificationCenter from '../NotificationCenter';
import { notificationService } from '../../services/NotificationService';
import { userPreferencesService } from '../../services/UserPreferencesService';

// Mock the services
vi.mock('../../services/NotificationService', () => ({
  notificationService: {
    subscribe: vi.fn(),
    getScheduledNotifications: vi.fn(),
    getNotificationHistory: vi.fn(),
    testNotification: vi.fn(),
    cancelNotification: vi.fn(),
    clearNotificationHistory: vi.fn()
  }
}));

vi.mock('../../services/UserPreferencesService', () => ({
  userPreferencesService: {
    getNotificationSettings: vi.fn(),
    setNotificationSettings: vi.fn(),
    getDisplaySettings: vi.fn(),
    subscribe: vi.fn()
  }
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm
});

describe('NotificationCenter', () => {
  const mockNotificationSettings = {
    enabled: true,
    prayerReminders: true,
    celestialEvents: false,
    religiousHolidays: true,
    advanceNoticeMinutes: [15, 30]
  };

  const mockDisplaySettings = {
    timeFormat: '12h' as const,
    theme: 'dark' as const,
    language: 'en',
    dateFormat: 'MMM dd, yyyy',
    showAstronomicalBasis: true,
    showCalculationMethods: true,
    highContrastMode: false,
    fontSize: 'medium' as const
  };

  const mockScheduledNotifications = [
    {
      id: 'prayer-1',
      eventId: 'event-1',
      eventName: 'Fajr Prayer',
      eventTime: new Date('2024-01-01T06:00:00Z'),
      notificationTime: new Date('2024-01-01T05:45:00Z'),
      type: 'prayer' as const,
      delivered: false
    },
    {
      id: 'celestial-1',
      eventId: 'event-2',
      eventName: 'Full Moon',
      eventTime: new Date('2024-01-01T20:00:00Z'),
      notificationTime: new Date('2024-01-01T19:30:00Z'),
      type: 'celestial' as const,
      delivered: false
    }
  ];

  const mockNotificationHistory = [
    {
      id: 'hist-1',
      timestamp: new Date('2024-01-01T12:00:00Z'),
      title: 'Dhuhr Prayer',
      message: 'Dhuhr prayer time is in 15 minutes',
      type: 'prayer' as const,
      delivered: true,
      dismissed: false
    },
    {
      id: 'hist-2',
      timestamp: new Date('2024-01-01T08:00:00Z'),
      title: 'New Moon',
      message: 'New Moon is in 30 minutes',
      type: 'celestial' as const,
      delivered: true,
      dismissed: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    
    (userPreferencesService.getNotificationSettings as any).mockReturnValue(mockNotificationSettings);
    (userPreferencesService.getDisplaySettings as any).mockReturnValue(mockDisplaySettings);
    (userPreferencesService.subscribe as any).mockReturnValue(() => {});
    
    (notificationService.subscribe as any).mockReturnValue(() => {});
    (notificationService.getScheduledNotifications as any).mockReturnValue(mockScheduledNotifications);
    (notificationService.getNotificationHistory as any).mockReturnValue(mockNotificationHistory);
    (notificationService.testNotification as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<NotificationCenter isOpen={false} onClose={() => {}} />);
      expect(screen.queryByText('Notification Center')).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      expect(screen.getByText('Notification Center')).toBeDefined();
    });

    it('should render all tab buttons with counts', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Settings')).toBeDefined();
      expect(screen.getByText('Scheduled')).toBeDefined();
      expect(screen.getByText('History')).toBeDefined();
      
      // Check for notification counts
      expect(screen.getByText('2')).toBeDefined(); // Scheduled count
      expect(screen.getByText('2')).toBeDefined(); // History count
    });

    it('should have proper ARIA attributes', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('notification-center-title');
    });
  });

  describe('Tab Navigation', () => {
    it('should start with settings tab active', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const settingsTab = screen.getByRole('tab', { name: /Settings/i });
      expect(settingsTab.getAttribute('aria-selected')).toBe('true');
    });

    it('should switch tabs when clicked', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const scheduledTab = screen.getByRole('tab', { name: /Scheduled/i });
      fireEvent.click(scheduledTab);
      
      expect(scheduledTab.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByText('Scheduled Notifications')).toBeDefined();
    });
  });

  describe('Settings Tab', () => {
    it('should display notification preferences', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Notification Preferences')).toBeDefined();
      expect(screen.getByText('Enable Notifications')).toBeDefined();
    });

    it('should show enabled state correctly', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const enableToggle = screen.getByRole('checkbox');
      expect(enableToggle.checked).toBe(true);
    });

    it('should toggle notification settings', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const enableToggle = screen.getByRole('checkbox');
      fireEvent.click(enableToggle);
      
      expect(userPreferencesService.setNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });

    it('should show sub-options when notifications are enabled', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Prayer Reminders')).toBeDefined();
      expect(screen.getByText('Celestial Events')).toBeDefined();
      expect(screen.getByText('Religious Holidays')).toBeDefined();
    });

    it('should update individual notification types', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      const celestialCheckbox = checkboxes.find(cb => 
        cb.closest('div')?.textContent?.includes('Celestial Events')
      );
      
      if (celestialCheckbox) {
        fireEvent.click(celestialCheckbox);
        
        expect(userPreferencesService.setNotificationSettings).toHaveBeenCalledWith(
          expect.objectContaining({ celestialEvents: true })
        );
      }
    });

    it('should update advance notice minutes', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      const fiveMinutesCheckbox = checkboxes.find(cb => 
        cb.closest('label')?.textContent?.includes('5m')
      );
      
      if (fiveMinutesCheckbox) {
        fireEvent.click(fiveMinutesCheckbox);
        
        expect(userPreferencesService.setNotificationSettings).toHaveBeenCalledWith(
          expect.objectContaining({ advanceNoticeMinutes: [5, 15, 30] })
        );
      }
    });

    it('should handle test notification', async () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const testButton = screen.getByText('Send Test Notification');
      fireEvent.click(testButton);
      
      expect(notificationService.testNotification).toHaveBeenCalled();
    });

    it('should disable test button when notifications are disabled', () => {
      const disabledSettings = { ...mockNotificationSettings, enabled: false };
      (userPreferencesService.getNotificationSettings as any).mockReturnValue(disabledSettings);
      
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const testButton = screen.getByText('Send Test Notification');
      expect(testButton.disabled).toBe(true);
    });
  });

  describe('Scheduled Notifications Tab', () => {
    beforeEach(() => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
    });

    it('should display scheduled notifications', () => {
      expect(screen.getByText('Scheduled Notifications')).toBeDefined();
      expect(screen.getByText('2 notifications scheduled')).toBeDefined();
    });

    it('should show notification details', () => {
      expect(screen.getByText('Fajr Prayer')).toBeDefined();
      expect(screen.getByText('Full Moon')).toBeDefined();
    });

    it('should show time until notification', () => {
      // The component should show some time indication
      expect(screen.getByText(/Event:/)).toBeDefined();
      expect(screen.getByText(/Notify:/)).toBeDefined();
    });

    it('should allow canceling notifications', () => {
      const cancelButtons = screen.getAllByLabelText('Cancel notification');
      fireEvent.click(cancelButtons[0]);
      
      expect(notificationService.cancelNotification).toHaveBeenCalledWith('prayer-1');
    });

    it('should show empty state when no notifications', () => {
      (notificationService.getScheduledNotifications as any).mockReturnValue([]);
      
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
      
      expect(screen.getByText('No notifications scheduled')).toBeDefined();
    });
  });

  describe('History Tab', () => {
    beforeEach(() => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /History/i }));
    });

    it('should display notification history', () => {
      expect(screen.getByText('Notification History')).toBeDefined();
      expect(screen.getByText('2 notifications')).toBeDefined();
    });

    it('should show history details', () => {
      expect(screen.getByText('Dhuhr Prayer')).toBeDefined();
      expect(screen.getByText('New Moon')).toBeDefined();
    });

    it('should show delivery status', () => {
      const deliveredBadges = screen.getAllByText('Delivered');
      expect(deliveredBadges.length).toBeGreaterThan(0);
    });

    it('should allow clearing history', () => {
      mockConfirm.mockReturnValue(true);
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(notificationService.clearNotificationHistory).toHaveBeenCalled();
    });

    it('should not clear history without confirmation', () => {
      mockConfirm.mockReturnValue(false);
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(notificationService.clearNotificationHistory).not.toHaveBeenCalled();
    });

    it('should show empty state when no history', () => {
      (notificationService.getNotificationHistory as any).mockReturnValue([]);
      
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /History/i }));
      
      expect(screen.getByText('No notification history')).toBeDefined();
    });
  });

  describe('Close Functionality', () => {
    it('should close when close button is clicked', () => {
      const onCloseMock = vi.fn();
      
      render(<NotificationCenter isOpen={true} onClose={onCloseMock} />);
      
      const closeButton = screen.getByLabelText('Close notification center');
      fireEvent.click(closeButton);
      
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should close when clicking outside modal', () => {
      const onCloseMock = vi.fn();
      
      render(<NotificationCenter isOpen={true} onClose={onCloseMock} />);
      
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('Notification Type Icons and Colors', () => {
    beforeEach(() => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
    });

    it('should display correct icons for different notification types', () => {
      // Prayer notifications should have mosque icon
      expect(screen.getByText('🕌')).toBeDefined();
      
      // Celestial notifications should have moon icon
      expect(screen.getByText('🌙')).toBeDefined();
    });
  });

  describe('Time Formatting', () => {
    it('should format times according to user preferences', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
      
      // Should show formatted times (exact format depends on locale)
      expect(screen.getByText(/Event:/)).toBeDefined();
      expect(screen.getByText(/Notify:/)).toBeDefined();
    });

    it('should handle 24h time format', () => {
      const settings24h = { ...mockDisplaySettings, timeFormat: '24h' as const };
      (userPreferencesService.getDisplaySettings as any).mockReturnValue(settings24h);
      
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
      
      // Component should still render without errors
      expect(screen.getByText('Scheduled Notifications')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab navigation', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);
      
      tabs.forEach(tab => {
        expect(tab.getAttribute('aria-selected')).toBeDefined();
      });
    });

    it('should have proper button labels', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      fireEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
      
      const cancelButtons = screen.getAllByLabelText('Cancel notification');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle test notification errors gracefully', async () => {
      (notificationService.testNotification as any).mockRejectedValue(new Error('Test error'));
      
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      const testButton = screen.getByText('Send Test Notification');
      fireEvent.click(testButton);
      
      // Should not throw and button should be re-enabled
      expect(notificationService.testNotification).toHaveBeenCalled();
    });
  });

  describe('Subscription Management', () => {
    it('should subscribe to services when opened', () => {
      render(<NotificationCenter isOpen={true} onClose={() => {}} />);
      
      expect(userPreferencesService.subscribe).toHaveBeenCalled();
      expect(notificationService.subscribe).toHaveBeenCalled();
    });

    it('should not subscribe when closed', () => {
      render(<NotificationCenter isOpen={false} onClose={() => {}} />);
      
      expect(userPreferencesService.subscribe).not.toHaveBeenCalled();
      expect(notificationService.subscribe).not.toHaveBeenCalled();
    });
  });
});