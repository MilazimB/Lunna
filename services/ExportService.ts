import { createEvent, EventAttributes, DateArray } from 'ics';
import {
  ReligiousEvent,
  PrayerTime,
  LunarEvent,
  EnhancedLunarEvent,
  Location,
  ExportRecord
} from '../types';

/**
 * ExportService
 * 
 * Handles data export and sharing functionality for religious events,
 * prayer times, and astronomical data in multiple formats (ICS, JSON, CSV).
 */

export type ExportFormat = 'ics' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeReligiousEvents?: boolean;
  includePrayerTimes?: boolean;
  includeLunarEvents?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: Location;
  metadata?: {
    calculationMethods?: string[];
    traditions?: string[];
    notes?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename: string;
  mimeType: string;
  error?: string;
  record: ExportRecord;
}

export interface ExportData {
  religiousEvents: ReligiousEvent[];
  prayerTimes: PrayerTime[];
  lunarEvents: (LunarEvent | EnhancedLunarEvent)[];
}

export class ExportService {
  private exportHistory: ExportRecord[] = [];

  /**
   * Export data in the specified format
   */
  async exportData(
    data: ExportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterDataByOptions(data, options);
      const eventCount = this.countEvents(filteredData);
      
      if (eventCount === 0) {
        return {
          success: false,
          filename: '',
          mimeType: '',
          error: 'No events to export',
          record: this.createExportRecord(options, 0)
        };
      }

      let result: { data: string; filename: string; mimeType: string };

      switch (options.format) {
        case 'ics':
          result = await this.exportToICS(filteredData, options);
          break;
        case 'json':
          result = this.exportToJSON(filteredData, options);
          break;
        case 'csv':
          result = this.exportToCSV(filteredData, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      const record = this.createExportRecord(options, eventCount);
      this.exportHistory.push(record);

      return {
        success: true,
        data: result.data,
        filename: result.filename,
        mimeType: result.mimeType,
        record
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: errorMessage,
        record: this.createExportRecord(options, 0)
      };
    }
  }

  /**
   * Export individual event for sharing
   */
  async exportSingleEvent(
    event: ReligiousEvent | PrayerTime | LunarEvent,
    format: ExportFormat = 'ics'
  ): Promise<ExportResult> {
    const data: ExportData = {
      religiousEvents: 'tradition' in event ? [event as ReligiousEvent] : [],
      prayerTimes: 'tradition' in event && 'calculationMethod' in event ? [event as PrayerTime] : [],
      lunarEvents: 'eventName' in event ? [event as LunarEvent] : []
    };

    const options: ExportOptions = {
      format,
      includeReligiousEvents: 'tradition' in event && !('calculationMethod' in event),
      includePrayerTimes: 'tradition' in event && 'calculationMethod' in event,
      includeLunarEvents: 'eventName' in event
    };

    return this.exportData(data, options);
  }

  /**
   * Get export history
   */
  getExportHistory(): ExportRecord[] {
    return [...this.exportHistory];
  }

  /**
   * Clear export history
   */
  clearExportHistory(): void {
    this.exportHistory = [];
  }

  /**
   * Export to ICS (iCalendar) format
   */
  private async exportToICS(
    data: ExportData,
    options: ExportOptions
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    const events: EventAttributes[] = [];

    // Add religious events
    if (options.includeReligiousEvents !== false) {
      for (const event of data.religiousEvents) {
        const icsEvent = this.convertReligiousEventToICS(event, options);
        events.push(icsEvent);
      }
    }

    // Add prayer times
    if (options.includePrayerTimes !== false) {
      for (const prayer of data.prayerTimes) {
        const icsEvent = this.convertPrayerTimeToICS(prayer, options);
        events.push(icsEvent);
      }
    }

    // Add lunar events
    if (options.includeLunarEvents !== false) {
      for (const lunarEvent of data.lunarEvents) {
        const icsEvent = this.convertLunarEventToICS(lunarEvent, options);
        events.push(icsEvent);
      }
    }

    // Generate ICS content
    let icsContent = '';
    for (const event of events) {
      const { error, value } = createEvent(event);
      if (error) {
        console.warn('Error creating ICS event:', error);
        continue;
      }
      if (value) {
        icsContent += value;
      }
    }

    // If no events were successfully created, create a basic calendar
    if (!icsContent) {
      icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Celestial Events Calculator//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'END:VCALENDAR'
      ].join('\r\n');
    }

    const filename = this.generateFilename('calendar', 'ics', options);

    return {
      data: icsContent,
      filename,
      mimeType: 'text/calendar'
    };
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(
    data: ExportData,
    options: ExportOptions
  ): { data: string; filename: string; mimeType: string } {
    const exportObject = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0',
        source: 'Celestial Events Calculator',
        ...options.metadata
      },
      dateRange: options.dateRange,
      location: options.location,
      data: {
        ...(options.includeReligiousEvents !== false && { religiousEvents: data.religiousEvents }),
        ...(options.includePrayerTimes !== false && { prayerTimes: data.prayerTimes }),
        ...(options.includeLunarEvents !== false && { lunarEvents: data.lunarEvents })
      }
    };

