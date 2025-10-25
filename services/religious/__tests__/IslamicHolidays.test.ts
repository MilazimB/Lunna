import { IslamicCalendarService } from '../IslamicCalendarService';

/**
 * Unit tests for Islamic holiday calculations
 * 
 * These tests verify:
 * 1. Hijri calendar conversion accuracy
 * 2. Islamic holiday identification
 * 3. Ramadan date calculations
 * 4. Holiday date ranges
 */

describe('IslamicCalendarService - Holidays', () => {
  let service: IslamicCalendarService;
  
  beforeEach(() => {
    service = new IslamicCalendarService();
  });
  
  describe('gregorianToHijri', () => {
    test('should convert Gregorian date to approximate Hijri date', () => {
      // Test a known date
      const gregorianDate = new Date(2025, 0, 15); // January 15, 2025
      const hijriDate = (service as any).gregorianToHijri(gregorianDate);
      
      expect(hijriDate).toHaveProperty('year');
      expect(hijriDate).toHaveProperty('month');
      expect(hijriDate).toHaveProperty('day');
      expect(hijriDate).toHaveProperty('monthName');
      
      expect(hijriDate.month).toBeGreaterThanOrEqual(1);
      expect(hijriDate.month).toBeLessThanOrEqual(12);
      expect(hijriDate.day).toBeGreaterThanOrEqual(1);
      expect(hijriDate.day).toBeLessThanOrEqual(30);
    });
    
    test('should have valid month names', () => {
      const date = new Date(2025, 0, 15);
      const hijriDate = (service as any).gregorianToHijri(date);
      
      const validMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
        'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'
      ];
      
      expect(validMonths).toContain(hijriDate.monthName);
    });
  });
  
  describe('getIslamicHolidays', () => {
    test('should return holidays within date range', async () => {
      // Test a full year to ensure we catch multiple holidays
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const holidays = await service.getIslamicHolidays(startDate, endDate);
      
      expect(holidays.length).toBeGreaterThan(0);
      
      // Verify all holidays are within the date range
      holidays.forEach(holiday => {
        expect(holiday.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(holiday.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
    
    test('should include major Islamic holidays', async () => {
      // Test a wide date range to catch major holidays
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2026, 11, 31);
      
      const holidays = await service.getIslamicHolidays(startDate, endDate);
      
      const holidayNames = holidays.map(h => h.name);
      
      // Should include at least some major holidays
      const majorHolidays = [
        'Islamic New Year (Hijri New Year)',
        'Eid al-Fitr',
        'Eid al-Adha',
        'First Day of Ramadan'
      ];
      
      // At least one major holiday should be present
      const hasAtLeastOneMajorHoliday = majorHolidays.some(major => 
        holidayNames.some(name => name.includes(major.split('(')[0].trim()))
      );
      
      expect(hasAtLeastOneMajorHoliday).toBe(true);
    });
    
    test('should have correct holiday structure', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const holidays = await service.getIslamicHolidays(startDate, endDate);
      
      if (holidays.length > 0) {
        const holiday = holidays[0];
        
        expect(holiday).toHaveProperty('id');
        expect(holiday).toHaveProperty('name');
        expect(holiday).toHaveProperty('tradition');
        expect(holiday).toHaveProperty('date');
        expect(holiday).toHaveProperty('description');
        expect(holiday).toHaveProperty('significance');
        expect(holiday).toHaveProperty('astronomicalBasis');
        expect(holiday).toHaveProperty('observanceType');
        
        expect(holiday.tradition).toBe('islam');
        expect(['prayer', 'holiday', 'fast', 'feast', 'sabbath']).toContain(holiday.observanceType);
      }
    });
    
    test('should handle short date ranges', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 0, 7); // Just one week
      
      const holidays = await service.getIslamicHolidays(startDate, endDate);
      
      // Should not throw error, may or may not have holidays
      expect(Array.isArray(holidays)).toBe(true);
    });
  });
  
  describe('isRamadan', () => {
    test('should identify dates during Ramadan', () => {
      // We need to find when Ramadan is in 2025
      const ramadanDates = service.getRamadanDates(2025);
      
      // Test a date during Ramadan
      const duringRamadan = new Date(ramadanDates.start);
      duringRamadan.setDate(duringRamadan.getDate() + 10); // 10 days into Ramadan
      
      expect(service.isRamadan(duringRamadan)).toBe(true);
    });
    
    test('should identify dates outside Ramadan', () => {
      // Test a date definitely not in Ramadan (e.g., January 1)
      const notRamadan = new Date(2025, 0, 1);
      const ramadanDates = service.getRamadanDates(2025);
      
      // Only test if January 1 is not during Ramadan
      if (notRamadan < ramadanDates.start || notRamadan > ramadanDates.end) {
        expect(service.isRamadan(notRamadan)).toBe(false);
      }
    });
  });
  
  describe('getRamadanDates', () => {
    test('should return start and end dates for Ramadan', () => {
      const ramadanDates = service.getRamadanDates(2025);
      
      expect(ramadanDates).toHaveProperty('start');
      expect(ramadanDates).toHaveProperty('end');
      expect(ramadanDates.start).toBeInstanceOf(Date);
      expect(ramadanDates.end).toBeInstanceOf(Date);
      
      // End should be after start
      expect(ramadanDates.end.getTime()).toBeGreaterThan(ramadanDates.start.getTime());
      
      // Ramadan should be approximately 29-30 days
      const durationDays = (ramadanDates.end.getTime() - ramadanDates.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(durationDays).toBeGreaterThanOrEqual(28);
      expect(durationDays).toBeLessThanOrEqual(31);
    });
    
    test('should return dates within the specified year', () => {
      const year = 2025;
      const ramadanDates = service.getRamadanDates(year);
      
      // At least the start should be in the specified year or very close
      const startYear = ramadanDates.start.getFullYear();
      expect(startYear).toBeGreaterThanOrEqual(year - 1);
      expect(startYear).toBeLessThanOrEqual(year + 1);
    });
  });
  
  describe('getCurrentHijriDate', () => {
    test('should return current Hijri date', () => {
      const hijriDate = service.getCurrentHijriDate();
      
      expect(hijriDate).toHaveProperty('year');
      expect(hijriDate).toHaveProperty('month');
      expect(hijriDate).toHaveProperty('day');
      expect(hijriDate).toHaveProperty('monthName');
      
      // Current Hijri year should be around 1446-1447 (as of 2025)
      expect(hijriDate.year).toBeGreaterThan(1440);
      expect(hijriDate.year).toBeLessThan(1500);
    });
  });
  
  describe('hijriToGregorian', () => {
    test('should convert Hijri date to Gregorian date', () => {
      const hijriDate = {
        year: 1446,
        month: 1,
        day: 1,
        monthName: 'Muharram'
      };
      
      const gregorianDate = service.hijriToGregorian(hijriDate);
      
      expect(gregorianDate).toBeInstanceOf(Date);
      expect(gregorianDate.getFullYear()).toBeGreaterThan(2020);
      expect(gregorianDate.getFullYear()).toBeLessThan(2030);
    });
    
    test('should handle round-trip conversion approximately', () => {
      const originalDate = new Date(2025, 5, 15); // June 15, 2025
      const hijriDate = (service as any).gregorianToHijri(originalDate);
      const convertedBack = service.hijriToGregorian(hijriDate);
      
      // Due to approximation, dates should be within a few days of each other
      const diffDays = Math.abs(convertedBack.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThan(3); // Within 3 days is acceptable for lunar calendar approximation
    });
  });
});
