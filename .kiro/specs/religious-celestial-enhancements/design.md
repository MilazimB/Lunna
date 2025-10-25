# Design Document

## Overview

This design document outlines the architecture for enhancing the existing Celestial Events Calculator with multi-religious scheduling, improved lunar accuracy, and additional user-beneficial features. The enhancement will build upon the current React/TypeScript foundation while introducing new calculation engines, data models, and user interface components to support comprehensive religious and astronomical functionality.

## Architecture

### High-Level Architecture

The enhanced system will follow a modular, service-oriented architecture that extends the existing structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Lunar/Solar   │ │   Religious     │ │   Enhanced UX   ││
│  │   Components    │ │   Components    │ │   Components    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Enhanced      │ │   Religious     │ │   Notification  ││
│  │   Astronomical  │ │   Calendar      │ │   & Export      ││
│  │   Services      │ │   Services      │ │   Services      ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Local Storage │ │   Configuration │ │   External APIs ││
│  │   Manager       │ │   Manager       │ │   (Gemini AI)   ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Extensions

**New Dependencies:**
- `adhan` - Islamic prayer time calculations
- `hebcal` - Hebrew calendar and Jewish observances
- `moment-timezone` - Enhanced timezone handling
- `ics` - Calendar export functionality
- `react-notification-system` - User notifications
- `react-responsive` - Responsive design utilities

## Components and Interfaces

### Core Data Models

#### Religious Event Types
```typescript
export interface ReligiousEvent {
  id: string;
  name: string;
  tradition: ReligiousTradition;
  date: Date;
  localTime?: Date;
  description: string;
  significance: string;
  astronomicalBasis?: string;
  observanceType: 'prayer' | 'holiday' | 'fast' | 'feast' | 'sabbath';
}

export interface PrayerTime {
  name: string;
  time: Date;
  tradition: ReligiousTradition;
  calculationMethod: string;
  qiblaDirection?: number; // For Islamic prayers
}

export type ReligiousTradition = 'islam' | 'judaism' | 'christianity';
```

#### Enhanced Lunar Models
```typescript
export interface EnhancedLunarEvent extends LunarEvent {
  accuracyEstimate: AccuracyEstimate;
  alternativeCalculations: AlternativeCalculation[];
  atmosphericCorrection: number;
  librationData?: LibrationData;
}

export interface AccuracyEstimate {
  confidenceInterval: { min: Date; max: Date };
  uncertaintyMinutes: number;
  calculationMethod: string;
  reliabilityScore: number; // 0-1
}

export interface LibrationData {
  longitudeLibration: number;
  latitudeLibration: number;
  apparentDiameter: number;
}
```

#### User Preferences
```typescript
export interface UserPreferences {
  selectedTraditions: ReligiousTradition[];
  prayerCalculationMethods: {
    islam?: IslamicCalculationMethod;
    judaism?: JewishCalculationMethod;
  };
  notifications: NotificationSettings;
  displaySettings: DisplaySettings;
  locations: SavedLocation[];
}

export interface NotificationSettings {
  enabled: boolean;
  prayerReminders: boolean;
  celestialEvents: boolean;
  religiousHolidays: boolean;
  advanceNoticeMinutes: number[];
}
```

### Service Layer Architecture

#### Religious Calendar Services

**Islamic Calendar Service**
```typescript
export class IslamicCalendarService {
  private adhanCalculator: AdhanCalculator;
  
  async getPrayerTimes(date: Date, location: Location, method: IslamicCalculationMethod): Promise<PrayerTime[]>;
  async getIslamicHolidays(startDate: Date, endDate: Date): Promise<ReligiousEvent[]>;
  async getQiblaDirection(location: Location): Promise<number>;
  private calculateHijriDate(gregorianDate: Date): HijriDate;
}
```