    const filename = this.generateFilename('events', 'json', options);

    return {
      data: JSON.stringify(exportObject, null, 2),
      filename,
      mimeType: 'application/json'
    };
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(
    data: ExportData,
    options: ExportOptions
  ): { data: string; filename: string; mimeType: string } {
    const rows: string[] = [];
    
    // CSV Header
    const headers = [
      'Type',
      'Name',
      'Date',
      'Time',
      'Tradition',
      'Description',
      'Significance',
      'Calculation Method',
      'Astronomical Basis',
      'Observance Type',
      'Qibla Direction',
      'Accuracy Note'
    ];
    rows.push(this.csvRow(headers));

    // Add religious events
    if (options.includeReligiousEvents !== false) {
      for (const event of data.religiousEvents) {
        const row = [
          'Religious Event',
          event.name,
          event.date.toISOString().split('T')[0],
          event.localTime?.toLocaleTimeString() || event.date.toLocaleTimeString(),
          event.tradition,
          event.description,
          event.significance,
          '',
          event.astronomicalBasis || '',
          event.observanceType,
          '',
          ''
        ];
        rows.push(this.csvRow(row));
      }
    }

    // Add prayer times
    if (options.includePrayerTimes !== false) {
      for (const prayer of data.prayerTimes) {
        const row = [
          'Prayer Time',
          prayer.name,
          prayer.time.toISOString().split('T')[0],
          prayer.time.toLocaleTimeString(),
          prayer.tradition,
          `${prayer.name} prayer time`,
          `Daily prayer observance in ${prayer.tradition}`,
          prayer.calculationMethod,
          'Based on solar position calculations',
          'prayer',
          prayer.qiblaDirection?.toString() || '',
          ''
        ];
        rows.push(this.csvRow(row));
      }
    }

    // Add lunar events
    if (options.includeLunarEvents !== false) {
      for (const lunarEvent of data.lunarEvents) {
        const row = [
          'Lunar Event',
          lunarEvent.eventName,
          lunarEvent.localSolarDate.toISOString().split('T')[0],
          lunarEvent.localSolarDate.toLocaleTimeString(),
          '',
          `${lunarEvent.eventName} lunar phase`,
          'Astronomical lunar phase event',
          '',
          'Lunar orbital mechanics',
          '',
          '',
          lunarEvent.accuracyNote
        ];
        rows.push(this.csvRow(row));
      }
    }

    const filename = this.generateFilename('events', 'csv', options);

    return {
      data: rows.join('\n'),
      filename,
      mimeType: 'text/csv'
    };
  }

  /**
   * Convert religious event to ICS format
   */
  private convertReligiousEventToICS(
    event: ReligiousEvent,
    options: ExportOptions
  ): EventAttributes {
    const startDate = event.localTime || event.date;
    const dateArray: DateArray = [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes()
    ];

    let description = event.description;
    if (event.significance) {
      description += `\n\nSignificance: ${event.significance}`;
    }
    if (event.astronomicalBasis) {
      description += `\n\nAstronomical Basis: ${event.astronomicalBasis}`;
    }
    if (options.location) {
      description += `\n\nLocation: ${options.location.latitude}, ${options.location.longitude}`;
    }

    return {
      title: event.name,
      description,
      start: dateArray,
      duration: { hours: 0, minutes: 30 }, // Default 30-minute duration
      categories: [event.tradition, event.observanceType],
      uid: event.id,
      productId: 'celestial-events-calculator',
      classification: 'PUBLIC'
    };
  }

  /**
   * Convert prayer time to ICS format
   */
  private convertPrayerTimeToICS(
    prayer: PrayerTime,
    options: ExportOptions
  ): EventAttributes {
    const dateArray: DateArray = [
      prayer.time.getFullYear(),
      prayer.time.getMonth() + 1,
      prayer.time.getDate(),
      prayer.time.getHours(),
      prayer.time.getMinutes()
    ];

    let description = `${prayer.name} prayer time for ${prayer.tradition}`;
    description += `\n\nCalculation Method: ${prayer.calculationMethod}`;
    
    if (prayer.qiblaDirection !== undefined) {
      description += `\n\nQibla Direction: ${prayer.qiblaDirection}° from North`;
    }
    
    if (options.location) {
      description += `\n\nLocation: ${options.location.latitude}, ${options.location.longitude}`;
    }

    return {
      title: `${prayer.name} Prayer`,
      description,
      start: dateArray,
      duration: { hours: 0, minutes: 15 }, // Default 15-minute duration for prayers
      categories: [prayer.tradition, 'prayer'],
      uid: `${prayer.tradition}-${prayer.name}-${prayer.time.toISOString()}`,
      productId: 'celestial-events-calculator',
      classification: 'PUBLIC'
    };
  }

