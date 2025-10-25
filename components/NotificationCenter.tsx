import React, { useState, useEffect } from 'react';
import { notificationService, NotificationHistory } from '../services/NotificationService';
import { userPreferencesService } from '../services/UserPreferencesService';
import { NotificationSettings, ScheduledNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NotificationCenter component provides interface for managing notifications
 * including preferences, history, and testing functionality
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'scheduled' | 'history'>('settings');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    userPreferencesService.getNotificationSettings()
  );
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to preference changes
    const unsubscribePrefs = userPreferencesService.subscribe((preferences) => {
      setNotificationSettings(preferences.notifications);
    });

    // Subscribe to notification history changes
    const unsubscribeHistory = notificationService.subscribe((history) => {
      setNotificationHistory(history);
    });

    // Load initial data
    setScheduledNotifications(notificationService.getScheduledNotifications());
    setNotificationHistory(notificationService.getNotificationHistory());

    return () => {
      unsubscribePrefs();
      unsubscribeHistory();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotificationSettingChange = (settings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...notificationSettings, ...settings };
    userPreferencesService.setNotificationSettings(updatedSettings);
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await notificationService.testNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleCancelNotification = (notificationId: string) => {
    notificationService.cancelNotification(notificationId);
    setScheduledNotifications(notificationService.getScheduledNotifications());
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all notification history? This action cannot be undone.')) {
      notificationService.clearNotificationHistory();
    }
  };

  const formatTime = (date: Date): string => {
    const timeFormat = userPreferencesService.getDisplaySettings().timeFormat;
    return date.toLocaleTimeString([], {
      hour12: timeFormat === '12h',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNotificationTypeIcon = (type: 'prayer' | 'celestial' | 'holiday'): string => {
    switch (type) {
      case 'prayer': return '🕌';
      case 'celestial': return '🌙';
      case 'holiday': return '🎉';
      default: return '🔔';
    }
  };

  const getNotificationTypeColor = (type: 'prayer' | 'celestial' | 'holiday'): string => {
    switch (type) {
      case 'prayer': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'celestial': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'holiday': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-accent-blue bg-accent-blue/10 border-accent-blue/30';
    }
  };

  const getTimeUntilNotification = (notificationTime: Date): string => {
    const now = new Date();
    const diff = notificationTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
    >
      <div
        className="bg-card-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 id="notification-center-title" className="text-2xl font-bold text-accent-blue">
            Notification Center
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-moonlight transition-colors"
            aria-label="Close notification center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-slate-600" role="tablist">
          {[
            { id: 'settings', label: 'Settings', icon: '⚙️' },
            { id: 'scheduled', label: 'Scheduled', icon: '📅', count: scheduledNotifications.length },
            { id: 'history', label: 'History', icon: '📜', count: notificationHistory.length }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-300">Enable Notifications</h4>
                      <p className="text-sm text-slate-400">
                        Allow the app to send you notifications for events and reminders
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.enabled}
                        onChange={(e) => handleNotificationSettingChange({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
                    </label>
                  </div>

                  {notificationSettings.enabled && (
                    <div className="ml-4 space-y-3 border-l-2 border-slate-600 pl-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center">
                          <span className="mr-3">🕌</span>
                          <div>
                            <h5 className="font-medium text-slate-300">Prayer Reminders</h5>
                            <p className="text-xs text-slate-400">Get notified before prayer times</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.prayerReminders}
                          onChange={(e) => handleNotificationSettingChange({ prayerReminders: e.target.checked })}
                          className="text-accent-blue focus:ring-accent-blue"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center">
                          <span className="mr-3">🌙</span>
                          <div>
                            <h5 className="font-medium text-slate-300">Celestial Events</h5>
                            <p className="text-xs text-slate-400">Moon phases and astronomical events</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.celestialEvents}
                          onChange={(e) => handleNotificationSettingChange({ celestialEvents: e.target.checked })}
                          className="text-accent-blue focus:ring-accent-blue"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center">
                          <span className="mr-3">🎉</span>
                          <div>
                            <h5 className="font-medium text-slate-300">Religious Holidays</h5>
                            <p className="text-xs text-slate-400">Important religious observances</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.religiousHolidays}
                          onChange={(e) => handleNotificationSettingChange({ religiousHolidays: e.target.checked })}
                          className="text-accent-blue focus:ring-accent-blue"
                        />
                      </div>

                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <h5 className="font-medium text-slate-300 mb-3">Advance Notice</h5>
                        <p className="text-xs text-slate-400 mb-3">
                          Choose how far in advance you want to be notified
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[5, 10, 15, 30, 60, 120].map((minutes) => (
                            <label key={minutes} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={notificationSettings.advanceNoticeMinutes.includes(minutes)}
                                onChange={(e) => {
                                  const current = notificationSettings.advanceNoticeMinutes;
                                  const updated = e.target.checked
                                    ? [...current, minutes].sort((a, b) => a - b)
                                    : current.filter(m => m !== minutes);
                                  handleNotificationSettingChange({ advanceNoticeMinutes: updated });
                                }}
                                className="mr-1 text-accent-blue focus:ring-accent-blue"
                              />
                              <span className="text-slate-300 text-sm px-2 py-1 bg-slate-700 rounded">
                                {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-600 pt-6">
                <h3 className="text-lg font-semibold text-moonlight mb-4">Test Notifications</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Send a test notification to make sure everything is working properly.
                </p>
                <button
                  onClick={handleTestNotification}
                  disabled={isTestingNotification || !notificationSettings.enabled}
                  className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingNotification ? 'Sending...' : 'Send Test Notification'}
                </button>
              </div>
            </div>
          )}

          {/* Scheduled Notifications Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-moonlight">Scheduled Notifications</h3>
                <span className="text-sm text-slate-400">
                  {scheduledNotifications.length} notification{scheduledNotifications.length !== 1 ? 's' : ''} scheduled
                </span>
              </div>

              {scheduledNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-slate-400">No notifications scheduled</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Notifications will appear here when you have upcoming events
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledNotifications
                    .sort((a, b) => a.notificationTime.getTime() - b.notificationTime.getTime())
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${getNotificationTypeColor(notification.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">
                              {getNotificationTypeIcon(notification.type)}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-300">
                                {notification.eventName}
                              </h4>
                              <div className="text-sm text-slate-400 mt-1">
                                <div>Event: {formatDate(notification.eventTime)} at {formatTime(notification.eventTime)}</div>
                                <div>Notify: {formatDate(notification.notificationTime)} at {formatTime(notification.notificationTime)}</div>
                                <div className="font-medium mt-1">
                                  In {getTimeUntilNotification(notification.notificationTime)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelNotification(notification.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            aria-label="Cancel notification"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-moonlight">Notification History</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-400">
                    {notificationHistory.length} notification{notificationHistory.length !== 1 ? 's' : ''}
                  </span>
                  {notificationHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {notificationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📜</div>
                  <p className="text-slate-400">No notification history</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Delivered notifications will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificationHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${getNotificationTypeColor(item.type)} ${
                        !item.delivered ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">
                          {getNotificationTypeIcon(item.type)}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-300">{item.title}</h4>
                            <span className="text-xs text-slate-500">
                              {formatDate(item.timestamp)} {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{item.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              item.delivered ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                            }`}>
                              {item.delivered ? 'Delivered' : 'Pending'}
                            </span>
                            <span className="text-slate-500 capitalize">{item.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationCenter;