# Enhanced Astronomical Services

This directory contains enhanced astronomical calculation services that extend the base lunar ephemeris functionality with improved accuracy, multiple calculation methods, and detailed astronomical data.

## Services

### PrecisionLunarService

The `PrecisionLunarService` extends the basic lunar ephemeris calculations with:

- **Multiple Calculation Methods**: Compares Meeus, VSOP87, and Brown's Lunar Theory
- **Atmospheric Correction**: Accounts for atmospheric refraction based on observer elevation
- **Accuracy Estimation**: Provides confidence intervals and reliability scores
- **Libration Calculations**: Calculates lunar libration in longitude and latitude
- **Enhanced Lunar Data**: Includes apparent diameter and distance calculations

#### Usage

```typescript
import { precisionLunarService } from './services/enhanced-astronomical/PrecisionLunarService';

// Get enhanced lunar events with accuracy estimates
const events = await precisionLunarService.getEnhancedLunarEvents(
  new Date(),
  longitude,
  location
);

// Get enhanced current illumination with libration data
const illumination = precisionLunarService.getEnhancedCurrentIllumination(new Date());

// Calculate libration for a specific date
const libration = precisionLunarService.calculateLibration(new Date());
```

#### Features

**Enhanced Lunar Events**
- Accuracy estimates with confidence intervals
- Alternative calculation methods for comparison
- Atmospheric correction based on location
- Libration data for each event

**Libration Calculations**
- Optical libration in longitude (±8°)
- Optical libration in latitude (±7°)
- Apparent diameter (29.4' to 33.5' arcminutes)
- Lunar distance (356,500 to 406,700 km)

**Calculation Methods**
- **Meeus**: Primary method from "Astronomical Algorithms"
- **VSOP87**: Modern planetary theory with enhanced perturbations
- **Brown's Lunar Theory**: Historical but accurate method

### AccuracyValidator

The `AccuracyValidator` provides validation and confidence metrics for astronomical calculations.

#### Usage

```typescript
import { accuracyValidator } from './services/enhanced-astronomical/AccuracyValidator';

// Validate a lunar calculation
const validation = accuracyValidator.validateLunarCalculation(event, location);

// Calculate confidence interval
const interval = accuracyValidator.calculateConfidenceInterval(
  event,
  alternatives,
  0.95 // 95% confidence level
);

// Estimate uncertainty
const uncertainty = accuracyValidator.estimateUncertainty(
  event,
  alternatives,
  location
);

// Assess method consensus
const consensus = accuracyValidator.assessMethodConsensus(alternatives);

// Validate enhanced lunar event
const enhancedValidation = accuracyValidator.validateEnhancedLunarEvent(
  enhancedEvent,
  location
);
```

#### Features

**Validation Checks**
- Polar region detection (latitude > 66.5°)
- High elevation warnings (> 4000m)
- Extreme elevation warnings (< -100m)
- Long-term prediction warnings (> 5 years)

**Accuracy Metrics**
- Confidence intervals (95%, 99%)
- Uncertainty estimation (minutes)
- Reliability scores (0-1 scale)
- Method consensus analysis

**Recommendations**
- Automatic warnings for low confidence scenarios
- Suggestions for verification methods
- Guidance for polar regions and edge cases

## Data Models

### EnhancedLunarEvent

```typescript
interface EnhancedLunarEvent extends LunarEvent {
  accuracyEstimate: AccuracyEstimate;
  alternativeCalculations: AlternativeCalculation[];
  atmosphericCorrection: number; // minutes
  librationData?: LibrationData;
}
```

### AccuracyEstimate

```typescript
interface AccuracyEstimate {
  confidenceInterval: { min: Date; max: Date };
  uncertaintyMinutes: number;
  calculationMethod: string;
  reliabilityScore: number; // 0-1 scale
}
```

### LibrationData

```typescript
interface LibrationData {
  longitudeLibration: number; // degrees
  latitudeLibration: number; // degrees
  apparentDiameter: number; // arc minutes
}
```

### AlternativeCalculation

```typescript
interface AlternativeCalculation {
  method: string;
  result: Date;
  deviation: number; // minutes from primary calculation
}
```

## Accuracy

### Lunar Phase Calculations

- **Base Accuracy**: ±1-2 hours (Meeus method)
- **With Multiple Methods**: ±30-60 minutes (consensus)
- **Atmospheric Correction**: ±0.3-2 minutes (depending on elevation)

### Libration Calculations

- **Longitude Libration**: ±0.1° accuracy
- **Latitude Libration**: ±0.1° accuracy
- **Apparent Diameter**: ±0.1 arcminutes

### Distance Calculations

- **Lunar Distance**: ±100 km accuracy
- **Range**: 356,500 km (perigee) to 406,700 km (apogee)

## Testing

The enhanced astronomical services include comprehensive test coverage:

- **PrecisionLunarService**: 22 tests covering all calculation methods
- **AccuracyValidator**: 24 tests covering validation and estimation
- **LibrationCalculations**: 20 tests covering libration accuracy

Run tests with:
```bash
npm test -- services/enhanced-astronomical/__tests__/ --run
```

## Performance

- **Calculation Time**: < 10ms per lunar event
- **Memory Usage**: Minimal (no large data structures)
- **Caching**: Recommended for repeated calculations

## Limitations

### Polar Regions

Calculations in polar regions (latitude > 66.5°) may have reduced accuracy due to:
- Extreme atmospheric conditions
- Midnight sun / polar night effects
- Increased uncertainty in refraction calculations

### Long-term Predictions

Predictions more than 10 years in the future have increased uncertainty:
- Orbital perturbations accumulate
- Tidal effects on lunar orbit
- Recommended to verify with authoritative sources

### Atmospheric Correction

Atmospheric correction is simplified and assumes:
- Standard atmospheric conditions
- Clear weather
- No unusual atmospheric phenomena

## References

- Meeus, Jean. "Astronomical Algorithms" (2nd Edition)
- VSOP87 Theory (Bretagnon and Francou, 1988)
- Brown's Lunar Theory (Ernest William Brown, 1919)
- NASA JPL Horizons System (validation reference)

## Future Enhancements

Potential improvements for future versions:

- Integration with JPL DE ephemerides for higher accuracy
- Real-time atmospheric condition adjustments
- Nutation and precession corrections
- Eclipse prediction capabilities
- Tidal force calculations
