import { IslamicCalendarService } from '../IslamicCalendarService';
import { Location, IslamicCalculationConfig } from '../../../types';

/**
 * Unit tests for IslamicCalendarService
 * 
 * These tests verify:
 * 1. Prayer time calculation accuracy
 * 2. Qibla direction calculation
 * 3. Different calculation methods
 * 4. Prayer time adjustments
 * 5. Edge cases (polar regions, date boundaries)
 */

describe('IslamicCalendarService', () => {
  let service: IslamicCalendarService;
  
  beforeEach(() => {
    service = new IslamicCalendarService();
  });
  
  describe('getPrayerTimes', () => {
    test('should calculate prayer times for New York', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      // Test date: January 15, 2025
      const date = new Date(2025, 0, 15);
      
      const prayers = await service.getPrayerTimes(date, location, config);

      expect(prayers).toHaveLength(5);
      expect(prayers[0].name).toBe('Fajr');
      expect(prayers[1].name).toBe('Dhuhr');
      expect(prayers[2].name).toBe('Asr');
      expect(prayers[3].name).toBe('Maghrib');
      expect(prayers[4].name).toBe('Isha');
      
      // Verify all times are Date objects
      prayers.forEach(prayer => {
        expect(prayer.time).toBeInstanceOf(Date);
        expect(prayer.tradition).toBe('islam');
        expect(prayer.calculationMethod).toBe('NorthAmerica');
      });
      
      // Verify prayer times are in chronological order
      for (let i = 0; i < prayers.length - 1; i++) {
        expect(prayers[i].time.getTime()).toBeLessThan(prayers[i + 1].time.getTime());
      }
    });
    
    test('should calculate prayer times for Mecca', async () => {
      const location: Location = {
        latitude: 21.4225,
        longitude: 39.8262,
        timezone: 'Asia/Riyadh'
      };
      
      const config: IslamicCalculationConfig = {
        method: 'UmmAlQura',
        madhab: 'shafi'
      };
      
      const date = new Date(2025, 0, 15);
      const prayers = await service.getPrayerTimes(date, location, config);

      expect(prayers).toHaveLength(5);
      expect(prayers[0].qiblaDirection).toBeDefined();
      
      // In Mecca, Qibla direction should be close to 0 or undefined behavior
      // (as you're at the Kaaba location)
      expect(typeof prayers[0].qiblaDirection).toBe('number');
    });
    
    test('should apply Hanafi madhab for Asr calculation', async () => {
      const location: Location = {
        latitude: 33.6844,
        longitude: 73.0479, // Islamabad
        timezone: 'Asia/Karachi'
      };
      
      const configShafi: IslamicCalculationConfig = {
        method: 'Karachi',
        madhab: 'shafi'
      };
      
      const configHanafi: IslamicCalculationConfig = {
        method: 'Karachi',
        madhab: 'hanafi'
      };
      
      const date = new Date(2025, 0, 15);
      
      const prayersShafi = await service.getPrayerTimes(date, location, configShafi);
      const prayersHanafi = await service.getPrayerTimes(date, location, configHanafi);
      
      // Hanafi Asr time should be later than Shafi Asr time
      const asrShafi = prayersShafi.find(p => p.name === 'Asr')!;
      const asrHanafi = prayersHanafi.find(p => p.name === 'Asr')!;
      
      expect(asrHanafi.time.getTime()).toBeGreaterThan(asrShafi.time.getTime());
    });
    
    test('should apply manual adjustments to prayer times', async () => {
      const location: Location = {
        latitude: 51.5074,
        longitude: -0.1278, // London
        timezone: 'Europe/London'
      };
      
      const configNoAdjustment: IslamicCalculationConfig = {
        method: 'MuslimWorldLeague',
        madhab: 'shafi'
      };
      
      const configWithAdjustment: IslamicCalculationConfig = {
        method: 'MuslimWorldLeague',
        madhab: 'shafi',
        adjustments: {
          fajr: 2, // Add 2 minutes to Fajr
          isha: -3 // Subtract 3 minutes from Isha
        }
      };
      
      const date = new Date(2025, 0, 15);
      
      const prayersNoAdj = await service.getPrayerTimes(date, location, configNoAdjustment);
      const prayersWithAdj = await service.getPrayerTimes(date, location, configWithAdjustment);
      
      const fajrNoAdj = prayersNoAdj.find(p => p.name === 'Fajr')!;
      const fajrWithAdj = prayersWithAdj.find(p => p.name === 'Fajr')!;
      
      const ishaNoAdj = prayersNoAdj.find(p => p.name === 'Isha')!;
      const ishaWithAdj = prayersWithAdj.find(p => p.name === 'Isha')!;
      
      // Fajr should be 2 minutes later
      expect(fajrWithAdj.time.getTime() - fajrNoAdj.time.getTime()).toBe(2 * 60 * 1000);
      
      // Isha should be 3 minutes earlier
      expect(ishaNoAdj.time.getTime() - ishaWithAdj.time.getTime()).toBe(3 * 60 * 1000);
    });
    
    test('should handle different calculation methods', async () => {
      const location: Location = {
        latitude: 25.2048,
        longitude: 55.2708, // Dubai
        timezone: 'Asia/Dubai'
      };
      
      const methods: Array<{ method: any; madhab: 'shafi' | 'hanafi' }> = [
        { method: 'MuslimWorldLeague', madhab: 'shafi' },
        { method: 'Egyptian', madhab: 'shafi' },
        { method: 'Karachi', madhab: 'shafi' },
        { method: 'Dubai', madhab: 'shafi' }
      ];
      
      const date = new Date(2025, 0, 15);
      
      for (const { method, madhab } of methods) {
        const config: IslamicCalculationConfig = { method, madhab };
        const prayers = await service.getPrayerTimes(date, location, config);

        expect(prayers).toHaveLength(5);
        expect(prayers[0].calculationMethod).toBe(method);
      }
    });
  });
  
  describe('getQiblaDirection', () => {
    test('should calculate Qibla direction for New York', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const qibla = await service.getQiblaDirection(location);
      
      expect(typeof qibla).toBe('number');
      expect(qibla).toBeGreaterThanOrEqual(0);
      expect(qibla).toBeLessThan(360);
      
      // For New York, Qibla should be roughly northeast (around 50-60 degrees)
      expect(qibla).toBeGreaterThan(40);
      expect(qibla).toBeLessThan(70);
    });
    
    test('should calculate Qibla direction for Tokyo', async () => {
      const location: Location = {
        latitude: 35.6762,
        longitude: 139.6503
      };
      
      const qibla = await service.getQiblaDirection(location);
      
      expect(typeof qibla).toBe('number');
      
      // For Tokyo, Qibla should be roughly west-northwest (around 290-300 degrees)
      expect(qibla).toBeGreaterThan(280);
      expect(qibla).toBeLessThan(310);
    });
    
    test('should calculate Qibla direction for Sydney', async () => {
      const location: Location = {
        latitude: -33.8688,
        longitude: 151.2093
      };
      
      const qibla = await service.getQiblaDirection(location);
      
      expect(typeof qibla).toBe('number');
      
      // For Sydney, Qibla should be roughly northwest (around 280-290 degrees)
      expect(qibla).toBeGreaterThan(270);
      expect(qibla).toBeLessThan(300);
    });
  });
  
  describe('getNextPrayer', () => {
    test('should return next prayer after current time', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      const date = new Date(2025, 0, 15);
      const prayers = await service.getPrayerTimes(date, location, config);

      // Set current time to 10 AM (should be after Fajr, before Dhuhr)
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);

      const nextPrayer = service.getNextPrayer(prayers, currentTime);

      expect(nextPrayer).not.toBeNull();
      expect(nextPrayer!.name).toBe('Dhuhr');
      expect(nextPrayer!.time.getTime()).toBeGreaterThan(currentTime.getTime());
    });
    
    test('should return null if no future prayers', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      const date = new Date(2025, 0, 15);
      const prayers = await service.getPrayerTimes(date, location, config);
      
      // Set current time to 11:59 PM (after all prayers)
      const currentTime = new Date(2025, 0, 15, 23, 59, 0);
      
      const nextPrayer = service.getNextPrayer(prayers, currentTime);
      
      expect(nextPrayer).toBeNull();
    });
  });
  
  describe('getCurrentPrayer', () => {
    test('should return most recent past prayer', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      const date = new Date(2025, 0, 15);
      const prayers = await service.getPrayerTimes(date, location, config);

      // Set current time to 10 AM (should be after Fajr)
      const currentTime = new Date(2025, 0, 15, 10, 0, 0);

      const currentPrayer = service.getCurrentPrayer(prayers, currentTime);

      expect(currentPrayer).not.toBeNull();
      expect(currentPrayer!.name).toBe('Fajr');
      expect(currentPrayer!.time.getTime()).toBeLessThanOrEqual(currentTime.getTime());
    });
    
    test('should return null if no past prayers', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      const date = new Date(2025, 0, 15);
      const prayers = await service.getPrayerTimes(date, location, config);
      
      // Set current time to midnight (before all prayers)
      const currentTime = new Date(2025, 0, 15, 0, 0, 0);
      
      const currentPrayer = service.getCurrentPrayer(prayers, currentTime);
      
      expect(currentPrayer).toBeNull();
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle high latitude locations', async () => {
      const location: Location = {
        latitude: 64.1466, // Reykjavik, Iceland
        longitude: -21.9426,
        timezone: 'Atlantic/Reykjavik'
      };
      
      const config: IslamicCalculationConfig = {
        method: 'MuslimWorldLeague',
        madhab: 'shafi'
      };
      
      // Summer date when there's minimal darkness
      const date = new Date(2025, 5, 21); // June 21
      
      const prayers = await service.getPrayerTimes(date, location, config);

      expect(prayers).toHaveLength(5);
      // Prayer times should still be calculated even in extreme conditions
      prayers.forEach(prayer => {
        expect(prayer.time).toBeInstanceOf(Date);
      });
    });
    
    test('should handle date boundary correctly', async () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060
      };
      
      const config: IslamicCalculationConfig = {
        method: 'NorthAmerica',
        madhab: 'shafi'
      };
      
      // Test at midnight
      const date = new Date(2025, 0, 15, 0, 0, 0);
      
      const prayers = await service.getPrayerTimes(date, location, config);

      expect(prayers).toHaveLength(5);

      // All prayer times should be on the same day
      prayers.forEach(prayer => {
        expect(prayer.time.getDate()).toBe(15);
        expect(prayer.time.getMonth()).toBe(0);
        expect(prayer.time.getFullYear()).toBe(2025);
      });
    });
  });
});
