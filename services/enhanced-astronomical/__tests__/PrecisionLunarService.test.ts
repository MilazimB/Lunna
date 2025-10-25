import { describe, it, expect, beforeEach } from 'vitest';
import { PrecisionLunarService } from '../PrecisionLunarService';
import { LunarEvent, Location } from '../../../types';

describe('PrecisionLunarService', () => {
  let service: PrecisionLunarService;

  beforeEach(() => {
    service = new PrecisionLunarService();
  });

  describe('getEnhancedLunarEvents', () => {
    it('should return enhanced lunar events with accuracy estimates', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const events = await service.getEnhancedLunarEvents(startDate, 0);

      expect(events.length).toBeGreaterThan(0);
      
      const firstEvent = events[0];
      expect(firstEvent).toHaveProperty('accuracyEstimate');
      expect(firstEvent).toHaveProperty('alternativeCalculations');
      expect(firstEvent).toHaveProperty('atmosphericCorrection');
      expect(firstEvent).toHaveProperty('librationData');
    });

    it('should include atmospheric correction when location is provided', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: 10,
      };

      const events = await service.getEnhancedLunarEvents(startDate, location.longitude, location);

      expect(events[0].atmosphericCorrection).toBeGreaterThan(0);
    });

    it('should have zero atmospheric correction without location', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const events = await service.getEnhancedLunarEvents(startDate, 0);

      expect(events[0].atmosphericCorrection).toBe(0);
    });
  });

  describe('getAlternativeCalculations', () => {
    it('should provide multiple calculation methods', async () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const alternatives = await service.getAlternativeCalculations(mockEvent);

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0]).toHaveProperty('method');
      expect(alternatives[0]).toHaveProperty('result');
      expect(alternatives[0]).toHaveProperty('deviation');
    });

    it('should include VSOP87 and Brown methods', async () => {
      const mockEvent: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const alternatives = await service.getAlternativeCalculations(mockEvent);
      const methods = alternatives.map(alt => alt.method);

      expect(methods).toContain('VSOP87 Simplified');
      expect(methods).toContain("Brown's Lunar Theory");
    });

    it('should calculate deviation in minutes', async () => {
      const mockEvent: LunarEvent = {
        eventName: 'First Quarter Moon',
        utcDate: new Date('2025-01-06T23:56:00Z'),
        localSolarDate: new Date('2025-01-06T23:56:00Z'),
        julianDate: 2460680.498,
        accuracyNote: 'Test event',
      };

      const alternatives = await service.getAlternativeCalculations(mockEvent);

      alternatives.forEach(alt => {
        expect(typeof alt.deviation).toBe('number');
        // Deviation should be reasonable (within a few hours)
        expect(Math.abs(alt.deviation)).toBeLessThan(300);
      });
    });
  });

  describe('calculateAccuracyEstimate', () => {
    it('should provide confidence interval', () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const alternatives = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:30:00Z'), deviation: 3 },
        { method: 'Brown', result: new Date('2025-01-13T22:25:00Z'), deviation: -2 },
      ];

      const estimate = service.calculateAccuracyEstimate(mockEvent, alternatives);

      expect(estimate).toHaveProperty('confidenceInterval');
      expect(estimate.confidenceInterval.min).toBeInstanceOf(Date);
      expect(estimate.confidenceInterval.max).toBeInstanceOf(Date);
      expect(estimate.confidenceInterval.min.getTime()).toBeLessThan(mockEvent.utcDate.getTime());
      expect(estimate.confidenceInterval.max.getTime()).toBeGreaterThan(mockEvent.utcDate.getTime());
    });

    it('should calculate reliability score between 0 and 1', () => {
      const mockEvent: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const alternatives = [
        { method: 'VSOP87', result: new Date('2025-01-29T12:38:00Z'), deviation: 2 },
      ];

      const estimate = service.calculateAccuracyEstimate(mockEvent, alternatives);

      expect(estimate.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(estimate.reliabilityScore).toBeLessThanOrEqual(1);
    });

    it('should have higher reliability with lower deviations', () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const lowDeviation = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
      ];

      const highDeviation = [
        { method: 'VSOP87', result: new Date('2025-01-13T23:27:00Z'), deviation: 60 },
      ];

      const lowEstimate = service.calculateAccuracyEstimate(mockEvent, lowDeviation);
      const highEstimate = service.calculateAccuracyEstimate(mockEvent, highDeviation);

      expect(lowEstimate.reliabilityScore).toBeGreaterThan(highEstimate.reliabilityScore);
    });

    it('should include calculation method description', () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const estimate = service.calculateAccuracyEstimate(mockEvent, []);

      expect(estimate.calculationMethod).toBeTruthy();
      expect(typeof estimate.calculationMethod).toBe('string');
    });
  });

  describe('calculateAtmosphericCorrection', () => {
    it('should calculate correction based on elevation', () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const seaLevel: Location = { latitude: 0, longitude: 0, elevation: 0 };
      const mountain: Location = { latitude: 0, longitude: 0, elevation: 3000 };

      const seaLevelCorrection = service.calculateAtmosphericCorrection(mockEvent, seaLevel);
      const mountainCorrection = service.calculateAtmosphericCorrection(mockEvent, mountain);

      expect(seaLevelCorrection).toBeGreaterThan(mountainCorrection);
    });

    it('should return positive correction value', () => {
      const mockEvent: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const location: Location = { latitude: 40, longitude: -74, elevation: 100 };
      const correction = service.calculateAtmosphericCorrection(mockEvent, location);

      expect(correction).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing elevation gracefully', () => {
      const mockEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const location: Location = { latitude: 40, longitude: -74 };
      const correction = service.calculateAtmosphericCorrection(mockEvent, location);

      expect(correction).toBeGreaterThan(0);
    });
  });

  describe('calculateLibration', () => {
    it('should calculate libration in longitude and latitude', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const libration = service.calculateLibration(date);

      expect(libration).toHaveProperty('longitudeLibration');
      expect(libration).toHaveProperty('latitudeLibration');
      expect(typeof libration.longitudeLibration).toBe('number');
      expect(typeof libration.latitudeLibration).toBe('number');
    });

    it('should have libration values within reasonable range', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const libration = service.calculateLibration(date);

      // Libration typically ranges from -8 to +8 degrees
      expect(Math.abs(libration.longitudeLibration)).toBeLessThan(10);
      expect(Math.abs(libration.latitudeLibration)).toBeLessThan(10);
    });

    it('should calculate apparent diameter', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const libration = service.calculateLibration(date);

      expect(libration).toHaveProperty('apparentDiameter');
      expect(libration.apparentDiameter).toBeGreaterThan(29); // Minimum ~29.4 arcmin
      expect(libration.apparentDiameter).toBeLessThan(34); // Maximum ~33.5 arcmin
    });

    it('should vary apparent diameter with lunar distance', () => {
      // Test at different dates to capture distance variation
      const date1 = new Date('2025-01-01T00:00:00Z');
      const date2 = new Date('2025-01-15T00:00:00Z');

      const libration1 = service.calculateLibration(date1);
      const libration2 = service.calculateLibration(date2);

      // Diameters should be different (moon's orbit is elliptical)
      expect(libration1.apparentDiameter).not.toBe(libration2.apparentDiameter);
    });
  });

  describe('getEnhancedCurrentIllumination', () => {
    it('should include libration data', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const illumination = service.getEnhancedCurrentIllumination(date);

      expect(illumination).toHaveProperty('librationData');
      expect(illumination.librationData).toHaveProperty('longitudeLibration');
      expect(illumination.librationData).toHaveProperty('latitudeLibration');
    });

    it('should include distance and apparent diameter', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const illumination = service.getEnhancedCurrentIllumination(date);

      expect(illumination).toHaveProperty('distance');
      expect(illumination).toHaveProperty('apparentDiameter');
      expect(illumination.distance).toBeGreaterThan(356000); // Perigee ~356,500 km
      expect(illumination.distance).toBeLessThan(407000); // Apogee ~406,700 km
    });

    it('should include base illumination properties', () => {
      const date = new Date('2025-01-13T22:27:00Z');
      const illumination = service.getEnhancedCurrentIllumination(date);

      expect(illumination).toHaveProperty('fraction');
      expect(illumination).toHaveProperty('phaseName');
      expect(illumination).toHaveProperty('phaseAngle');
    });
  });

  describe('Method Comparison', () => {
    it('should show agreement between different calculation methods', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const events = await service.getEnhancedLunarEvents(startDate, 0);

      const firstEvent = events[0];
      const alternatives = firstEvent.alternativeCalculations;

      // All methods should agree within a reasonable timeframe (< 5 hours)
      alternatives.forEach(alt => {
        expect(Math.abs(alt.deviation)).toBeLessThan(300);
      });
    });

    it('should provide consistent results across multiple calls', async () => {
      const date = new Date('2025-01-13T22:27:00Z');
      
      const libration1 = service.calculateLibration(date);
      const libration2 = service.calculateLibration(date);

      expect(libration1.longitudeLibration).toBe(libration2.longitudeLibration);
      expect(libration1.latitudeLibration).toBe(libration2.latitudeLibration);
      expect(libration1.apparentDiameter).toBe(libration2.apparentDiameter);
    });
  });
});
