import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService, ExportOptions, ExportData } from '../ExportService';
import { ReligiousEvent, PrayerTime, LunarEvent, Location } from '../../types';

describe('ExportService', () => {
  let service: ExportService;
  let mockData: ExportData;
  let mockLocation: Location;

  beforeEach(() => {
    service = new ExportService();
    
    mockLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      timezone: 'America/New_York'
    };

    const testDate = new Date('2024-01-15T12:00:00Z');
    
    mockData = {
      religiousEvents: [
        {
          id: 'test-event-1',
          name: 'Test Holiday',
          tradition: 'islam',
          date: testDate,
          localTime: testDate,
          description: 'A test religious event',
          significance: 'Test significance',
          astronomicalBasis: 'Based on lunar observation',
          observanceType: 'holiday'
        }
      ],
      prayerTimes: [
        {
          name: 'Fajr',
          time: new Date('2024-01-15T06:00:00Z'),
          tradition: 'islam',
          calculationMethod: 'MuslimWorldLeague',
          qiblaDirection: 58.5
        }
      ],
      lunarEvents: [
        {
          eventName: 'New Moon',
          utcDate: new Date('2024-01-15T18:00:00Z'),
          localSolarDate: new Date('2024-01-15T13:00:00Z'),
          julianDate: 2460326.25,
          accuracyNote: 'Calculated with high precision'
        }
      ]
    };
  });

  describe('Export Data Validation', () => {
    it('should validate export options correctly', () => {
      const validOptions: ExportOptions = {
        format: 'json',
        includeReligiousEvents: true,
        location: mockLocation
      };

      const result = service.validateExportOptions(validOptions);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid format', () => {
      const invalidOptions: ExportOptions = {
        format: 'invalid' as any
      };

      const result = service.validateExportOptions(invalidOptions);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid format: invalid');
    });

    it('should reject invalid date range', () => {
      const invalidOptions: ExportOptions = {
        format: 'json',
        dateRange: {
          start: new Date('2024-01-15'),
          end: new Date('2024-01-10')
        }
      };

      const result = service.validateExportOptions(invalidOptions);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
    });

    it('should reject invalid coordinates', () => {
      const invalidOptions: ExportOptions = {
        format: 'json',
        location: {
          latitude: 95, // Invalid
          longitude: -200, // Invalid
          elevation: 0
        }
      };

      const result = service.validateExportOptions(invalidOptions);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid latitude');
      expect(result.errors).toContain('Invalid longitude');
    });
  });

  describe('JSON Export', () => {
    it('should export data to JSON format', async () => {
      const options: ExportOptions = {
        format: 'json',
        includeReligiousEvents: true,
        includePrayerTimes: true,
        includeLunarEvents: true,
        location: mockLocation
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      expect(result.mimeType).toBe('application/json');
      expect(result.filename).toMatch(/events-\d{4}-\d{2}-\d{2}\.json/);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.metadata.format).toBe('json');
      expect(parsedData.data.religiousEvents).toHaveLength(1);
      expect(parsedData.data.prayerTimes).toHaveLength(1);
      expect(parsedData.data.lunarEvents).toHaveLength(1);
      expect(parsedData.location).toEqual(mockLocation);
    });

    it('should exclude data types when specified', async () => {
      const options: ExportOptions = {
        format: 'json',
        includeReligiousEvents: true,
        includePrayerTimes: false,
        includeLunarEvents: false
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.data.religiousEvents).toHaveLength(1);
      expect(parsedData.data.prayerTimes).toBeUndefined();
      expect(parsedData.data.lunarEvents).toBeUndefined();
    });
  });

  describe('CSV Export', () => {
    it('should export data to CSV format', async () => {
      const options: ExportOptions = {
        format: 'csv',
        includeReligiousEvents: true,
        includePrayerTimes: true,
        includeLunarEvents: true
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      expect(result.mimeType).toBe('text/csv');
      expect(result.filename).toMatch(/events-\d{4}-\d{2}-\d{2}\.csv/);
      
      const lines = result.data!.split('\n');
      expect(lines[0]).toContain('Type,Name,Date,Time'); // Header
      expect(lines).toHaveLength(4); // Header + 3 data rows
      
      // Check that all event types are included
      expect(result.data).toContain('Religious Event');
      expect(result.data).toContain('Prayer Time');
      expect(result.data).toContain('Lunar Event');
    });

    it('should handle CSV escaping correctly', async () => {
      const dataWithCommas: ExportData = {
        religiousEvents: [{
          id: 'test',
          name: 'Event, with commas',
          tradition: 'islam',
          date: new Date(),
          description: 'Description with "quotes" and, commas',
          significance: 'Test',
          observanceType: 'holiday'
        }],
        prayerTimes: [],
        lunarEvents: []
      };

      const options: ExportOptions = {
        format: 'csv',
        includeReligiousEvents: true
      };

      const result = await service.exportData(dataWithCommas, options);

      expect(result.success).toBe(true);
      expect(result.data).toContain('"Event, with commas"');
      expect(result.data).toContain('"Description with ""quotes"" and, commas"');
    });
  });

  describe('ICS Export', () => {
    it('should export data to ICS format', async () => {
      const options: ExportOptions = {
        format: 'ics',
        includeReligiousEvents: true,
        includePrayerTimes: true,
        includeLunarEvents: true,
        location: mockLocation
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      expect(result.mimeType).toBe('text/calendar');
      expect(result.filename).toMatch(/calendar-\d{4}-\d{2}-\d{2}\.ics/);
      
      // Basic ICS structure validation
      expect(result.data).toContain('BEGIN:VCALENDAR');
      expect(result.data).toContain('END:VCALENDAR');
      expect(result.data).toContain('BEGIN:VEVENT');
      expect(result.data).toContain('END:VEVENT');
    });
  });

  describe('Single Event Export', () => {
    it('should export single religious event', async () => {
      const event = mockData.religiousEvents[0];
      const result = await service.exportSingleEvent(event, 'json');

      expect(result.success).toBe(true);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.data.religiousEvents).toHaveLength(1);
      expect(parsedData.data.prayerTimes).toBeUndefined();
      expect(parsedData.data.lunarEvents).toBeUndefined();
    });

    it('should export single prayer time', async () => {
      const prayer = mockData.prayerTimes[0];
      const result = await service.exportSingleEvent(prayer, 'json');

      expect(result.success).toBe(true);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.data.prayerTimes).toHaveLength(1);
      expect(parsedData.data.religiousEvents).toBeUndefined();
      expect(parsedData.data.lunarEvents).toBeUndefined();
    });

    it('should export single lunar event', async () => {
      const lunarEvent = mockData.lunarEvents[0];
      const result = await service.exportSingleEvent(lunarEvent, 'json');

      expect(result.success).toBe(true);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.data.lunarEvents).toHaveLength(1);
      expect(parsedData.data.religiousEvents).toBeUndefined();
      expect(parsedData.data.prayerTimes).toBeUndefined();
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter events by date range', async () => {
      const options: ExportOptions = {
        format: 'json',
        dateRange: {
          start: new Date('2024-01-10'),
          end: new Date('2024-01-20')
        }
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.data.religiousEvents).toHaveLength(1);
      expect(parsedData.data.prayerTimes).toHaveLength(1);
      expect(parsedData.data.lunarEvents).toHaveLength(1);
    });

    it('should exclude events outside date range', async () => {
      const options: ExportOptions = {
        format: 'json',
        dateRange: {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-28')
        }
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No events to export');
    });
  });

  describe('Export History', () => {
    it('should track export history', async () => {
      const options: ExportOptions = {
        format: 'json'
      };

      await service.exportData(mockData, options);
      
      const history = service.getExportHistory();
      expect(history).toHaveLength(1);
      expect(history[0].format).toBe('json');
      expect(history[0].eventCount).toBe(3);
    });

    it('should clear export history', async () => {
      const options: ExportOptions = {
        format: 'json'
      };

      await service.exportData(mockData, options);
      expect(service.getExportHistory()).toHaveLength(1);
      
      service.clearExportHistory();
      expect(service.getExportHistory()).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data gracefully', async () => {
      const emptyData: ExportData = {
        religiousEvents: [],
        prayerTimes: [],
        lunarEvents: []
      };

      const options: ExportOptions = {
        format: 'json'
      };

      const result = await service.exportData(emptyData, options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No events to export');
    });

    it('should handle invalid format gracefully', async () => {
      const options: ExportOptions = {
        format: 'invalid' as any
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported export format');
    });
  });

  describe('Filename Generation', () => {
    it('should generate filename with date range', async () => {
      const options: ExportOptions = {
        format: 'json',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        }
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      expect(result.filename).toContain('2024-01-01-to-2024-01-31');
    });

    it('should generate filename without date range', async () => {
      const options: ExportOptions = {
        format: 'csv'
      };

      const result = await service.exportData(mockData, options);

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/events-\d{4}-\d{2}-\d{2}\.csv/);
    });
  });
});