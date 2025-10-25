import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  ExportService,
  ExportOptions,
  ExportData,
  ExportFormat,
  ExportResult,
  exportService
} from '../services/ExportService';
import {
  ReligiousEvent,
  PrayerTime,
  LunarEvent,
  EnhancedLunarEvent,
  Location,
  ExportRecord,
  ReligiousTradition
} from '../types';

interface ExportManagerProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ExportData;
  location?: Location;
  singleEvent?: ReligiousEvent | PrayerTime | LunarEvent | EnhancedLunarEvent;
}

/**
 * ExportManager component provides user interface for exporting and sharing
 * religious events, prayer times, and astronomical data
 */
const ExportManager: React.FC<ExportManagerProps> = ({
  isOpen,
  onClose,
  data,
  location,
  singleEvent
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'ics',
    includeReligiousEvents: true,
    includePrayerTimes: true,
    includeLunarEvents: true
  });

  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'export' | 'share' | 'history'>('export');
  const [shareText, setShareText] = useState('');
  const [privacySettings, setPrivacySettings] = useState({
    includeLocation: true,
    includeCalculationMethods: true,
    includePersonalNotes: false
  });

  useEffect(() => {
    if (isOpen) {
      setExportHistory(exportService.getExportHistory());
      
      // If single event is provided, configure for single event export
      if (singleEvent) {
        setActiveTab('share');
        generateShareText(singleEvent);
      }
    }
  }, [isOpen, singleEvent]);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!data && !singleEvent) {
      toast.error('No data available for export');
      return;
    }

    setIsExporting(true);

    try {
      const options: ExportOptions = {
        ...exportOptions,
        dateRange: exportOptions.format !== 'ics' || !singleEvent ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined,
        location: privacySettings.includeLocation ? location : undefined,
        metadata: {
          calculationMethods: privacySettings.includeCalculationMethods ? getCalculationMethods() : undefined,
          traditions: getSelectedTraditions(),
          notes: privacySettings.includePersonalNotes ? 'Exported from Celestial Events Calculator' : undefined
        }
      };

      let result: ExportResult;

      if (singleEvent) {
        result = await exportService.exportSingleEvent(singleEvent, exportOptions.format);
      } else if (data) {
        result = await exportService.exportData(data, options);
      } else {
        throw new Error('No data to export');
      }

      if (result.success && result.data) {
        downloadFile(result.data, result.filename, result.mimeType);
        toast.success(`Successfully exported ${result.record.eventCount} events`);
        setExportHistory(exportService.getExportHistory());
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!singleEvent) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: getEventTitle(singleEvent),
          text: shareText,
          url: window.location.href
        });
        toast.success('Shared successfully');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard');
      }
    } catch (error) {
      // Fallback to manual copy
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Copied to clipboard');
    }
  };

  const generateShareText = (event: ReligiousEvent | PrayerTime | LunarEvent | EnhancedLunarEvent) => {
    let text = '';

    if ('tradition' in event && 'calculationMethod' in event) {
      // Prayer time
      const prayer = event as PrayerTime;
      text = `🕌 ${prayer.name} Prayer\n`;
      text += `📅 ${prayer.time.toLocaleDateString()}\n`;
      text += `⏰ ${prayer.time.toLocaleTimeString()}\n`;
      text += `📿 Tradition: ${prayer.tradition}\n`;
      text += `🧮 Method: ${prayer.calculationMethod}\n`;
      if (prayer.qiblaDirection) {
        text += `🧭 Qibla: ${prayer.qiblaDirection.toFixed(1)}°\n`;
      }
    } else if ('tradition' in event) {
      // Religious event
      const religious = event as ReligiousEvent;
      text = `${getTraditionIcon(religious.tradition)} ${religious.name}\n`;
      text += `📅 ${religious.date.toLocaleDateString()}\n`;
      if (religious.localTime) {
        text += `⏰ ${religious.localTime.toLocaleTimeString()}\n`;
      }
      text += `📿 Tradition: ${religious.tradition}\n`;
      text += `📝 ${religious.description}\n`;
      if (religious.significance) {
        text += `✨ ${religious.significance}\n`;
      }
    } else {
      // Lunar event
      const lunar = event as LunarEvent;
      text = `🌙 ${lunar.eventName}\n`;
      text += `📅 ${lunar.localSolarDate.toLocaleDateString()}\n`;
      text += `⏰ ${lunar.localSolarDate.toLocaleTimeString()}\n`;
      text += `🌌 UTC: ${lunar.utcDate.toISOString()}\n`;
      if (lunar.accuracyNote) {
        text += `📊 ${lunar.accuracyNote}\n`;
      }
    }

    if (location && privacySettings.includeLocation) {
      text += `📍 Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}\n`;
    }

    text += `\n🔗 Generated by Celestial Events Calculator`;

    setShareText(text);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEventTitle = (event: ReligiousEvent | PrayerTime | LunarEvent | EnhancedLunarEvent): string => {
    if ('tradition' in event && 'calculationMethod' in event) {
      return `${(event as PrayerTime).name} Prayer`;
    } else if ('tradition' in event) {
      return (event as ReligiousEvent).name;
    } else {
      return (event as LunarEvent).eventName;
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

  const getCalculationMethods = (): string[] => {
    const methods: string[] = [];
    if (data?.prayerTimes.length) {
      const uniqueMethods = [...new Set(data.prayerTimes.map(p => p.calculationMethod))];
      methods.push(...uniqueMethods);
    }
    return methods;
  };

  const getSelectedTraditions = (): string[] => {
    const traditions: string[] = [];
    if (data?.religiousEvents.length) {
      const uniqueTraditions = [...new Set(data.religiousEvents.map(e => e.tradition))];
      traditions.push(...uniqueTraditions);
    }
    if (data?.prayerTimes.length) {
      const uniqueTraditions = [...new Set(data.prayerTimes.map(p => p.tradition))];
      traditions.push(...uniqueTraditions.filter(t => !traditions.includes(t)));
    }
    return traditions;
  };

  const getEventCount = (): number => {
    if (singleEvent) return 1;
    if (!data) return 0;
    
    let count = 0;
    if (exportOptions.includeReligiousEvents) count += data.religiousEvents.length;
    if (exportOptions.includePrayerTimes) count += data.prayerTimes.length;
    if (exportOptions.includeLunarEvents) count += data.lunarEvents.length;
    return count;
  };

  const formatFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
    >
      <div
        className="bg-card-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 id="export-title" className="text-2xl font-bold text-accent-blue">
            {singleEvent ? 'Share Event' : 'Export & Share'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-moonlight transition-colors"
            aria-label="Close export manager"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-slate-600" role="tablist">
          {[
            { id: 'export', label: 'Export Data', icon: '📥' },
            { id: 'share', label: 'Quick Share', icon: '📤' },
            { id: 'history', label: 'Export History', icon: '📋' }
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
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Export Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {([
                    { format: 'ics', label: 'Calendar (ICS)', description: 'Import into calendar apps', icon: '📅' },
                    { format: 'json', label: 'JSON Data', description: 'Structured data format', icon: '📄' },
                    { format: 'csv', label: 'Spreadsheet (CSV)', description: 'Open in Excel or Sheets', icon: '📊' }
                  ] as const).map((option) => (
                    <button
                      key={option.format}
                      onClick={() => setExportOptions({ ...exportOptions, format: option.format })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${exportOptions.format === option.format
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                        }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm opacity-75">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {!singleEvent && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-moonlight mb-4">Data Selection</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeReligiousEvents}
                          onChange={(e) => setExportOptions({ ...exportOptions, includeReligiousEvents: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Religious events and holidays</span>
                        {data && (
                          <span className="ml-2 text-sm text-slate-400">({data.religiousEvents.length} events)</span>
                        )}
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includePrayerTimes}
                          onChange={(e) => setExportOptions({ ...exportOptions, includePrayerTimes: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Prayer times</span>
                        {data && (
                          <span className="ml-2 text-sm text-slate-400">({data.prayerTimes.length} times)</span>
                        )}
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeLunarEvents}
                          onChange={(e) => setExportOptions({ ...exportOptions, includeLunarEvents: e.target.checked })}
                          className="mr-3 text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="text-slate-300">Lunar events and phases</span>
                        {data && (
                          <span className="ml-2 text-sm text-slate-400">({data.lunarEvents.length} events)</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-moonlight mb-4">Date Range</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <h3 className="text-lg font-semibold text-moonlight mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacySettings.includeLocation}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, includeLocation: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">Include location coordinates</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacySettings.includeCalculationMethods}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, includeCalculationMethods: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">Include calculation methods</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacySettings.includePersonalNotes}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, includePersonalNotes: e.target.checked })}
                      className="mr-3 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-slate-300">Include personal notes and metadata</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-300 mb-2">Export Summary</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <div>Format: {exportOptions.format.toUpperCase()}</div>
                  <div>Events: {getEventCount()}</div>
                  {!singleEvent && (
                    <div>Date Range: {dateRange.start} to {dateRange.end}</div>
                  )}
                  <div>Location: {privacySettings.includeLocation ? 'Included' : 'Excluded'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {singleEvent ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-moonlight mb-4">Share Event</h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-slate-300 mb-2">{getEventTitle(singleEvent)}</h4>
                      <div className="text-sm text-slate-400">
                        {('tradition' in singleEvent && 'calculationMethod' in singleEvent) && (
                          <div>Prayer Time • {(singleEvent as PrayerTime).time.toLocaleString()}</div>
                        )}
                        {('tradition' in singleEvent && !('calculationMethod' in singleEvent)) && (
                          <div>Religious Event • {(singleEvent as ReligiousEvent).date.toLocaleDateString()}</div>
                        )}
                        {('eventName' in singleEvent) && (
                          <div>Lunar Event • {(singleEvent as LunarEvent).localSolarDate.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Share Text</h4>
                    <textarea
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      className="w-full h-40 p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 focus:border-accent-blue focus:outline-none resize-none"
                      placeholder="Customize your share message..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleShare}
                      className="flex-1 px-4 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors font-medium"
                    >
                      {navigator.share ? '📤 Share' : '📋 Copy to Clipboard'}
                    </button>
                    <button
                      onClick={() => generateShareText(singleEvent)}
                      className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      🔄 Reset Text
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    Quick share is available for individual events. Use the Export tab for bulk data sharing.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-moonlight">Export History</h3>
                <button
                  onClick={() => {
                    exportService.clearExportHistory();
                    setExportHistory([]);
                    toast.success('Export history cleared');
                  }}
                  className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                >
                  Clear History
                </button>
              </div>

              {exportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No exports yet. Create your first export to see history here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.slice().reverse().map((record) => (
                    <div key={record.id} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-300">
                            {record.format.toUpperCase()} Export
                          </div>
                          <div className="text-sm text-slate-400">
                            {record.eventCount} events • {record.timestamp.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {record.dateRange.start.toLocaleDateString()} - {record.dateRange.end.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          #{record.id.split('-').pop()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-center p-6 border-t border-slate-600">
          <div className="text-sm text-slate-400">
            {singleEvent ? (
              'Share individual event'
            ) : (
              `Ready to export ${getEventCount()} events`
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>

            {activeTab === 'export' && (
              <button
                onClick={handleExport}
                disabled={isExporting || getEventCount() === 0}
                className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? '⏳ Exporting...' : '📥 Export'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ExportManager;