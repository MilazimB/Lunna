
export type CardinalMoonPhase = 'New Moon' | 'First Quarter Moon' | 'Full Moon' | 'Third Quarter Moon';

export type LunarPhaseName = CardinalMoonPhase | 'Waxing Crescent' | 'Waxing Gibbous' | 'Waning Gibbous' | 'Waning Crescent';

export interface LunarEvent {
  eventName: CardinalMoonPhase;
  utcDate: Date;
  localSolarDate: Date;
  julianDate: number;
  accuracyNote: string;
}

export interface LunarIllumination {
  fraction: number;
  phaseName: LunarPhaseName;
  phaseAngle: number;
}

export interface SolarTimesData {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  goldenHourStart: Date;
  goldenHourEnd: Date;
  nauticalDawn: Date;
  nauticalDusk: Date;
}

// Religious Event Types

export type ReligiousTradition = 'islam' | 'judaism' | 'christianity';

export type ObservanceType = 'prayer' | 'holiday' | 'fast' | 'feast' | 'sabbath';

export type IslamicPrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'sunrise';

export type JewishPrayerType = 'shacharit' | 'mincha' | 'maariv';

export type ChristianPrayerType = 'lauds' | 'prime' | 'terce' | 'sext' | 'none' | 'vespers' | 'compline';

export type IslamicCalculationMethod =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export type JewishCalculationMethod = 'standard' | 'geonim' | 'magen_avraham';

export type Madhab = 'shafi' | 'hanafi';

export interface ReligiousEvent {
  id: string;
  name: string;
  tradition: ReligiousTradition;
  date: Date;
  localTime?: Date;
  description: string;
  significance: string;
  astronomicalBasis?: string;
  observanceType: ObservanceType;
}

export interface PrayerTime {
  name: string;
  time: Date;
  tradition: ReligiousTradition;
  calculationMethod: string;
  qiblaDirection?: number; // For Islamic prayers, in degrees from North
  // Detailed Rak'ah breakdown for Islamic prayers
  sunnahBefore?: number; // Sunnah Mu'akkadah before the Fard prayer
  fard?: number; // Obligatory Rak'ahs
  sunnahAfter?: number; // Sunnah Mu'akkadah after the Fard prayer
  witr?: number; // Witr prayer (for Isha only)
  // Legacy fields (kept for backward compatibility)
  rakahSunnah?: number; // Number of Sunnah Rak'ahs (deprecated, use sunnahBefore + sunnahAfter)
  rakahOptional?: number; // Number of optional (Nafl) Rak'ahs (deprecated)
}

export interface PrayerAdjustments {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

export interface IslamicCalculationConfig {
  method: IslamicCalculationMethod;
  madhab: Madhab;
  adjustments?: PrayerAdjustments;
}

export interface JewishCalculationConfig {
  method: JewishCalculationMethod;
  candleLightingMinutes: number;
  havdalahMinutes: number;
  useElevation: boolean;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export interface HebrewDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'ordinary_time'
  | 'lent'
  | 'easter'
  | 'pentecost';

// Enhanced Lunar Data Models

export interface AccuracyEstimate {
  confidenceInterval: { min: Date; max: Date };
  uncertaintyMinutes: number;
  calculationMethod: string;
  reliabilityScore: number; // 0-1 scale
}

export interface LibrationData {
  longitudeLibration: number; // degrees
  latitudeLibration: number; // degrees
  apparentDiameter: number; // arc minutes
}

export interface AlternativeCalculation {
  method: string;
  result: Date;
  deviation: number; // minutes from primary calculation
}

export interface MethodComparison {
  primaryMethod: string;
  primaryResult: Date;
  alternativeMethods: AlternativeCalculation[];
  recommendedResult: Date;
  consensusLevel: number; // 0-1 scale
}

export interface EnhancedLunarEvent extends LunarEvent {
  accuracyEstimate: AccuracyEstimate;
  alternativeCalculations: AlternativeCalculation[];
  atmosphericCorrection: number; // minutes
  librationData?: LibrationData;
}

export interface EnhancedLunarIllumination extends LunarIllumination {
  librationData: LibrationData;
  apparentDiameter: number; // arc minutes
  distance: number; // kilometers
}

// User Preferences and Configuration Models

export interface Location {
  latitude: number;
  longitude: number;
  name?: string; // Optional location name (e.g., city name)
  elevation?: number; // meters
  timezone?: string;
}

export interface SavedLocation extends Location {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  prayerReminders: boolean;
  celestialEvents: boolean;
  religiousHolidays: boolean;
  advanceNoticeMinutes: number[]; // e.g., [15, 30, 60] for notifications 15, 30, 60 minutes before
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timeFormat: '12h' | '24h';
  dateFormat: string;
  showAstronomicalBasis: boolean;
  showCalculationMethods: boolean;
  highContrastMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserPreferences {
  selectedTraditions: ReligiousTradition[];
  islamicCalculation?: IslamicCalculationConfig;
  jewishCalculation?: JewishCalculationConfig;
  notifications: NotificationSettings;
  displaySettings: DisplaySettings;
  locations: SavedLocation[];
  currentLocationId?: string;
  favoriteEvents: string[]; // event IDs
}

export interface ScheduledNotification {
  id: string;
  eventId: string;
  eventName: string;
  eventTime: Date;
  notificationTime: Date;
  type: 'prayer' | 'celestial' | 'holiday';
  delivered: boolean;
}

export interface ExportRecord {
  id: string;
  timestamp: Date;
  format: 'ics' | 'json' | 'csv';
  eventCount: number;
  dateRange: { start: Date; end: Date };
}

export interface CalculationCache {
  lunarEvents: CachedLunarEvent[];
  prayerTimes: CachedPrayerTime[];
  religiousEvents: CachedReligiousEvent[];
  lastUpdated: Date;
  locationHash: string;
}

export interface CachedLunarEvent {
  event: EnhancedLunarEvent;
  calculatedAt: Date;
  expiresAt: Date;
}

export interface CachedPrayerTime {
  prayerTime: PrayerTime;
  date: string; // YYYY-MM-DD
  calculatedAt: Date;
  expiresAt: Date;
}

export interface CachedReligiousEvent {
  event: ReligiousEvent;
  calculatedAt: Date;
  expiresAt: Date;
}

export interface AppStorage {
  userPreferences: UserPreferences;
  savedLocations: SavedLocation[];
  calculationCache: CalculationCache;
  notificationQueue: ScheduledNotification[];
  exportHistory: ExportRecord[];
}
