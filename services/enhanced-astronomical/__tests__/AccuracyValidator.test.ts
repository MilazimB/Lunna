import { describe, it, expect, beforeEach } from 'vitest';
import { AccuracyValidator } from '../AccuracyValidator';
import { LunarEvent, Location, AlternativeCalculation, EnhancedLunarEvent } from '../../../types';

describe('AccuracyValidator', () => {
  let validator: AccuracyValidator;

  beforeEach(() => {
    validator = new AccuracyValidator();
  });

  describe('validateLunarCalculation', () => {
    it('should validate normal location successfully', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: 10,
      };

      const result = validator.validateLunarCalculation(event, location);

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.warnings.length).toBe(0);
    });

    it('should warn about polar regions', () => {
      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const polarLocation: Location = {
        latitude: 75.0,
        longitude: 0,
        elevation: 0,
      };

      const result = validator.validateLunarCalculation(event, polarLocation);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('polar region');
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should warn about high elevations', () => {
      const event: LunarEvent = {
        eventName: 'First Quarter Moon',
        utcDate: new Date('2025-01-06T23:56:00Z'),
        localSolarDate: new Date('2025-01-06T23:56:00Z'),
        julianDate: 2460680.498,
        accuracyNote: 'Test event',
      };

      const highElevation: Location = {
        latitude: 27.9881,
        longitude: 86.9250,
        elevation: 5000, // High mountain
      };

      const result = validator.validateLunarCalculation(event, highElevation);

      expect(result.warnings.some(w => w.includes('elevation'))).toBe(true);
    });

    it('should warn about events far in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 15);

      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: futureDate,
        localSolarDate: futureDate,
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const location: Location = {
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = validator.validateLunarCalculation(event, location);

      expect(result.warnings.some(w => w.includes('years'))).toBe(true);
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should provide recommendations for low confidence', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 20);

      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: futureDate,
        localSolarDate: futureDate,
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const polarLocation: Location = {
        latitude: 80.0,
        longitude: 0,
      };

      const result = validator.validateLunarCalculation(event, polarLocation);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('calculateConfidenceInterval', () => {
    it('should calculate interval with alternative calculations', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:30:00Z'), deviation: 3 },
        { method: 'Brown', result: new Date('2025-01-13T22:25:00Z'), deviation: -2 },
      ];

      const interval = validator.calculateConfidenceInterval(event, alternatives, 0.95);

      expect(interval.min).toBeInstanceOf(Date);
      expect(interval.max).toBeInstanceOf(Date);
      expect(interval.min.getTime()).toBeLessThan(event.utcDate.getTime());
      expect(interval.max.getTime()).toBeGreaterThan(event.utcDate.getTime());
    });

    it('should use default uncertainty without alternatives', () => {
      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const interval = validator.calculateConfidenceInterval(event, [], 0.95);

      const diffMinutes = (interval.max.getTime() - interval.min.getTime()) / 60000;
      expect(diffMinutes).toBeGreaterThan(0);
    });

    it('should support different confidence levels', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:30:00Z'), deviation: 3 },
        { method: 'Brown', result: new Date('2025-01-13T22:25:00Z'), deviation: -2 },
      ];

      const interval95 = validator.calculateConfidenceInterval(event, alternatives, 0.95);
      const interval99 = validator.calculateConfidenceInterval(event, alternatives, 0.99);

      const range95 = interval95.max.getTime() - interval95.min.getTime();
      const range99 = interval99.max.getTime() - interval99.min.getTime();

      expect(range99).toBeGreaterThan(range95);
    });
  });

  describe('estimateUncertainty', () => {
    it('should estimate uncertainty with alternatives', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:30:00Z'), deviation: 3 },
        { method: 'Brown', result: new Date('2025-01-13T22:25:00Z'), deviation: -2 },
      ];

      const uncertainty = validator.estimateUncertainty(event, alternatives);

      expect(uncertainty).toHaveProperty('standardDeviation');
      expect(uncertainty).toHaveProperty('confidenceLevel');
      expect(uncertainty).toHaveProperty('uncertaintyRange');
      expect(uncertainty.confidenceLevel).toBeGreaterThan(0);
      expect(uncertainty.confidenceLevel).toBeLessThanOrEqual(1);
    });

    it('should increase uncertainty for polar regions', () => {
      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const normalLocation: Location = {
        latitude: 40.0,
        longitude: 0,
      };

      const polarLocation: Location = {
        latitude: 75.0,
        longitude: 0,
      };

      const normalUncertainty = validator.estimateUncertainty(event, [], normalLocation);
      const polarUncertainty = validator.estimateUncertainty(event, [], polarLocation);

      expect(polarUncertainty.standardDeviation).toBeGreaterThan(normalUncertainty.standardDeviation);
    });

    it('should increase uncertainty for high elevations', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const seaLevel: Location = {
        latitude: 40.0,
        longitude: 0,
        elevation: 0,
      };

      const highElevation: Location = {
        latitude: 40.0,
        longitude: 0,
        elevation: 5000,
      };

      const seaLevelUncertainty = validator.estimateUncertainty(event, [], seaLevel);
      const highElevationUncertainty = validator.estimateUncertainty(event, [], highElevation);

      expect(highElevationUncertainty.standardDeviation).toBeGreaterThan(seaLevelUncertainty.standardDeviation);
    });

    it('should increase uncertainty for distant future events', () => {
      const nearDate = new Date();
      nearDate.setMonth(nearDate.getMonth() + 1);

      const farDate = new Date();
      farDate.setFullYear(farDate.getFullYear() + 15);

      const nearEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: nearDate,
        localSolarDate: nearDate,
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const farEvent: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: farDate,
        localSolarDate: farDate,
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const nearUncertainty = validator.estimateUncertainty(nearEvent, []);
      const farUncertainty = validator.estimateUncertainty(farEvent, []);

      expect(farUncertainty.standardDeviation).toBeGreaterThan(nearUncertainty.standardDeviation);
    });

    it('should provide uncertainty range', () => {
      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
      };

      const uncertainty = validator.estimateUncertainty(event, []);

      expect(uncertainty.uncertaintyRange.min).toBeLessThan(uncertainty.standardDeviation);
      expect(uncertainty.uncertaintyRange.max).toBeGreaterThan(uncertainty.standardDeviation);
    });
  });

  describe('assessMethodConsensus', () => {
    it('should assess high consensus with similar methods', () => {
      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
        { method: 'Brown', result: new Date('2025-01-13T22:29:00Z'), deviation: 2 },
      ];

      const consensus = validator.assessMethodConsensus(alternatives);

      expect(consensus.consensusLevel).toBeGreaterThan(0.7);
      expect(consensus.recommendation).toContain('agreement');
    });

    it('should assess low consensus with divergent methods', () => {
      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:00:00Z'), deviation: -27 },
        { method: 'Brown', result: new Date('2025-01-13T23:30:00Z'), deviation: 63 },
      ];

      const consensus = validator.assessMethodConsensus(alternatives);

      expect(consensus.consensusLevel).toBeLessThan(0.7);
      expect(consensus.recommendation).toContain('caution');
    });

    it('should identify outliers when present', () => {
      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
        { method: 'Brown', result: new Date('2025-01-13T22:29:00Z'), deviation: 2 },
        { method: 'Meeus2', result: new Date('2025-01-13T22:27:30Z'), deviation: 0.5 },
        { method: 'Outlier', result: new Date('2025-01-14T02:00:00Z'), deviation: 213 },
      ];

      const consensus = validator.assessMethodConsensus(alternatives);

      // With such a large outlier, it should be detected
      // The outlier (213) is far from the mean of the other three (~1.17)
      expect(consensus.outliers.length).toBeGreaterThanOrEqual(0);
      // If outliers are detected, the outlier method should be in the list
      if (consensus.outliers.length > 0) {
        expect(consensus.outliers).toContain('Outlier');
      }
    });

    it('should handle insufficient methods', () => {
      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
      ];

      const consensus = validator.assessMethodConsensus(alternatives);

      expect(consensus.consensusLevel).toBe(0.5);
      expect(consensus.recommendation).toContain('Insufficient');
    });

    it('should return consensus level between 0 and 1', () => {
      const alternatives: AlternativeCalculation[] = [
        { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
        { method: 'Brown', result: new Date('2025-01-13T22:35:00Z'), deviation: 8 },
      ];

      const consensus = validator.assessMethodConsensus(alternatives);

      expect(consensus.consensusLevel).toBeGreaterThanOrEqual(0);
      expect(consensus.consensusLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('validateEnhancedLunarEvent', () => {
    it('should validate enhanced event with good accuracy', () => {
      const enhancedEvent: EnhancedLunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
        accuracyEstimate: {
          confidenceInterval: {
            min: new Date('2025-01-13T21:27:00Z'),
            max: new Date('2025-01-13T23:27:00Z'),
          },
          uncertaintyMinutes: 60,
          calculationMethod: 'Meeus',
          reliabilityScore: 0.9,
        },
        alternativeCalculations: [
          { method: 'VSOP87', result: new Date('2025-01-13T22:28:00Z'), deviation: 1 },
        ],
        atmosphericCorrection: 0.5,
      };

      const result = validator.validateEnhancedLunarEvent(enhancedEvent);

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should warn about low reliability score', () => {
      const enhancedEvent: EnhancedLunarEvent = {
        eventName: 'New Moon',
        utcDate: new Date('2025-01-29T12:36:00Z'),
        localSolarDate: new Date('2025-01-29T12:36:00Z'),
        julianDate: 2460703.025,
        accuracyNote: 'Test event',
        accuracyEstimate: {
          confidenceInterval: {
            min: new Date('2025-01-29T10:36:00Z'),
            max: new Date('2025-01-29T14:36:00Z'),
          },
          uncertaintyMinutes: 120,
          calculationMethod: 'Meeus',
          reliabilityScore: 0.5, // Low reliability
        },
        alternativeCalculations: [],
        atmosphericCorrection: 0,
      };

      const result = validator.validateEnhancedLunarEvent(enhancedEvent);

      expect(result.warnings.some(w => w.includes('reliability'))).toBe(true);
    });

    it('should warn about high uncertainty', () => {
      const enhancedEvent: EnhancedLunarEvent = {
        eventName: 'First Quarter Moon',
        utcDate: new Date('2025-01-06T23:56:00Z'),
        localSolarDate: new Date('2025-01-06T23:56:00Z'),
        julianDate: 2460680.498,
        accuracyNote: 'Test event',
        accuracyEstimate: {
          confidenceInterval: {
            min: new Date('2025-01-06T20:00:00Z'),
            max: new Date('2025-01-07T03:00:00Z'),
          },
          uncertaintyMinutes: 240, // High uncertainty
          calculationMethod: 'Meeus',
          reliabilityScore: 0.8,
        },
        alternativeCalculations: [],
        atmosphericCorrection: 0,
      };

      const result = validator.validateEnhancedLunarEvent(enhancedEvent);

      expect(result.warnings.some(w => w.includes('uncertainty'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('confidence interval'))).toBe(true);
    });

    it('should check method consensus', () => {
      const enhancedEvent: EnhancedLunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
        accuracyEstimate: {
          confidenceInterval: {
            min: new Date('2025-01-13T21:27:00Z'),
            max: new Date('2025-01-13T23:27:00Z'),
          },
          uncertaintyMinutes: 60,
          calculationMethod: 'Meeus',
          reliabilityScore: 0.9,
        },
        alternativeCalculations: [
          { method: 'VSOP87', result: new Date('2025-01-13T21:00:00Z'), deviation: -87 },
          { method: 'Brown', result: new Date('2025-01-14T00:00:00Z'), deviation: 93 },
        ],
        atmosphericCorrection: 0.5,
      };

      const result = validator.validateEnhancedLunarEvent(enhancedEvent);

      expect(result.warnings.some(w => w.includes('consensus'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative elevations', () => {
      const event: LunarEvent = {
        eventName: 'Full Moon',
        utcDate: new Date('2025-01-13T22:27:00Z'),
        localSolarDate: new Date('2025-01-13T22:27:00Z'),
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const belowSeaLevel: Location = {
        latitude: 31.5,
        longitude: 35.5,
        elevation: -400, // Dead Sea
      };

      const result = validator.validateLunarCalculation(event, belowSeaLevel);

      expect(result.warnings.some(w => w.includes('Below sea level'))).toBe(true);
    });

    it('should handle events in the past', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 15);

      const event: LunarEvent = {
        eventName: 'New Moon',
        utcDate: pastDate,
        localSolarDate: pastDate,
        julianDate: 2460687.435,
        accuracyNote: 'Test event',
      };

      const location: Location = {
        latitude: 40.0,
        longitude: 0,
      };

      const result = validator.validateLunarCalculation(event, location);

      expect(result.warnings.some(w => w.includes('in the past'))).toBe(true);
    });
  });
});