**Jewish Calendar Service**
```typescript
export class JewishCalendarService {
  private hebcalApi: HebcalAPI;
  
  async getJewishObservances(date: Date, location: Location): Promise<ReligiousEvent[]>;
  async getSabbathTimes(date: Date, location: Location): Promise<{ start: Date; end: Date }>;
  async getPrayerTimes(date: Date, location: Location): Promise<PrayerTime[]>;
  private calculateHebrewDate(gregorianDate: Date): HebrewDate;
}
```

**Christian Calendar Service**
```typescript
export class ChristianCalendarService {
  async getLiturgicalEvents(date: Date): Promise<ReligiousEvent[]>;
  async getCanonicalHours(date: Date, location: Location): Promise<PrayerTime[]>;
  async getEasterDate(year: number): Promise<Date>;
  private calculateLiturgicalSeason(date: Date): LiturgicalSeason;
}
```

#### Enhanced Astronomical Services

**Precision Lunar Service**
```typescript
export class PrecisionLunarService extends LunarEphemerisService {
  async getEnhancedLunarEvents(params: LunarCalculationParams): Promise<EnhancedLunarEvent[]>;
  async calculateAccuracyEstimate(event: LunarEvent, location: Location): Promise<AccuracyEstimate>;
  async getAlternativeCalculations(event: LunarEvent): Promise<AlternativeCalculation[]>;
  private applyAtmosphericCorrection(event: LunarEvent, location: Location): LunarEvent;
  private calculateLibration(date: Date): LibrationData;
}
```

**Multi-Method Calculator**
```typescript
export class MultiMethodCalculator {
  private methods: CalculationMethod[];
  
  async compareCalculationMethods(event: AstronomicalEvent): Promise<MethodComparison>;
  async getBestEstimate(calculations: CalculationResult[]): Promise<CalculationResult>;
  private weightCalculationsByAccuracy(results: CalculationResult[]): CalculationResult;
}
```

### Component Architecture

#### Religious Components

**ReligiousSchedulePanel**
- Displays prayer times and religious events
- Supports tradition switching
- Shows countdown to next prayer/event
- Integrates with notification system

**PrayerTimeCard**
- Individual prayer time display
- Shows calculation method used
- Displays prayer time and calculation method
- Supports manual time adjustments
- Does NOT include Qibla compass (moved to standalone feature)

**QiblaCompass**
- Standalone compass component for Qibla direction
- Circular design with cardinal direction markers (N, S, E, W)
- Degree tick marks around the perimeter
- Prominent arrow pointing to Mecca
- Displays numeric degree value and directional label (e.g., "SE", "NW")
- Smooth rotation animation when direction updates
- Responsive sizing for different screen sizes

**QiblaView**
- Full-screen dedicated view for Qibla direction
- Displays large QiblaCompass component as focal point
- Shows current location information
- Provides distance to Mecca
- Accessible via button next to calendar navigation
- Responsive layout for mobile, tablet, and desktop

**ReligiousCalendarView**
- Monthly/weekly view of religious observances
- Highlights astronomical correlations
- Supports multiple tradition overlay
- Provides event details and significance

#### Enhanced Astronomical Components

**AccuracyIndicator**
- Visual representation of calculation confidence
- Shows uncertainty ranges
- Displays alternative calculation comparisons
- Provides methodology explanations

**LunarDetailPanel**
- Enhanced lunar phase information
- Libration data visualization
- Atmospheric correction details
- Historical accuracy tracking

#### User Experience Components

**NotificationCenter**
- Manages all user notifications
- Supports different notification types
- Handles scheduling and delivery
- Provides notification history

**LocationManager**
- Multiple location support
- Automatic timezone detection
- GPS integration with fallbacks
- Location-based calculation caching

**ExportManager**
- Calendar file generation (ICS)
- Data export in multiple formats
- Sharing functionality
- Privacy-aware data handling

## Data Models

### Storage Architecture

