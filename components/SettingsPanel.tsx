import React, { useState, useEffect } from 'react';
import {
  ReligiousTradition,
  IslamicCalculationMethod,
  JewishCalculationMethod,
  Madhab,
  IslamicCalculationConfig,
  JewishCalculationConfig,
  NotificationSettings,
  DisplaySettings,
  UserPreferences
} from '../types';
import { userPreferencesService } from '../services/UserPreferencesService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SettingsPanel component provides user interface for managing preferences
 * including religious tradition selection and calculation method configuration
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(userPreferencesService.getPreferences());
  const [activeTab, setActiveTab] = useState<'traditions' | 'calculations' | 'notifications' | 'display'>('traditions');

  useEffect(() => {
    const unsubscribe = userPreferencesService.subscribe(setPreferences);
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleTraditionToggle = (tradition: ReligiousTradition) => {
    if (preferences.selectedTraditions.includes(tradition)) {
      userPreferencesService.removeTradition(tradition);
    } else {
      userPreferencesService.addTradition(tradition);
    }
  };

  const handleIslamicConfigChange = (config: Partial<IslamicCalculationConfig>) => {
    const currentConfig = userPreferencesService.getIslamicCalculation() || {
      method: 'MuslimWorldLeague',
      madhab: 'shafi'
    };
    userPreferencesService.setIslamicCalculation({ ...currentConfig, ...config });
  };

  const handleJewishConfigChange = (config: Partial<JewishCalculationConfig>) => {
    const currentConfig = userPreferencesService.getJewishCalculation() || {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 42,
      useElevation: false
    };
    userPreferencesService.setJewishCalculation({ ...currentConfig, ...config });
  };

  const handleNotificationChange = (settings: Partial<NotificationSettings>) => {
    const currentSettings = userPreferencesService.getNotificationSettings();
    userPreferencesService.setNotificationSettings({ ...currentSettings, ...settings });
  };

  const handleDisplayChange = (settings: Partial<DisplaySettings>) => {
    const currentSettings = userPreferencesService.getDisplaySettings();
    userPreferencesService.setDisplaySettings({ ...currentSettings, ...settings });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      userPreferencesService.resetToDefaults();
    }
  };

  const handleExport = () => {
    const exportData = userPreferencesService.exportPreferences();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celestial-app-preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = userPreferencesService.importPreferences(content);
        if (success) {
          alert('Preferences imported successfully!');
        } else {
          alert('Failed to import preferences. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getTraditionIcon = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam': return '☪️';
      case 'judaism': return '✡️';
      case 'christianity': return '✝️';
      default: return '📿';
    }
  };

  const getTraditionColor = (tradition: ReligiousTradition): string => {
    switch (tradition) {
      case 'islam': return 'border-green-400 bg-green-400/10 text-green-400';
      case 'judaism': return 'border-blue-400 bg-blue-400/10 text-blue-400';
      case 'christianity': return 'border-purple-400 bg-purple-400/10 text-purple-400';
      default: return 'border-accent-blue bg-accent-blue/10 text-accent-blue';
    }
  };

  const islamicMethods: { value: IslamicCalculationMethod; label: string }[] = [
    { value: 'MuslimWorldLeague', label: 'Muslim World League' },
    { value: 'Egyptian', label: 'Egyptian General Authority' },
    { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
    { value: 'UmmAlQura', label: 'Umm Al-Qura University, Makkah' },
    { value: 'Dubai', label: 'Dubai (unofficial)' },
    { value: 'MoonsightingCommittee', label: 'Moonsighting Committee Worldwide' },
    { value: 'NorthAmerica', label: 'Islamic Society of North America (ISNA)' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Tehran', label: 'Institute of Geophysics, University of Tehran' },
    { value: 'Turkey', label: 'Diyanet İşleri Başkanlığı, Turkey' }
  ];

  const jewishMethods: { value: JewishCalculationMethod; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'geonim', label: 'Geonim' },
    { value: 'magen_avraham', label: 'Magen Avraham' }
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-card-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 id="settings-title" className="text-2xl font-bold text-accent-blue">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-moonlight transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-slate-600" role="tablist">
          {[
            { id: 'traditions', label: 'Religious Traditions', icon: '🕊️' },
            { id: 'calculations', label: 'Calculation Methods', icon: '🧮' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'display', label: 'Display', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
                : 'text-slate-400 hover:text-slate-300'
                }`}
              onClick={() => setActiveTab(tab.id as any)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Religious Traditions Tab */}
          {activeTab === 'traditions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Select Religious Traditions</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Choose which religious traditions you'd like to see prayer times and observances for.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['islam', 'judaism', 'christianity'] as ReligiousTradition[]).map((tradition) => {
                    const isSelected = preferences.selectedTraditions.includes(tradition);
                    return (
                      <button
                        key={tradition}
                        onClick={() => handleTraditionToggle(tradition)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                          ? getTraditionColor(tradition)
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                          }`}
                        aria-pressed={isSelected}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{getTraditionIcon(tradition)}</div>
                          <div className="font-semibold capitalize">{tradition}</div>
                          {isSelected && (
                            <div className="text-xs mt-2 opacity-75">Active</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Calculation Methods Tab */}
          {activeTab === 'calculations' && (
            <div className="space-y-8">
              {/* Islamic Calculations */}
              {preferences.selectedTraditions.includes('islam') && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Islamic Prayer Time Calculations</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Calculation Method
                      </label>
                      <select
                        value={preferences.islamicCalculation?.method || 'MuslimWorldLeague'}
                        onChange={(e) => handleIslamicConfigChange({ method: e.target.value as IslamicCalculationMethod })}
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-green-400 focus:outline-none"
                      >
                        {islamicMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Madhab (Jurisprudence School)
                      </label>
                      <div className="flex space-x-4">
                        {(['shafi', 'hanafi'] as Madhab[]).map((madhab) => (
                          <label key={madhab} className="flex items-center">
                            <input
                              type="radio"
                              name="madhab"
                              value={madhab}
                              checked={preferences.islamicCalculation?.madhab === madhab}
                              onChange={(e) => handleIslamicConfigChange({ madhab: e.target.value as Madhab })}
                              className="mr-2 text-green-400 focus:ring-green-400"
                            />
                            <span className="text-slate-300 capitalize">{madhab}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jewish Calculations */}
              {preferences.selectedTraditions.includes('judaism') && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Jewish Prayer Time Calculations</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Calculation Method
                      </label>
                      <select
                        value={preferences.jewishCalculation?.method || 'standard'}
                        onChange={(e) => handleJewishConfigChange({ method: e.target.value as JewishCalculationMethod })}
                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-blue-400 focus:outline-none"
                      >
                        {jewishMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Candle Lighting (minutes before sunset)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={preferences.jewishCalculation?.candleLightingMinutes || 18}
                          onChange={(e) => handleJewishConfigChange({ candleLightingMinutes: parseInt(e.target.value) })}
                          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Havdalah (minutes after sunset)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={preferences.jewishCalculation?.havdalahMinutes || 42}
                          onChange={(e) => handleJewishConfigChange({ havdalahMinutes: parseInt(e.target.value) })}
                          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.jewishCalculation?.useElevation || false}
                          onChange={(e) => handleJewishConfigChange({ useElevation: e.target.checked })}
                          className="mr-2 text-blue-400 focus:ring-blue-400"
                        />
                        <span className="text-slate-300">Use elevation in calculations</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {preferences.selectedTraditions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    Select religious traditions in the first tab to configure calculation methods.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Notification Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.enabled}
                        onChange={(e) => handleNotificationChange({ enabled: e.target.checked })}
                        className="mr-3 text-accent-blue focus:ring-accent-blue"
                      />
                      <span className="text-slate-300 font-medium">Enable notifications</span>
                    </label>
                  </div>

                  {preferences.notifications.enabled && (
                    <div className="ml-6 space-y-3 border-l-2 border-slate-600 pl-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.prayerReminders}
                          onChange={(e) => handleNotificationChange({ prayerReminders: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Prayer time reminders</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.celestialEvents}
                          onChange={(e) => handleNotificationChange({ celestialEvents: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Celestial events</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.religiousHolidays}
                          onChange={(e) => handleNotificationChange({ religiousHolidays: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Religious holidays</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Advance notice (minutes)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[5, 10, 15, 30, 60].map((minutes) => (
                            <label key={minutes} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={preferences.notifications.advanceNoticeMinutes.includes(minutes)}
                                onChange={(e) => {
                                  const current = preferences.notifications.advanceNoticeMinutes;
                                  const updated = e.target.checked
                                    ? [...current, minutes].sort((a, b) => a - b)
                                    : current.filter(m => m !== minutes);
                                  handleNotificationChange({ advanceNoticeMinutes: updated });
                                }}
                                className="mr-1 text-accent-blue focus:ring-accent-blue"
                              />
                              <span className="text-slate-300 text-sm">{minutes}m</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Display Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.displaySettings.theme}
                      onChange={(e) => handleDisplayChange({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                    >
                      <option value="auto">Auto (System)</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Time Format
                    </label>
                    <select
                      value={preferences.displaySettings.timeFormat}
                      onChange={(e) => handleDisplayChange({ timeFormat: e.target.value as '12h' | '24h' })}
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={preferences.displaySettings.fontSize}
                      onChange={(e) => handleDisplayChange({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.displaySettings.language}
                      onChange={(e) => handleDisplayChange({ language: e.target.value })}
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="he">עברית (Hebrew)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.displaySettings.showAstronomicalBasis}
                      onChange={(e) => handleDisplayChange({ showAstronomicalBasis: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">Show astronomical basis for religious events</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.displaySettings.showCalculationMethods}
                      onChange={(e) => handleDisplayChange({ showCalculationMethods: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">Show calculation methods</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.displaySettings.highContrastMode}
                      onChange={(e) => handleDisplayChange({ highContrastMode: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">High contrast mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-center p-6 border-t border-slate-600">
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Export Settings
            </button>

            <label className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm cursor-pointer">
              Import Settings
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
            >
              Reset to Defaults
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPanel;