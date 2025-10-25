import {
  LunarEvent,
  EnhancedLunarEvent,
  Location,
  AccuracyEstimate,
  AlternativeCalculation,
} from '../../types';

/**
 * AccuracyValidator
 * 
 * Validates calculation accuracy and provides confidence metrics
 * for astronomical calculations, particularly lunar events.
 */

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 scale
  warnings: string[];
  recommendations: string[];
}

export interface UncertaintyEstimate {
  standardDeviation: number; // minutes
  confidenceLevel: number; // 0-1 scale (e.g., 0.95 for 95% confidence)
  uncertaintyRange: { min: number; max: number }; // minutes
}

export class AccuracyValidator {
  /**
   * Validate a lunar calculation against known accuracy thresholds
   */
  validateLunarCalculation(event: LunarEvent, location: Location): ValidationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let confidence = 1.0;

    // Check for polar regions
    const polarCheck = this.checkPolarRegion(location);
    if (!polarCheck.isValid) {
      warnings.push(polarCheck.warning);
      confidence *= 0.7;
      if (polarCheck.recommendation) {
        recommendations.push(polarCheck.recommendation);
      }
    }

    // Check for extreme elevations
    const elevationCheck = this.checkElevation(location);
    if (!elevationCheck.isValid) {
      warnings.push(elevationCheck.warning);
      confidence *= 0.9;
    }

    // Check event timing (recent past or near future is more accurate)
    const timingCheck = this.checkEventTiming(event.utcDate);
    if (!timingCheck.isValid) {
      warnings.push(timingCheck.warning);
      confidence *= timingCheck.confidenceFactor;
    }

    // Overall validation
    const isValid = confidence > 0.5;

    if (!isValid) {
      recommendations.push('Consider using multiple calculation methods for verification');
      recommendations.push('Consult astronomical almanacs for critical timing');
    }

