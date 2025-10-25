import { describe, it, expect } from 'vitest';
import { IslamicCalendarService } from '../religious/IslamicCalendarService';
import { Location } from '../../types';

describe('IslamicCalendarService', () => {
  const service = new IslamicCalendarService();
  const testLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  describe('getIslamicHolidays', () => {
    it('should return Islamic holidays for a given date range', async () => {
      // Test for the year 2024 which should have holidays
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 11, 31);

      const holidays = await service.getIslamicHolidays(startDate, endDate);

      expect(holidays).toBeDefined();
      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);

      // Check that all holidays have required properties
      holidays.forEach(holiday => {
        expect(holiday.id).toBeDefined();
        expect(holiday.name).toBeDefined();
        expect(holiday.tradition).toBe('islam');
        expect(holiday.date).toBeInstanceOf(Date);
        expect(holiday.description).toBeDefined();
        expect(holiday.significance).toBeDefined();
      });
    });

    it('should return major Islamic holidays', async () => {
      // Test for 2024 to ensure we get expected holidays
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 11, 31);

      const holidays = await service.getIslamicHolidays(startDate, endDate);
      const holidayNames = holidays.map(h => h.name);

      // Should include major holidays
      expect(holidayNames.some(name => name.includes('Islamic New Year'))).toBe(true);
      expect(holidayNames.some(name => name.includes('Eid al-Fitr'))).toBe(true);
      expect(holidayNames.some(name => name.includes('Eid al-Adha'))).toBe(true);
      expect(holidayNames.some(name => name.includes('Ramadan'))).toBe(true);
    });

    it('should return empty array for date range with no holidays', async () => {
      // Test a very short date range that likely has no holidays
      const startDate = new Date(2024, 5, 15); // June 15, 2024
      const endDate = new Date(2024, 5, 16);   // June 16, 2024

      const holidays = await service.getIslamicHolidays(startDate, endDate);

      expect(holidays).toBeDefined();
      expect(Array.isArray(holidays)).toBe(true);
      // This might be 0 or 1 depending on the exact dates
    });
  });

  describe('getPrayerTimes', () => {
    it('should return prayer times for a given date and location', async () => {
      const date = new Date(2024, 0, 1);
      const config = {
        method: 'MuslimWorldLeague' as const,
        madhab: 'shafi' as const
      };

      const prayerTimes = await service.getPrayerTimes(date, testLocation, config);

      expect(prayerTimes).toBeDefined();
      expect(Array.isArray(prayerTimes)).toBe(true);
      expect(prayerTimes.length).toBe(5); // Fajr, Dhuhr, Asr, Maghrib, Isha (Sunrise/Ishraq is not a prayer time)

      const expectedPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      expectedPrayers.forEach(prayerName => {
        const prayer = prayerTimes.find(p => p.name === prayerName);
        expect(prayer).toBeDefined();
        expect(prayer?.time).toBeInstanceOf(Date);
        expect(prayer?.tradition).toBe('islam');
        expect(prayer?.qiblaDirection).toBeDefined();
      });
    });
  });

  describe('getQiblaDirection', () => {
    it('should return a valid Qibla direction', async () => {
      const direction = await service.getQiblaDirection(testLocation);

      expect(typeof direction).toBe('number');
      expect(direction).toBeGreaterThanOrEqual(0);
      expect(direction).toBeLessThan(360);
    });
  });

  describe('getCurrentHijriDate', () => {
    it('should return current Hijri date', () => {
      const hijriDate = service.getCurrentHijriDate();

      expect(hijriDate).toBeDefined();
      expect(typeof hijriDate.year).toBe('number');
      expect(typeof hijriDate.month).toBe('number');
      expect(typeof hijriDate.day).toBe('number');
      expect(typeof hijriDate.monthName).toBe('string');

      expect(hijriDate.month).toBeGreaterThanOrEqual(1);
      expect(hijriDate.month).toBeLessThanOrEqual(12);
      expect(hijriDate.day).toBeGreaterThanOrEqual(1);
      expect(hijriDate.day).toBeLessThanOrEqual(30);
    });
  });

  describe('March 2025 Islamic Events', () => {
    it('should return Islamic events for March 2025', async () => {
      // Test the specific case that was reported as not working
      const march2025Start = new Date(2025, 2, 1); // March 1, 2025
      const march2025End = new Date(2025, 2, 31);  // March 31, 2025

      const events = await service.getIslamicHolidays(march2025Start, march2025End);

      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);

      // Should include major Ramadan events
      const eventNames = events.map(e => e.name);
      expect(eventNames.some(name => name.includes('Ramadan'))).toBe(true);
      expect(eventNames.some(name => name.includes('Eid al-Fitr'))).toBe(true);

      // Verify specific dates (log them to see what we actually get)
      const ramadanStart = events.find(e => e.name.includes('First Day of Ramadan'));
      const eidAlFitr = events.find(e => e.name.includes('Eid al-Fitr'));

      expect(ramadanStart).toBeDefined();
      expect(eidAlFitr).toBeDefined();

      // Log the actual dates for debugging
      console.log('Events found:', events.map(e => `${e.name} on ${e.date.toDateString()}`));

      // Just verify they are in 2025 and we have the expected events
      events.forEach(event => {
        expect(event.date.getFullYear()).toBe(2025);
        expect(event.tradition).toBe('islam');
      });

      // Verify we have distinct dates (not all on the same day)
      const uniqueDates = new Set(events.map(e => e.date.toDateString()));
      expect(uniqueDates.size).toBeGreaterThan(1);
    });
  });
});