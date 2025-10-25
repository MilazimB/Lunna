/**
 * Enhanced Astronomical Services
 * 
 * This module provides enhanced astronomical calculations with improved accuracy,
 * multiple calculation methods, and detailed validation.
 */

export { PrecisionLunarService, precisionLunarService } from './PrecisionLunarService';
export { AccuracyValidator, accuracyValidator } from './AccuracyValidator';

export type {
  ValidationResult,
  UncertaintyEstimate,
} from './AccuracyValidator';