**Local Storage Structure**
```typescript
interface AppStorage {
  userPreferences: UserPreferences;
  savedLocations: SavedLocation[];
  calculationCache: CalculationCache;
  notificationQueue: ScheduledNotification[];
  exportHistory: ExportRecord[];
}
```

**Calculation Caching**
```typescript
interface CalculationCache {
  lunarEvents: CachedLunarEvent[];
  prayerTimes: CachedPrayerTime[];
  religiousEvents: CachedReligiousEvent[];
  lastUpdated: Date;
  locationHash: string;
}
```

### Configuration Management

**Religious Calculation Methods**
```typescript
interface IslamicCalculationMethod {
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  madhab: 'shafi' | 'hanafi';
  adjustments: PrayerAdjustments;
}

interface JewishCalculationMethod {
  name: string;
  candleLightingMinutes: number;
  havdalahMinutes: number;
  useElevation: boolean;
}
```

## Error Handling

### Calculation Error Management

**Accuracy Validation**
```typescript
class AccuracyValidator {
  validateLunarCalculation(event: LunarEvent, location: Location): ValidationResult;
  validatePrayerTime(prayer: PrayerTime, location: Location): ValidationResult;
  handlePolarRegions(location: Location, date: Date): PolarRegionStrategy;
}
```

**Fallback Strategies**
- Primary calculation failure → Secondary method
- Network unavailable → Cached data with warnings
- GPS failure → Manual location entry
- Polar regions → Special calculation rules

### User Error Handling

**Input Validation**
- Location coordinate validation
- Date range validation
- Religious preference validation
- Export format validation

**Graceful Degradation**
- Core functionality maintained during partial failures
- Clear error messages with suggested actions
- Offline mode with cached data
- Progressive enhancement for advanced features

## Testing Strategy

### Unit Testing

**Calculation Accuracy Tests**
```typescript
describe('PrecisionLunarService', () => {
  test('should calculate lunar events within acceptable accuracy', () => {
    // Test against known astronomical events
  });
  
  test('should handle edge cases in polar regions', () => {
    // Test extreme latitude scenarios
  });
});
```

**Religious Calendar Tests**
```typescript
describe('IslamicCalendarService', () => {
  test('should calculate prayer times matching reference implementations', () => {
    // Compare against established prayer time calculators
  });
});
```

### Integration Testing

**Cross-Service Integration**
- Religious events correlation with astronomical events
- Notification system integration
- Export functionality end-to-end
- Multi-location calculation consistency

### Accessibility Testing

**Screen Reader Compatibility**
- All components properly labeled
- Navigation flow testing
- Audio description accuracy
- Keyboard navigation paths

**Responsive Design Testing**
- Mobile device compatibility
- Tablet layout optimization
- Desktop multi-panel layouts
- Orientation change handling

### Performance Testing

**Calculation Performance**
- Large date range calculations
- Multiple location processing
- Real-time update performance
- Memory usage optimization

**User Experience Performance**
- Component rendering speed
- Notification delivery timing
- Export generation speed
- Offline functionality

## Implementation Phases

### Phase 1: Core Religious Integration
- Basic prayer time calculations
- Simple religious event display
- User preference system
- Islamic and Jewish calendar integration

### Phase 2: Enhanced Accuracy System
- Multi-method lunar calculations
- Accuracy estimation implementation
- Atmospheric correction integration
- Libration data display

### Phase 3: Advanced Features
- Notification system
- Export functionality
- Multiple location support
- Christian calendar integration

### Phase 4: User Experience Enhancement
- Responsive design optimization
- Accessibility improvements
- Performance optimization
- Internationalization support

## Security and Privacy Considerations

### Data Privacy
- Local storage for sensitive religious preferences
- Optional cloud sync with encryption
- Minimal data collection policy
- User control over data sharing

### API Security
- Secure API key management
- Rate limiting implementation
- Error handling without data exposure
- Input sanitization for all user data

### Accessibility Compliance
- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast mode support