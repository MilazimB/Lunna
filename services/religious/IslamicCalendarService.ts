import { 
  Coordinates, 
  CalculationMethod, 
  PrayerTimes, 
  Prayer,
  Qibla,
  Madhab as AdhanMadhab
} from 'adhan';
import {
  PrayerTime,
  Location,
  IslamicCalculationConfig,
  IslamicCalculationMethod,
  Madhab,
  PrayerAdjustments,
  ReligiousEvent,
  HijriDate
} from '../../types';

/**
 * Service for Islamic calendar calculations including prayer times and Qibla direction
 */
export class IslamicCalendarService {
  /**
   * Get prayer times for a specific date and location
   */
  async getPrayerTimes(
    date: Date,
    location: Location,
    config: IslamicCalculationConfig
  ): Promise<PrayerTime[]> {
    try {
      // Create coordinates for adhan library
      const coordinates = new Coordinates(location.latitude, location.longitude);
      
      // Get calculation method
      const calculationMethod = this.getCalculationMethod(config.method);
      
      // Set madhab
      calculationMethod.madhab = config.madhab === 'hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;
      
      // Apply adjustments if provided
      if (config.adjustments) {
        this.applyAdjustments(calculationMethod, config.adjustments);
      }
      
      // Calculate prayer times
      const prayerTimes = new PrayerTimes(coordinates, date, calculationMethod);
      
      // Get Qibla direction for this location
      const qiblaDirection = await this.getQiblaDirection(location);
      
      // Convert to our PrayerTime format with Rak'ah information
      // Based on Daily Prayer Rak'ah Breakdown table
      // Note: Sunrise (Ishraq) is not included as it's not a prayer time but an optional prayer
      const prayers: PrayerTime[] = [
        {
          name: 'Fajr',
          time: prayerTimes.fajr,
          tradition: 'islam',
          calculationMethod: config.method,
          qiblaDirection,
          sunnahBefore: 2, // 2 Sunnah Mu'akkadah before
          fard: 2, // 2 obligatory Rak'ahs
          sunnahAfter: 0, // No Sunnah after
          witr: 0 // No Witr
        },
        {
          name: 'Dhuhr',
          time: prayerTimes.dhuhr,
          tradition: 'islam',
          calculationMethod: config.method,
          qiblaDirection,
          sunnahBefore: 4, // 4 Sunnah Mu'akkadah before (2+2)
          fard: 4, // 4 obligatory Rak'ahs
          sunnahAfter: 2, // 2 Sunnah Mu'akkadah after
          witr: 0 // No Witr
        },
        {
          name: 'Asr',
          time: prayerTimes.asr,
          tradition: 'islam',
          calculationMethod: config.method,
          qiblaDirection,
          sunnahBefore: 4, // 4 Sunnah Mu'akkadah before (2+2)
          fard: 4, // 4 obligatory Rak'ahs
          sunnahAfter: 0, // No Sunnah after
          witr: 0 // No Witr
        },
        {
          name: 'Maghrib',
          time: prayerTimes.maghrib,
          tradition: 'islam',
          calculationMethod: config.method,
          qiblaDirection,
          sunnahBefore: 2, // 2 Sunnah Mu'akkadah before
          fard: 3, // 3 obligatory Rak'ahs
          sunnahAfter: 2, // 2 Sunnah Mu'akkadah after
          witr: 0 // No Witr
        },
        {
          name: 'Isha',
          time: prayerTimes.isha,
          tradition: 'islam',
          calculationMethod: config.method,
          qiblaDirection,
          sunnahBefore: 2, // 2 Sunnah Mu'akkadah before
          fard: 4, // 4 obligatory Rak'ahs
          sunnahAfter: 2, // 2 Sunnah Mu'akkadah after
          witr: 3 // 3 Rak'ah Witr (considered Wajib in some schools)
        }
      ];
      
      return prayers;
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      throw new Error(`Failed to calculate prayer times: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get Qibla direction (direction to Mecca) for a location
   * Returns direction in degrees from North (0-360)
   */
  async getQiblaDirection(location: Location): Promise<number> {
    try {
      const coordinates = new Coordinates(location.latitude, location.longitude);
      const qibla = Qibla(coordinates);
      return qibla;
    } catch (error) {
      console.error('Error calculating Qibla direction:', error);
      throw new Error(`Failed to calculate Qibla direction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get the next prayer time from current moment
   */
  getNextPrayer(prayers: PrayerTime[], currentTime: Date = new Date()): PrayerTime | null {
    const futurePrayers = prayers.filter(p => p.time > currentTime);
    return futurePrayers.length > 0 ? futurePrayers[0] : null;
  }
  
  /**
   * Get the current prayer time (most recent past prayer)
   */
  getCurrentPrayer(prayers: PrayerTime[], currentTime: Date = new Date()): PrayerTime | null {
    const pastPrayers = prayers.filter(p => p.time <= currentTime);
    return pastPrayers.length > 0 ? pastPrayers[pastPrayers.length - 1] : null;
  }
  
  /**
   * Map our calculation method enum to adhan library's CalculationMethod
   */
  private getCalculationMethod(method: IslamicCalculationMethod): CalculationMethod {
    switch (method) {
      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return CalculationMethod.Egyptian();
      case 'Karachi':
        return CalculationMethod.Karachi();
      case 'UmmAlQura':
        return CalculationMethod.UmmAlQura();
      case 'Dubai':
        return CalculationMethod.Dubai();
      case 'MoonsightingCommittee':
        return CalculationMethod.MoonsightingCommittee();
      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();
      case 'Kuwait':
        return CalculationMethod.Kuwait();
      case 'Qatar':
        return CalculationMethod.Qatar();
      case 'Singapore':
        return CalculationMethod.Singapore();
      case 'Tehran':
        return CalculationMethod.Tehran();
      case 'Turkey':
        return CalculationMethod.Turkey();
      default:
        return CalculationMethod.MuslimWorldLeague();
    }
  }
  
  /**
   * Apply manual adjustments to prayer times
   */
  private applyAdjustments(
    calculationMethod: CalculationMethod,
    adjustments: PrayerAdjustments
  ): void {
    if (adjustments.fajr !== undefined) {
      calculationMethod.adjustments.fajr = adjustments.fajr;
    }
    if (adjustments.sunrise !== undefined) {
      calculationMethod.adjustments.sunrise = adjustments.sunrise;
    }
    if (adjustments.dhuhr !== undefined) {
      calculationMethod.adjustments.dhuhr = adjustments.dhuhr;
    }
    if (adjustments.asr !== undefined) {
      calculationMethod.adjustments.asr = adjustments.asr;
    }
    if (adjustments.maghrib !== undefined) {
      calculationMethod.adjustments.maghrib = adjustments.maghrib;
    }
    if (adjustments.isha !== undefined) {
      calculationMethod.adjustments.isha = adjustments.isha;
    }
  }
  
  /**
   * Get Islamic holidays for a date range
   * Returns major Islamic observances based on the Hijri calendar
   */
  async getIslamicHolidays(startDate: Date, endDate: Date): Promise<ReligiousEvent[]> {
    try {
      const holidays: ReligiousEvent[] = [];
      
      // Iterate through each day in the range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateForHoliday = new Date(currentDate); // Create a new Date object
        const hijriDate = this.gregorianToHijri(dateForHoliday);
        const holiday = this.getHolidayForHijriDate(hijriDate, dateForHoliday);
        
        if (holiday) {
          holidays.push(holiday);
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return holidays;
    } catch (error) {
      console.error('Error calculating Islamic holidays:', error);
      throw new Error(`Failed to calculate Islamic holidays: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Convert Gregorian date to Hijri date
   * Uses a simplified but more accurate algorithm
   */
  private gregorianToHijri(date: Date): HijriDate {
    // Get Julian Day Number
    const jd = this.gregorianToJulian(date);
    
    // Islamic calendar epoch (July 16, 622 CE) in Julian Day Number
    const islamicEpoch = 1948439;
    const daysSinceEpoch = jd - islamicEpoch;
    
    // More accurate lunar year and month calculations
    const lunarYear = 354.36707; // Average Islamic year in days
    const lunarMonth = 29.530589; // Average Islamic month in days
    
    // Calculate Hijri year
    let hijriYear = Math.floor(daysSinceEpoch / lunarYear) + 1;
    let remainingDays = daysSinceEpoch - ((hijriYear - 1) * lunarYear);
    
    // Calculate Hijri month
    let hijriMonth = Math.floor(remainingDays / lunarMonth) + 1;
    let hijriDay = Math.floor(remainingDays - ((hijriMonth - 1) * lunarMonth)) + 1;
    
    // Adjust for month overflow
    if (hijriMonth > 12) {
      hijriYear++;
      hijriMonth = hijriMonth - 12;
    }
    
    // Ensure valid ranges
    if (hijriMonth < 1) hijriMonth = 1;
    if (hijriMonth > 12) hijriMonth = 12;
    if (hijriDay < 1) hijriDay = 1;
    if (hijriDay > 30) hijriDay = 30;
    
    const monthNames = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
      'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'
    ];
    
    return {
      year: hijriYear,
      month: hijriMonth,
      day: hijriDay,
      monthName: monthNames[hijriMonth - 1]
    };
  }
  
  /**
   * Convert Gregorian date to Julian Day Number
   */
  private gregorianToJulian(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + 
           Math.floor(y / 400) - 32045;
  }
  
  /**
   * Get holiday information for a specific Hijri date
   */
  private getHolidayForHijriDate(hijriDate: HijriDate, gregorianDate: Date): ReligiousEvent | null {
    const { month, day } = hijriDate;
    
    // Major Islamic holidays
    const holidays: { [key: string]: Omit<ReligiousEvent, 'id' | 'date' | 'localTime'> } = {
      '1-1': {
        name: 'Islamic New Year (Hijri New Year)',
        tradition: 'islam',
        description: 'The first day of Muharram, marking the beginning of the Islamic lunar calendar year.',
        significance: 'Commemorates the Hijra (migration) of Prophet Muhammad from Mecca to Medina in 622 CE.',
        astronomicalBasis: 'Based on the sighting of the new moon of Muharram',
        observanceType: 'holiday'
      },
      '1-10': {
        name: 'Day of Ashura',
        tradition: 'islam',
        description: 'The tenth day of Muharram, a day of fasting and remembrance.',
        significance: 'Commemorates various historical events, including the martyrdom of Husayn ibn Ali. Many Muslims fast on this day.',
        astronomicalBasis: 'Tenth day of the lunar month of Muharram',
        observanceType: 'fast'
      },
      '3-12': {
        name: 'Mawlid al-Nabi (Prophet\'s Birthday)',
        tradition: 'islam',
        description: 'Celebration of the birth of Prophet Muhammad.',
        significance: 'Observed by many Muslims worldwide with gatherings, prayers, and charitable acts.',
        astronomicalBasis: 'Twelfth day of the lunar month of Rabi al-Awwal',
        observanceType: 'holiday'
      },
      '7-27': {
        name: 'Isra and Mi\'raj',
        tradition: 'islam',
        description: 'Commemorates the night journey of Prophet Muhammad from Mecca to Jerusalem and his ascension to heaven.',
        significance: 'A miraculous journey that holds great spiritual significance in Islamic tradition.',
        astronomicalBasis: 'Twenty-seventh day of the lunar month of Rajab',
        observanceType: 'holiday'
      },
      '8-15': {
        name: 'Laylat al-Bara\'ah (Night of Forgiveness)',
        tradition: 'islam',
        description: 'The night of the middle of Shaban, considered a night of forgiveness and blessings.',
        significance: 'Many Muslims spend this night in prayer and seek forgiveness.',
        astronomicalBasis: 'Fifteenth day of the lunar month of Shaban (full moon)',
        observanceType: 'holiday'
      },
      '9-1': {
        name: 'First Day of Ramadan',
        tradition: 'islam',
        description: 'The beginning of the holy month of fasting.',
        significance: 'Muslims fast from dawn to sunset throughout this month, commemorating the revelation of the Quran.',
        astronomicalBasis: 'Based on the sighting of the new moon of Ramadan',
        observanceType: 'fast'
      },
      '9-27': {
        name: 'Laylat al-Qadr (Night of Power)',
        tradition: 'islam',
        description: 'The night when the Quran was first revealed to Prophet Muhammad.',
        significance: 'Considered the holiest night of the year, better than a thousand months. Typically observed on the 27th, though it could be any odd night in the last ten days of Ramadan.',
        astronomicalBasis: 'Twenty-seventh day of the lunar month of Ramadan',
        observanceType: 'holiday'
      },
      '10-1': {
        name: 'Eid al-Fitr',
        tradition: 'islam',
        description: 'Festival of Breaking the Fast, marking the end of Ramadan.',
        significance: 'A joyous celebration with special prayers, feasting, and charity. One of the two major Islamic holidays.',
        astronomicalBasis: 'Based on the sighting of the new moon of Shawwal',
        observanceType: 'feast'
      },
      '12-9': {
        name: 'Day of Arafah',
        tradition: 'islam',
        description: 'The day when pilgrims gather at Mount Arafat during Hajj.',
        significance: 'Considered the most important day of Hajj. Non-pilgrims often fast on this day.',
        astronomicalBasis: 'Ninth day of the lunar month of Dhul-Hijjah',
        observanceType: 'holiday'
      },
      '12-10': {
        name: 'Eid al-Adha',
        tradition: 'islam',
        description: 'Festival of Sacrifice, commemorating Abraham\'s willingness to sacrifice his son.',
        significance: 'The second major Islamic holiday, marked by the sacrifice of an animal and distribution of meat to the poor.',
        astronomicalBasis: 'Tenth day of the lunar month of Dhul-Hijjah',
        observanceType: 'feast'
      }
    };
    
    const key = `${month}-${day}`;
    const holidayData = holidays[key];
    
    if (holidayData) {
      return {
        id: `islamic-${hijriDate.year}-${month}-${day}`,
        date: gregorianDate,
        localTime: gregorianDate,
        ...holidayData
      };
    }
    
    return null;
  }
  
  /**
   * Convert Hijri date to approximate Gregorian date
   * Note: This is an approximation and may differ by 1-2 days from actual moon sighting
   */
  hijriToGregorian(hijriDate: HijriDate): Date {
    const islamicEpoch = 1948440; // Julian Day Number of Islamic epoch
    const lunarYearDays = 354.36667;
    const lunarMonthDays = 29.530588;
    
    // Calculate days since Islamic epoch
    const daysSinceEpoch = (hijriDate.year * lunarYearDays) + 
                          ((hijriDate.month - 1) * lunarMonthDays) + 
                          hijriDate.day;
    
    const jdn = islamicEpoch + daysSinceEpoch;
    
    // Convert JDN to Gregorian
    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor((146097 * b) / 4);
    let d = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor((1461 * d) / 4);
    let m = Math.floor((5 * e + 2) / 153);
    
    let day = e - Math.floor((153 * m + 2) / 5) + 1;
    let month = m + 3 - 12 * Math.floor(m / 10);
    let year = 100 * b + d - 4800 + Math.floor(m / 10);
    
    return new Date(year, month - 1, day);
  }
  
  /**
   * Get the current Hijri date
   */
  getCurrentHijriDate(): HijriDate {
    return this.gregorianToHijri(new Date());
  }
  
  /**
   * Check if a given date is during Ramadan
   */
  isRamadan(date: Date): boolean {
    const hijriDate = this.gregorianToHijri(date);
    return hijriDate.month === 9;
  }
  
  /**
   * Get the start and end dates of Ramadan for a given Gregorian year
   */
  getRamadanDates(gregorianYear: number): { start: Date; end: Date } {
    // Find Ramadan (month 9) in the Hijri year that overlaps with the Gregorian year
    const midYear = new Date(gregorianYear, 6, 1); // July 1st
    const hijriMidYear = this.gregorianToHijri(midYear);
    
    // Calculate start of Ramadan
    const ramadanStart = this.hijriToGregorian({
      year: hijriMidYear.year,
      month: 9,
      day: 1,
      monthName: 'Ramadan'
    });
    
    // Calculate end of Ramadan (29 or 30 days later)
    const ramadanEnd = new Date(ramadanStart);
    ramadanEnd.setDate(ramadanEnd.getDate() + 29);
    
    return { start: ramadanStart, end: ramadanEnd };
  }
}