  /**
   * Convert lunar event to ICS format
   */
  private convertLunarEventToICS(
    lunarEvent: LunarEvent | EnhancedLunarEvent,
    options: ExportOptions
  ): EventAttributes {
    const dateArray: DateArray = [
      lunarEvent.localSolarDate.getFullYear(),
      lunarEvent.localSolarDate.getMonth() + 1,
      lunarEvent.localSolarDate.getDate(),
      lunarEvent.localSolarDate.getHours(),
      lunarEvent.localSolarDate.getMinutes()
    ];

    let description = `${lunarEvent.eventName} lunar phase`;
    description += `\n\nUTC Time: ${lunarEvent.utcDate.toISOString()}`;
    description += `\n\nJulian Date: ${lunarEvent.julianDate}`;
    
    if (lunarEvent.accuracyNote) {
      description += `\n\nAccuracy: ${lunarEvent.accuracyNote}`;
    }

    // Add enhanced data if available
    if ('accuracyEstimate' in lunarEvent && lunarEvent.accuracyEstimate) {
      description += `\n\nReliability Score: ${(lunarEvent.accuracyEstimate.reliabilityScore * 100).toFixed(1)}%`;
      description += `\n\nUncertainty: ±${lunarEvent.accuracyEstimate.uncertaintyMinutes} minutes`;
    }

    if (options.location) {
      description += `\n\nLocation: ${options.location.latitude}, ${options.location.longitude}`;
    }

    return {
      title: lunarEvent.eventName,
      description,
      start: dateArray,
      duration: { hours: 0, minutes: 1 }, // Instantaneous event
      categories: ['astronomy', 'lunar'],
      uid: `lunar-${lunarEvent.eventName}-${lunarEvent.utcDate.toISOString()}`,
      productId: 'celestial-events-calculator',
      classification: 'PUBLIC'
    };
  }

  /**
   * Filter data based on export options
   */
  private filterDataByOptions(data: ExportData, options: ExportOptions): ExportData {
    const filtered: ExportData = {
      religiousEvents: [],
      prayerTimes: [],
      lunarEvents: []
    };

    if (options.includeReligiousEvents !== false) {
      filtered.religiousEvents = options.dateRange
        ? data.religiousEvents.filter(event => 
            event.date >= options.dateRange!.start && event.date <= options.dateRange!.end
          )
        : data.religiousEvents;
    }

    if (options.includePrayerTimes !== false) {
      filtered.prayerTimes = options.dateRange
        ? data.prayerTimes.filter(prayer => 
            prayer.time >= options.dateRange!.start && prayer.time <= options.dateRange!.end
          )
        : data.prayerTimes;
    }

    if (options.includeLunarEvents !== false) {
      filtered.lunarEvents = options.dateRange
        ? data.lunarEvents.filter(event => 
            event.localSolarDate >= options.dateRange!.start && event.localSolarDate <= options.dateRange!.end
          )
        : data.lunarEvents;
    }

    return filtered;
  }

  /**
   * Count total events in export data
   */
  private countEvents(data: ExportData): number {
    return data.religiousEvents.length + data.prayerTimes.length + data.lunarEvents.length;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(prefix: string, extension: string, options: ExportOptions): string {
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `${prefix}-${timestamp}`;

    if (options.dateRange) {
      const start = options.dateRange.start.toISOString().split('T')[0];
      const end = options.dateRange.end.toISOString().split('T')[0];
      filename += `-${start}-to-${end}`;
    }

    return `${filename}.${extension}`;
  }

  /**
   * Create CSV row with proper escaping
   */
  private csvRow(values: string[]): string {
    return values
      .map(value => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = value.replace(/"/g, '""');
        return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      })
      .join(',');
  }

  /**
   * Create export record for history tracking
   */
  private createExportRecord(options: ExportOptions, eventCount: number): ExportRecord {
    return {
      id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      format: options.format,
      eventCount,
      dateRange: options.dateRange || {
        start: new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Validate export options
   */
  validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['ics', 'json', 'csv'].includes(options.format)) {
      errors.push(`Invalid format: ${options.format}`);
    }

    if (options.dateRange) {
      if (options.dateRange.start >= options.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }

    if (options.location) {
      if (options.location.latitude < -90 || options.location.latitude > 90) {
        errors.push('Invalid latitude');
      }
      if (options.location.longitude < -180 || options.location.longitude > 180) {
        errors.push('Invalid longitude');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const exportService = new ExportService();