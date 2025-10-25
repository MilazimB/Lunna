import { describe, it, expect, beforeEach } from 'vitest';
import { JewishCalendarService } from '../JewishCalendarService';
import { Location, JewishCalculationConfig } from '../../../types';

describe('JewishCalendarService', () => {
  let service: JewishCalendarService;
  let testLocation: Location;
  let testConfig: JewishCalculationConfig;
  
  beforeEach(() => {
    service = new JewishCalendarService();
    
    // New York City coordinates
    testLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    testConfig = {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 50,
      useElevation: false
    };
  });
  
  describe('getJewishObservances', () => {
    it('should return Jewish holidays for a date range', async () => {
      // Test for September 2024 which includes Rosh Hashana
      const startDate = new Date('2024-09-01');
      const endDate = new Date('2024-09-30');
      
      const observances = await service.getJewishObservances(startDate, endDate, testLocation);
      
      expect(observances).toBeDefined();
      expect(Array.isArray(observances)).toBe(true);
      expect(observances.length).toBeGreaterThan(0);
      
      // Check that observances have required properties
      observances.forEach(obs => {
        expect(obs).toHaveProperty('id');
        expect(obs).toHaveProperty('name');
        expect(obs).toHaveProperty('tradition');
        expect(obs.tradition).toBe('judaism');
        expect(obs).toHaveProperty('date');
        expect(obs).toHaveProperty('description');
        expect(obs).toHaveProperty('significance');
        expect(obs).toHaveProperty('observanceType');
      });
    });
    
    it('should include Rosh Hashana in September 2024', async () => {
      const startDate = new Date('2024-09-01');
      const endDate = new Date('2024-09-30');
      
      const observances = await service.getJewishObservances(startDate, endDate, testLocation);
      
      const roshHashana = observances.find(obs => obs.name.includes('Rosh Hashana'));
      expect(roshHashana).toBeDefined();
      expect(roshHashana?.observanceType).toBe('feast');
    });
    
    it('should include Yom Kippur in September/October 2024', async () => {
      const startDate = new Date('2024-09-01');
      const endDate = new Date('2024-10-31');
      
      const observances = await service.getJewishObservances(startDate, endDate, testLocation);
      
      const yomKippur = observances.find(obs => obs.name.includes('Yom Kippur'));
      expect(yomKippur).toBeDefined();
      expect(yomKippur?.observanceType).toBe('fast');
    });
    
    it('should work without location parameter', async () => {
      const startDate = new Date('2024-09-01');
      const endDate = new Date('2024-09-30');
      
      const observances = await service.getJewishObservances(startDate, endDate);
      
      expect(observances).toBeDefined();
      expect(Array.isArray(observances)).toBe(true);
    });
  });
  
  describe('getSabbathTimes', () => {
    it('should calculate candle lighting and havdalah times', async () => {
      // Test for a specific Friday in September 2024
      const testDate = new Date('2024-09-20'); // A Friday
      
      const sabbathTimes = await service.getSabbathTimes(testDate, testLocation, testConfig);
      
      expect(sabbathTimes).toBeDefined();
      expect(sabbathTimes).toHaveProperty('candleLighting');
      expect(sabbathTimes).toHaveProperty('havdalah');
      expect(sabbathTimes.candleLighting).toBeInstanceOf(Date);
      expect(sabbathTimes.havdalah).toBeInstanceOf(Date);
      
      // Havdalah should be after candle lighting
      expect(sabbathTimes.havdalah.getTime()).toBeGreaterThan(sabbathTimes.candleLighting.getTime());
    });
    
    it('should work for dates that are not Friday', async () => {
      // Test for a Monday - should still calculate for the upcoming/previous Shabbat
      const testDate = new Date('2024-09-23'); // A Monday
      
      const sabbathTimes = await service.getSabbathTimes(testDate, testLocation, testConfig);
      
      expect(sabbathTimes).toBeDefined();
      expect(sabbathTimes.candleLighting).toBeInstanceOf(Date);
      expect(sabbathTimes.havdalah).toBeInstanceOf(Date);
    });
    
    it('should respect custom candle lighting minutes', async () => {
      const testDate = new Date('2024-09-20');
      
      const config18 = { ...testConfig, candleLightingMinutes: 18 };
      const config40 = { ...testConfig, candleLightingMinutes: 40 };
      
      const times18 = await service.getSabbathTimes(testDate, testLocation, config18);
      const times40 = await service.getSabbathTimes(testDate, testLocation, config40);
      
      // With more minutes before sunset, candle lighting should be earlier
      expect(times40.candleLighting.getTime()).toBeLessThan(times18.candleLighting.getTime());
    });
  });
  
  describe('gregorianToHebrew', () => {
    it('should convert Gregorian date to Hebrew date', () => {
      const gregorianDate = new Date('2024-09-01');
      
      const hebrewDate = service.gregorianToHebrew(gregorianDate);
      
      expect(hebrewDate).toBeDefined();
      expect(hebrewDate).toHaveProperty('year');
      expect(hebrewDate).toHaveProperty('month');
      expect(hebrewDate).toHaveProperty('day');
      expect(hebrewDate).toHaveProperty('monthName');
      expect(typeof hebrewDate.year).toBe('number');
      expect(typeof hebrewDate.month).toBe('number');
      expect(typeof hebrewDate.day).toBe('number');
      expect(typeof hebrewDate.monthName).toBe('string');
    });
    
    it('should convert known date correctly', () => {
      // Rosh Hashana 5785 starts on October 3, 2024 (1 Tishrei 5785)
      const gregorianDate = new Date('2024-10-03');
      
      const hebrewDate = service.gregorianToHebrew(gregorianDate);
      
      expect(hebrewDate.year).toBe(5785);
      expect(hebrewDate.monthName).toBe('Tishrei');
      expect(hebrewDate.day).toBe(1);
    });
  });
  
  describe('hebrewToGregorian', () => {
    it('should convert Hebrew date to Gregorian date', () => {
      const hebrewDate = {
        year: 5785,
        month: 7, // Tishrei
        day: 1,
        monthName: 'Tishrei'
      };
      
      const gregorianDate = service.hebrewToGregorian(hebrewDate);
      
      expect(gregorianDate).toBeInstanceOf(Date);
      expect(gregorianDate.getFullYear()).toBe(2024);
      expect(gregorianDate.getMonth()).toBe(9); // October (0-indexed)
      expect(gregorianDate.getDate()).toBe(3);
    });
    
    it('should round-trip conversion correctly', () => {
      const originalDate = new Date('2024-09-15');
      
      const hebrewDate = service.gregorianToHebrew(originalDate);
      const convertedBack = service.hebrewToGregorian(hebrewDate);
      
      // Should be the same day (allowing for timezone differences)
      expect(convertedBack.getFullYear()).toBe(originalDate.getFullYear());
      expect(convertedBack.getMonth()).toBe(originalDate.getMonth());
      expect(convertedBack.getDate()).toBe(originalDate.getDate());
    });
  });
  
  describe('getCurrentHebrewDate', () => {
    it('should return current Hebrew date', () => {
      const hebrewDate = service.getCurrentHebrewDate();
      
      expect(hebrewDate).toBeDefined();
      expect(hebrewDate).toHaveProperty('year');
      expect(hebrewDate).toHaveProperty('month');
      expect(hebrewDate).toHaveProperty('day');
      expect(hebrewDate).toHaveProperty('monthName');
      expect(hebrewDate.year).toBeGreaterThan(5780); // Should be in the 5780s
    });
  });
  
  describe('isShabbat', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-09-21'); // A Saturday
      expect(service.isShabbat(saturday)).toBe(true);
    });
    
    it('should return false for other days', () => {
      const monday = new Date('2024-09-23'); // A Monday
      expect(service.isShabbat(monday)).toBe(false);
      
      const friday = new Date('2024-09-20'); // A Friday
      expect(service.isShabbat(friday)).toBe(false);
    });
  });
  
  describe('isHoliday', () => {
    it('should return true for Rosh Hashana', async () => {
      const roshHashana = new Date('2024-10-03'); // Rosh Hashana 5785
      const result = await service.isHoliday(roshHashana);
      expect(result).toBe(true);
    });
    
    it('should return false for regular days', async () => {
      const regularDay = new Date('2024-09-15'); // Not a holiday
      const result = await service.isHoliday(regularDay);
      expect(result).toBe(false);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', async () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01'); // End before start
      
      // Should not throw, but return empty or handle gracefully
      await expect(service.getJewishObservances(startDate, endDate)).resolves.toBeDefined();
    });
    
    it('should handle extreme latitude locations', async () => {
      const arcticLocation: Location = {
        latitude: 80.0,
        longitude: 0.0,
        timezone: 'UTC'
      };
      
      const testDate = new Date('2024-09-20');
      
      // Should handle polar regions without crashing
      await expect(
        service.getSabbathTimes(testDate, arcticLocation, testConfig)
      ).resolves.toBeDefined();
    });
  });
});