    return {
      isValid,
      confidence,
      warnings,
      recommendations,
    };
  }

  /**
   * Check if location is in polar region where calculations may be problematic
   */
  private checkPolarRegion(location: Location): {
    isValid: boolean;
    warning: string;
    recommendation?: string;
  } {
    const absLatitude = Math.abs(location.latitude);

    if (absLatitude > 66.5) {
      // Arctic/Antarctic Circle
      return {
        isValid: false,
        warning: `Location is in polar region (${location.latitude.toFixed(2)}°). Lunar calculations may have reduced accuracy.`,
        recommendation: 'Verify calculations with local astronomical observations or almanacs.',
      };
    }

    if (absLatitude > 60) {
      // High latitude warning
      return {
        isValid: false,
        warning: `High latitude location (${location.latitude.toFixed(2)}°). Some atmospheric effects may be more pronounced.`,
      };
    }

    return { isValid: true, warning: '' };
  }

  /**
   * Check if elevation affects calculation accuracy
   */
  private checkElevation(location: Location): {
    isValid: boolean;
    warning: string;
  } {
    const elevation = location.elevation || 0;

    if (elevation > 4000) {
      return {
        isValid: false,
        warning: `High elevation (${elevation}m). Atmospheric corrections may have increased uncertainty.`,
      };
    }

    if (elevation < -100) {
      return {
        isValid: false,
        warning: `Below sea level location (${elevation}m). Unusual atmospheric conditions may affect accuracy.`,
      };
    }

    return { isValid: true, warning: '' };
  }

  /**
   * Check event timing and its effect on accuracy
   */
  private checkEventTiming(eventDate: Date): {
    isValid: boolean;
    warning: string;
    confidenceFactor: number;
  } {
    const now = new Date();
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays) > 365 * 10) {
      // More than 10 years away
      return {
        isValid: false,
        warning: `Event is ${Math.abs(Math.round(diffDays / 365))} years ${diffDays > 0 ? 'in the future' : 'in the past'}. Long-term predictions have increased uncertainty.`,
        confidenceFactor: 0.7,
      };
    }

    if (Math.abs(diffDays) > 365 * 5) {
      // More than 5 years away
      return {
        isValid: false,
        warning: `Event is ${Math.abs(Math.round(diffDays / 365))} years ${diffDays > 0 ? 'in the future' : 'in the past'}. Accuracy may be reduced.`,
        confidenceFactor: 0.85,
      };
    }

    return { isValid: true, warning: '', confidenceFactor: 1.0 };
  }

  /**
   * Calculate confidence intervals for a lunar event
   */
  calculateConfidenceInterval(
    event: LunarEvent,
    alternatives: AlternativeCalculation[],
    confidenceLevel: number = 0.95
  ): { min: Date; max: Date } {
    if (alternatives.length === 0) {
      // Use default uncertainty for single method
      const defaultUncertainty = 120; // 2 hours in minutes
      return {
        min: new Date(event.utcDate.getTime() - defaultUncertainty * 60000),
        max: new Date(event.utcDate.getTime() + defaultUncertainty * 60000),
      };
    }

    // Calculate standard deviation of alternative methods
    const deviations = alternatives.map(alt => alt.deviation);
    const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    const variance = deviations.reduce((sum, dev) => sum + Math.pow(dev - mean, 2), 0) / deviations.length;
    const stdDev = Math.sqrt(variance);

    // Z-score for confidence level (approximation)
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;

    // Calculate interval
    const intervalMinutes = stdDev * zScore;

    return {
      min: new Date(event.utcDate.getTime() - intervalMinutes * 60000),
      max: new Date(event.utcDate.getTime() + intervalMinutes * 60000),
    };
  }

  /**
   * Estimate uncertainty in lunar calculations
   */
  estimateUncertainty(
    event: LunarEvent,
    alternatives: AlternativeCalculation[],
    location?: Location
  ): UncertaintyEstimate {
    let baseUncertainty = 60; // Base uncertainty: 1 hour

    // Adjust based on alternative calculations
    if (alternatives.length > 0) {
      const deviations = alternatives.map(alt => Math.abs(alt.deviation));
      const maxDeviation = Math.max(...deviations);
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

      // Standard deviation calculation
      const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      const variance = deviations.reduce((sum, dev) => sum + Math.pow(dev - mean, 2), 0) / deviations.length;
      const stdDev = Math.sqrt(variance);

      baseUncertainty = Math.max(stdDev, avgDeviation);
    }

    // Adjust for location factors
    if (location) {
      const absLatitude = Math.abs(location.latitude);
      if (absLatitude > 66.5) {
        baseUncertainty *= 2.0; // Double uncertainty in polar regions
      } else if (absLatitude > 60) {
        baseUncertainty *= 1.5; // 50% increase in high latitudes
      }

      const elevation = location.elevation || 0;
      if (elevation > 4000) {
        baseUncertainty *= 1.3; // 30% increase for high elevation
      }
    }

    // Adjust for event timing
    const now = new Date();
    const diffYears = Math.abs((event.utcDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (diffYears > 10) {
      baseUncertainty *= 1.5;
    } else if (diffYears > 5) {
      baseUncertainty *= 1.2;
    }

    // Calculate confidence level based on uncertainty
    const confidenceLevel = Math.max(0.7, Math.min(0.99, 1 - (baseUncertainty / 300)));

    return {
      standardDeviation: baseUncertainty,
      confidenceLevel,
      uncertaintyRange: {
        min: baseUncertainty * 0.5,
        max: baseUncertainty * 2.0,
      },
    };
  }

  /**
   * Compare multiple calculation methods and assess consensus
   */
  assessMethodConsensus(alternatives: AlternativeCalculation[]): {
    consensusLevel: number; // 0-1 scale
    outliers: string[];
    recommendation: string;
  } {
    if (alternatives.length < 2) {
      return {
        consensusLevel: 0.5,
        outliers: [],
        recommendation: 'Insufficient methods for consensus analysis. Consider using additional calculation methods.',
      };
    }

    const deviations = alternatives.map(alt => alt.deviation);
    const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    
    // Calculate standard deviation
    const variance = deviations.reduce((sum, dev) => sum + Math.pow(dev - mean, 2), 0) / deviations.length;
    const stdDev = Math.sqrt(variance);

    // Identify outliers (more than 2 standard deviations from mean)
    const outliers: string[] = [];
    
    alternatives.forEach(alt => {
      const absDeviation = Math.abs(alt.deviation - mean);
      // An outlier is more than 2 standard deviations away AND significantly different (>60 min)
      if (stdDev > 0 && absDeviation > stdDev * 2 && absDeviation > 60) {
        outliers.push(alt.method);
      }
    });

    // Calculate consensus level based on standard deviation
    // Lower stdDev = higher consensus
    const consensusLevel = Math.max(0, Math.min(1, 1 - (stdDev / 60)));

    let recommendation = '';
    if (consensusLevel > 0.9) {
      recommendation = 'Excellent agreement between methods. High confidence in result.';
    } else if (consensusLevel > 0.7) {
      recommendation = 'Good agreement between methods. Result is reliable.';
    } else if (consensusLevel > 0.5) {
      recommendation = 'Moderate agreement between methods. Consider additional verification.';
    } else {
      recommendation = 'Poor agreement between methods. Use caution and verify with authoritative sources.';
    }

    return {
      consensusLevel,
      outliers,
      recommendation,
    };
  }

  /**
   * Validate enhanced lunar event
   */
  validateEnhancedLunarEvent(event: EnhancedLunarEvent, location?: Location): ValidationResult {
    const baseValidation = this.validateLunarCalculation(event, location || { latitude: 0, longitude: 0 });

    // Additional checks for enhanced events
    const warnings = [...baseValidation.warnings];
    const recommendations = [...baseValidation.recommendations];
    let confidence = baseValidation.confidence;

    // Check accuracy estimate reliability
    if (event.accuracyEstimate.reliabilityScore < 0.7) {
      warnings.push('Low reliability score in accuracy estimate. Results may have higher uncertainty.');
      confidence *= 0.9;
    }

    // Check uncertainty
    if (event.accuracyEstimate.uncertaintyMinutes > 180) {
      warnings.push(`High uncertainty (${event.accuracyEstimate.uncertaintyMinutes} minutes). Consider this when planning time-sensitive activities.`);
      recommendations.push('Use the confidence interval range for planning purposes.');
    }

    // Check method consensus
    if (event.alternativeCalculations.length > 0) {
      const consensus = this.assessMethodConsensus(event.alternativeCalculations);
      if (consensus.consensusLevel < 0.7) {
        warnings.push('Low consensus between calculation methods.');
        recommendations.push(consensus.recommendation);
        confidence *= 0.85;
      }
    }

    return {
      isValid: confidence > 0.5,
      confidence,
      warnings,
      recommendations,
    };
  }
}

// Export singleton instance
export const accuracyValidator = new AccuracyValidator();
