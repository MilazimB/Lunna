import { describe, it, expect } from 'vitest';
import { PrecisionLunarService } from '../PrecisionLunarService';

describe('Libration Calculations', () => {
  const service = new PrecisionLunarService();

  describe('calculateLibration', () => {
    it('should calculate libration for known dates', () => {
      // Test with a specific date
      const date = new Date('2025-01-15T12:00:00Z');
      const libration = service.calculateLibration(date);

      expect(libration).toHaveProperty('longitudeLibration');
      expect(libration).toHaveProperty('latitudeLibration');
      expect(libration).toHaveProperty('apparentDiameter');
    });

    it('should have libration longitude within physical limits', () => {
      const dates = [
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-06-15T12:00:00Z'),
        new Date('2025-12-31T23:59:59Z'),
      ];

      dates.forEach(date => {
        const libration = service.calculateLibration(date);
        
        // Physical libration is limited to about ±8 degrees
        expect(Math.abs(libration.longitudeLibration)).toBeLessThan(10);
      });
    });

    it('should have libration latitude within physical limits', () => {
      const dates = [
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-06-15T12:00:00Z'),
        new Date('2025-12-31T23:59:59Z'),
      ];

      dates.forEach(date => {
        const libration = service.calculateLibration(date);
        
        // Physical libration is limited to about ±7 degrees
        expect(Math.abs(libration.latitudeLibration)).toBeLessThan(10);
      });
    });

    it('should calculate varying libration over time', () => {
      const date1 = new Date('2025-01-01T00:00:00Z');
      const date2 = new Date('2025-01-08T00:00:00Z');
      const date3 = new Date('2025-01-15T00:00:00Z');

      const lib1 = service.calculateLibration(date1);
      const lib2 = service.calculateLibration(date2);
      const lib3 = service.calculateLibration(date3);

      // Libration should vary over time (not all the same)
      const allSame = 
        lib1.longitudeLibration === lib2.longitudeLibration &&
        lib2.longitudeLibration === lib3.longitudeLibration;

      expect(allSame).toBe(false);
    });

    it('should calculate libration with proper precision', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const libration = service.calculateLibration(date);

      // Check that values are rounded to 3 decimal places
      const lonStr = libration.longitudeLibration.toString();
      const latStr = libration.latitudeLibration.toString();

      if (lonStr.includes('.')) {
        const decimals = lonStr.split('.')[1].length;
        expect(decimals).toBeLessThanOrEqual(3);
      }

      if (latStr.includes('.')) {
        const decimals = latStr.split('.')[1].length;
        expect(decimals).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Apparent Diameter Calculations', () => {
    it('should calculate apparent diameter within valid range', () => {
      const dates = [
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-03-15T12:00:00Z'),
        new Date('2025-06-30T18:00:00Z'),
        new Date('2025-09-15T06:00:00Z'),
        new Date('2025-12-31T23:59:59Z'),
      ];

      dates.forEach(date => {
        const libration = service.calculateLibration(date);
        
        // Moon's apparent diameter ranges from ~29.4' to ~33.5' arcminutes
        expect(libration.apparentDiameter).toBeGreaterThan(29);
        expect(libration.apparentDiameter).toBeLessThan(34);
      });
    });

    it('should show diameter variation due to elliptical orbit', () => {
      // Sample multiple dates throughout a month
      const diameters: number[] = [];
      const baseDate = new Date('2025-01-01T00:00:00Z');

      for (let day = 0; day < 30; day++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + day);
        const libration = service.calculateLibration(date);
        diameters.push(libration.apparentDiameter);
      }

      const minDiameter = Math.min(...diameters);
      const maxDiameter = Math.max(...diameters);

      // There should be noticeable variation (at least 1 arcminute)
      expect(maxDiameter - minDiameter).toBeGreaterThan(1);
    });

    it('should calculate diameter with proper precision', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const libration = service.calculateLibration(date);

      // Check that diameter is rounded to 2 decimal places
      const diamStr = libration.apparentDiameter.toString();

      if (diamStr.includes('.')) {
        const decimals = diamStr.split('.')[1].length;
        expect(decimals).toBeLessThanOrEqual(2);
      }
    });

    it('should correlate diameter with lunar distance', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const enhanced = service.getEnhancedCurrentIllumination(date);

      // Larger diameter should correspond to closer distance
      // Mean distance is ~384,400 km, mean diameter is ~31.1'
      const expectedDiameter = 31.1 * (384400 / enhanced.distance);
      
      // Should be within 10% of expected (accounting for simplifications)
      const tolerance = expectedDiameter * 0.1;
      expect(Math.abs(enhanced.apparentDiameter - expectedDiameter)).toBeLessThan(tolerance);
    });
  });

  describe('Enhanced Lunar Illumination', () => {
    it('should include all enhanced properties', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const enhanced = service.getEnhancedCurrentIllumination(date);

      expect(enhanced).toHaveProperty('fraction');
      expect(enhanced).toHaveProperty('phaseName');
      expect(enhanced).toHaveProperty('phaseAngle');
      expect(enhanced).toHaveProperty('librationData');
      expect(enhanced).toHaveProperty('apparentDiameter');
      expect(enhanced).toHaveProperty('distance');
    });

    it('should calculate lunar distance within valid range', () => {
      const dates = [
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-04-15T12:00:00Z'),
        new Date('2025-07-30T18:00:00Z'),
        new Date('2025-10-15T06:00:00Z'),
      ];

      dates.forEach(date => {
        const enhanced = service.getEnhancedCurrentIllumination(date);
        
        // Moon's distance ranges from ~356,500 km (perigee) to ~406,700 km (apogee)
        expect(enhanced.distance).toBeGreaterThan(356000);
        expect(enhanced.distance).toBeLessThan(407000);
      });
    });

    it('should show distance variation over lunar month', () => {
      const distances: number[] = [];
      const baseDate = new Date('2025-01-01T00:00:00Z');

      for (let day = 0; day < 30; day++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + day);
        const enhanced = service.getEnhancedCurrentIllumination(date);
        distances.push(enhanced.distance);
      }

      const minDistance = Math.min(...distances);
      const maxDistance = Math.max(...distances);

      // Should show significant variation (at least 20,000 km)
      expect(maxDistance - minDistance).toBeGreaterThan(20000);
    });

    it('should maintain consistency between libration data sources', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      
      const directLibration = service.calculateLibration(date);
      const enhancedIllumination = service.getEnhancedCurrentIllumination(date);

      // Libration data should match
      expect(enhancedIllumination.librationData.longitudeLibration).toBe(directLibration.longitudeLibration);
      expect(enhancedIllumination.librationData.latitudeLibration).toBe(directLibration.latitudeLibration);
      expect(enhancedIllumination.librationData.apparentDiameter).toBe(directLibration.apparentDiameter);
    });

    it('should provide integer distance values', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const enhanced = service.getEnhancedCurrentIllumination(date);

      // Distance should be rounded to nearest km
      expect(Number.isInteger(enhanced.distance)).toBe(true);
    });
  });

  describe('Libration Accuracy', () => {
    it('should calculate libration consistently for same date', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      
      const lib1 = service.calculateLibration(date);
      const lib2 = service.calculateLibration(date);
      const lib3 = service.calculateLibration(date);

      expect(lib1.longitudeLibration).toBe(lib2.longitudeLibration);
      expect(lib2.longitudeLibration).toBe(lib3.longitudeLibration);
      expect(lib1.latitudeLibration).toBe(lib2.latitudeLibration);
      expect(lib2.latitudeLibration).toBe(lib3.latitudeLibration);
    });

    it('should handle edge cases at year boundaries', () => {
      const dates = [
        new Date('2024-12-31T23:59:59Z'),
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-12-31T23:59:59Z'),
        new Date('2026-01-01T00:00:00Z'),
      ];

      dates.forEach(date => {
        const libration = service.calculateLibration(date);
        
        expect(libration.longitudeLibration).toBeDefined();
        expect(libration.latitudeLibration).toBeDefined();
        expect(libration.apparentDiameter).toBeDefined();
        expect(isNaN(libration.longitudeLibration)).toBe(false);
        expect(isNaN(libration.latitudeLibration)).toBe(false);
        expect(isNaN(libration.apparentDiameter)).toBe(false);
      });
    });

    it('should handle dates far in the future', () => {
      const futureDate = new Date('2050-06-15T12:00:00Z');
      const libration = service.calculateLibration(futureDate);

      expect(Math.abs(libration.longitudeLibration)).toBeLessThan(10);
      expect(Math.abs(libration.latitudeLibration)).toBeLessThan(10);
      expect(libration.apparentDiameter).toBeGreaterThan(29);
      expect(libration.apparentDiameter).toBeLessThan(34);
    });

    it('should handle dates in the past', () => {
      const pastDate = new Date('2020-06-15T12:00:00Z');
      const libration = service.calculateLibration(pastDate);

      expect(Math.abs(libration.longitudeLibration)).toBeLessThan(10);
      expect(Math.abs(libration.latitudeLibration)).toBeLessThan(10);
      expect(libration.apparentDiameter).toBeGreaterThan(29);
      expect(libration.apparentDiameter).toBeLessThan(34);
    });
  });

  describe('Integration with Enhanced Lunar Events', () => {
    it('should include libration data in enhanced lunar events', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const events = await service.getEnhancedLunarEvents(startDate, 0);

      expect(events.length).toBeGreaterThan(0);
      
      events.forEach(event => {
        expect(event.librationData).toBeDefined();
        expect(event.librationData?.longitudeLibration).toBeDefined();
        expect(event.librationData?.latitudeLibration).toBeDefined();
        expect(event.librationData?.apparentDiameter).toBeDefined();
      });
    });

    it('should have valid libration data for all moon phases', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const events = await service.getEnhancedLunarEvents(startDate, 0);

      const phaseTypes = ['New Moon', 'First Quarter Moon', 'Full Moon', 'Third Quarter Moon'];
      
      phaseTypes.forEach(phaseType => {
        const event = events.find(e => e.eventName === phaseType);
        if (event && event.librationData) {
          expect(Math.abs(event.librationData.longitudeLibration)).toBeLessThan(10);
          expect(Math.abs(event.librationData.latitudeLibration)).toBeLessThan(10);
          expect(event.librationData.apparentDiameter).toBeGreaterThan(29);
          expect(event.librationData.apparentDiameter).toBeLessThan(34);
        }
      });
    });
  });
});
