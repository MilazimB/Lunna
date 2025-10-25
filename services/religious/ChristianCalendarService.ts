import {
  ReligiousEvent,
  Location,
  PrayerTime,
  LiturgicalSeason
} from '../../types';
import SunCalc from 'suncalc';

/**
 * Service for Christian liturgical calendar calculations including feast days,
 * liturgical seasons, and canonical hours
 */
export class ChristianCalendarService {
  /**
   * Get liturgical events (feast days, holy days, seasons) for a date range
   */
  async getLiturgicalEvents(
    startDate: Date,
    endDate: Date,
    denomination: 'catholic' | 'orthodox' | 'protestant' = 'catholic'
  ): Promise<ReligiousEvent[]> {
    try {
      const events: ReligiousEvent[] = [];
      
      // Get all years in the range
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        const yearEvents = await this.getLiturgicalEventsForYear(year, denomination);
        
        // Filter events within the date range
        const filteredEvents = yearEvents.filter(
          event => event.date >= startDate && event.date <= endDate
        );
        
        events.push(...filteredEvents);
      }
      
      // Sort by date
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return events;
    } catch (error) {
      console.error('Error calculating liturgical events:', error);
      throw new Error(`Failed to calculate liturgical events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get liturgical events for a specific year
   */
  private async getLiturgicalEventsForYear(
    year: number,
    denomination: 'catholic' | 'orthodox' | 'protestant'
  ): Promise<ReligiousEvent[]> {
    const events: ReligiousEvent[] = [];
    
    // Calculate Easter date (central to liturgical calendar)
    const easterDate = await this.getEasterDate(year, denomination);
    
    // Add fixed feast days
    events.push(...this.getFixedFeastDays(year));
    
    // Add moveable feasts (based on Easter)
    events.push(...this.getMoveableFeastDays(year, easterDate));
    
    // Add liturgical season markers
    events.push(...this.getLiturgicalSeasonMarkers(year, easterDate));
    
    return events;
  }
  
  /**
   * Calculate Easter date using Computus algorithm
   * Supports both Western (Gregorian) and Eastern (Julian) calculations
   */
  async getEasterDate(
    year: number,
    denomination: 'catholic' | 'orthodox' | 'protestant' = 'catholic'
  ): Promise<Date> {
    if (denomination === 'orthodox') {
      return this.calculateOrthodoxEaster(year);
    } else {
      return this.calculateWesternEaster(year);
    }
  }

  /**
   * Calculate Western (Catholic/Protestant) Easter using the Meeus/Jones/Butcher algorithm
   */
  private calculateWesternEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }
  
  /**
   * Calculate Orthodox Easter using the Julian calendar algorithm
   */
  private calculateOrthodoxEaster(year: number): Date {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;
    
    // Convert from Julian to Gregorian calendar
    const julianDate = new Date(year, month - 1, day);
    const gregorianDate = new Date(julianDate);
    gregorianDate.setDate(gregorianDate.getDate() + 13); // Julian-Gregorian offset for 20th-21st century
    
    return gregorianDate;
  }

  /**
   * Get fixed feast days (dates that don't change year to year)
   */
  private getFixedFeastDays(year: number): ReligiousEvent[] {
    const fixedFeasts: Array<{
      month: number;
      day: number;
      name: string;
      description: string;
      significance: string;
      observanceType: 'holiday' | 'feast';
    }> = [
      {
        month: 1, day: 1,
        name: 'Solemnity of Mary, Mother of God',
        description: 'Celebrates Mary\'s role as the Mother of God.',
        significance: 'A holy day of obligation in the Catholic Church, honoring the Blessed Virgin Mary.',
        observanceType: 'feast'
      },
      {
        month: 1, day: 6,
        name: 'Epiphany',
        description: 'Commemorates the visit of the Magi to the infant Jesus.',
        significance: 'Celebrates the manifestation of Christ to the Gentiles, marking the end of the Christmas season.',
        observanceType: 'feast'
      },
      {
        month: 2, day: 2,
        name: 'Presentation of the Lord (Candlemas)',
        description: 'Commemorates the presentation of Jesus at the Temple.',
        significance: 'Celebrates Jesus being presented at the Temple 40 days after his birth, as required by Jewish law.',
        observanceType: 'feast'
      },
      {
        month: 3, day: 25,
        name: 'Annunciation',
        description: 'Celebrates the announcement by the Angel Gabriel to Mary.',
        significance: 'Commemorates when the angel told Mary she would conceive and bear the Son of God.',
        observanceType: 'feast'
      },
      {
        month: 6, day: 24,
        name: 'Nativity of John the Baptist',
        description: 'Celebrates the birth of John the Baptist.',
        significance: 'One of the few saints whose birth is celebrated, occurring six months before Christmas.',
        observanceType: 'feast'
      },
      {
        month: 8, day: 6,
        name: 'Transfiguration',
        description: 'Commemorates the transfiguration of Jesus on Mount Tabor.',
        significance: 'Celebrates when Jesus\' divine nature was revealed to Peter, James, and John.',
        observanceType: 'feast'
      },
      {
        month: 8, day: 15,
        name: 'Assumption of Mary',
        description: 'Celebrates the assumption of Mary into heaven.',
        significance: 'A holy day of obligation celebrating Mary being taken body and soul into heavenly glory.',
        observanceType: 'feast'
      },
      {
        month: 9, day: 8,
        name: 'Nativity of Mary',
        description: 'Celebrates the birth of the Blessed Virgin Mary.',
        significance: 'Honors the birth of Mary, mother of Jesus, nine months after the Immaculate Conception.',
        observanceType: 'feast'
      },
      {
        month: 11, day: 1,
        name: 'All Saints\' Day',
        description: 'Honors all saints, known and unknown.',
        significance: 'A holy day of obligation celebrating all saints who have attained heaven.',
        observanceType: 'feast'
      },
      {
        month: 12, day: 8,
        name: 'Immaculate Conception',
        description: 'Celebrates Mary being conceived without original sin.',
        significance: 'A holy day of obligation honoring Mary\'s conception in her mother\'s womb.',
        observanceType: 'feast'
      },
      {
        month: 12, day: 25,
        name: 'Christmas',
        description: 'Celebrates the birth of Jesus Christ.',
        significance: 'The most important feast celebrating the Incarnation of God as man.',
        observanceType: 'feast'
      }
    ];
    
    return fixedFeasts.map(feast => ({
      id: `christian-${year}-${feast.month}-${feast.day}`,
      name: feast.name,
      tradition: 'christianity' as const,
      date: new Date(year, feast.month - 1, feast.day),
      localTime: new Date(year, feast.month - 1, feast.day),
      description: feast.description,
      significance: feast.significance,
      astronomicalBasis: 'Fixed date in the Gregorian calendar',
      observanceType: feast.observanceType
    }));
  }

  /**
   * Get moveable feast days (dates that change based on Easter)
   */
  private getMoveableFeastDays(year: number, easterDate: Date): ReligiousEvent[] {
    const moveableFeasts: ReligiousEvent[] = [];
    
    // Ash Wednesday (46 days before Easter)
    // Note: setDate subtracts days, so -47 gives us 46 days difference
    const ashWednesday = new Date(easterDate);
    ashWednesday.setDate(ashWednesday.getDate() - 47);
    moveableFeasts.push({
      id: `christian-${year}-ash-wednesday`,
      name: 'Ash Wednesday',
      tradition: 'christianity',
      date: ashWednesday,
      localTime: ashWednesday,
      description: 'Marks the beginning of Lent, a 40-day period of fasting and penance.',
      significance: 'Christians receive ashes on their foreheads as a sign of repentance and mortality.',
      astronomicalBasis: '46 days before Easter Sunday',
      observanceType: 'fast'
    });
    
    // Palm Sunday (7 days before Easter)
    const palmSunday = new Date(easterDate);
    palmSunday.setDate(palmSunday.getDate() - 7);
    moveableFeasts.push({
      id: `christian-${year}-palm-sunday`,
      name: 'Palm Sunday',
      tradition: 'christianity',
      date: palmSunday,
      localTime: palmSunday,
      description: 'Commemorates Jesus\' triumphal entry into Jerusalem.',
      significance: 'Marks the beginning of Holy Week, the most sacred week of the Christian year.',
      astronomicalBasis: 'Sunday before Easter',
      observanceType: 'feast'
    });
    
    // Maundy Thursday (3 days before Easter)
    const maundyThursday = new Date(easterDate);
    maundyThursday.setDate(maundyThursday.getDate() - 3);
    moveableFeasts.push({
      id: `christian-${year}-maundy-thursday`,
      name: 'Maundy Thursday',
      tradition: 'christianity',
      date: maundyThursday,
      localTime: maundyThursday,
      description: 'Commemorates the Last Supper of Jesus with his disciples.',
      significance: 'Celebrates the institution of the Eucharist and Jesus washing the disciples\' feet.',
      astronomicalBasis: 'Thursday before Easter',
      observanceType: 'feast'
    });
    
    // Good Friday (2 days before Easter)
    const goodFriday = new Date(easterDate);
    goodFriday.setDate(goodFriday.getDate() - 2);
    moveableFeasts.push({
      id: `christian-${year}-good-friday`,
      name: 'Good Friday',
      tradition: 'christianity',
      date: goodFriday,
      localTime: goodFriday,
      description: 'Commemorates the crucifixion and death of Jesus Christ.',
      significance: 'The most solemn day of the Christian year, observing Jesus\' sacrifice for humanity.',
      astronomicalBasis: 'Friday before Easter',
      observanceType: 'fast'
    });
    
    // Easter Sunday
    moveableFeasts.push({
      id: `christian-${year}-easter`,
      name: 'Easter Sunday',
      tradition: 'christianity',
      date: easterDate,
      localTime: easterDate,
      description: 'Celebrates the resurrection of Jesus Christ from the dead.',
      significance: 'The most important feast in Christianity, celebrating victory over sin and death.',
      astronomicalBasis: 'First Sunday after the first full moon following the spring equinox',
      observanceType: 'feast'
    });
    
    // Ascension (39 days after Easter)
    const ascension = new Date(easterDate);
    ascension.setDate(ascension.getDate() + 39);
    moveableFeasts.push({
      id: `christian-${year}-ascension`,
      name: 'Ascension of Jesus',
      tradition: 'christianity',
      date: ascension,
      localTime: ascension,
      description: 'Commemorates Jesus\' ascension into heaven.',
      significance: 'Celebrates Jesus ascending to heaven 40 days after his resurrection.',
      astronomicalBasis: '40 days after Easter (39 days for Thursday observance)',
      observanceType: 'feast'
    });
    
    // Pentecost (49 days after Easter)
    const pentecost = new Date(easterDate);
    pentecost.setDate(pentecost.getDate() + 49);
    moveableFeasts.push({
      id: `christian-${year}-pentecost`,
      name: 'Pentecost',
      tradition: 'christianity',
      date: pentecost,
      localTime: pentecost,
      description: 'Celebrates the descent of the Holy Spirit upon the apostles.',
      significance: 'Marks the birth of the Church, 50 days after Easter.',
      astronomicalBasis: '50 days after Easter Sunday',
      observanceType: 'feast'
    });
    
    // Trinity Sunday (56 days after Easter)
    const trinitySunday = new Date(easterDate);
    trinitySunday.setDate(trinitySunday.getDate() + 56);
    moveableFeasts.push({
      id: `christian-${year}-trinity-sunday`,
      name: 'Trinity Sunday',
      tradition: 'christianity',
      date: trinitySunday,
      localTime: trinitySunday,
      description: 'Honors the Holy Trinity: Father, Son, and Holy Spirit.',
      significance: 'Celebrates the Christian doctrine of one God in three persons.',
      astronomicalBasis: 'First Sunday after Pentecost',
      observanceType: 'feast'
    });
    
    // Corpus Christi (60 days after Easter)
    const corpusChristi = new Date(easterDate);
    corpusChristi.setDate(corpusChristi.getDate() + 60);
    moveableFeasts.push({
      id: `christian-${year}-corpus-christi`,
      name: 'Corpus Christi',
      tradition: 'christianity',
      date: corpusChristi,
      localTime: corpusChristi,
      description: 'Honors the Eucharist, the body and blood of Christ.',
      significance: 'Celebrates the real presence of Christ in the Eucharist.',
      astronomicalBasis: 'Thursday after Trinity Sunday (60 days after Easter)',
      observanceType: 'feast'
    });
    
    return moveableFeasts;
  }

  /**
   * Get liturgical season markers
   */
  private getLiturgicalSeasonMarkers(year: number, easterDate: Date): ReligiousEvent[] {
    const markers: ReligiousEvent[] = [];
    
    // Advent begins (4th Sunday before Christmas)
    const christmas = new Date(year, 11, 25);
    const adventStart = this.getNthSundayBefore(christmas, 4);
    markers.push({
      id: `christian-${year}-advent-start`,
      name: 'First Sunday of Advent',
      tradition: 'christianity',
      date: adventStart,
      localTime: adventStart,
      description: 'Marks the beginning of the liturgical year and the Advent season.',
      significance: 'A season of preparation for Christmas, lasting four weeks.',
      astronomicalBasis: 'Fourth Sunday before Christmas',
      observanceType: 'holiday'
    });
    
    // Christ the King (last Sunday before Advent)
    const christTheKing = new Date(adventStart);
    christTheKing.setDate(christTheKing.getDate() - 7);
    markers.push({
      id: `christian-${year}-christ-the-king`,
      name: 'Christ the King',
      tradition: 'christianity',
      date: christTheKing,
      localTime: christTheKing,
      description: 'Celebrates Jesus Christ as King of the Universe.',
      significance: 'The last Sunday of Ordinary Time, concluding the liturgical year.',
      astronomicalBasis: 'Last Sunday before Advent',
      observanceType: 'feast'
    });
    
    return markers;
  }
  
  /**
   * Get the Nth Sunday before a given date
   */
  private getNthSundayBefore(date: Date, n: number): Date {
    const result = new Date(date);
    
    // Find the Sunday before or on the date
    const dayOfWeek = result.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    result.setDate(result.getDate() - daysToSubtract);
    
    // Go back n-1 more weeks
    result.setDate(result.getDate() - (7 * (n - 1)));
    
    return result;
  }
  
  /**
   * Determine the liturgical season for a given date
   */
  getLiturgicalSeason(date: Date): LiturgicalSeason {
    const year = date.getFullYear();
    const easterDate = this.calculateWesternEaster(year);
    
    // Advent: 4 Sundays before Christmas
    const christmas = new Date(year, 11, 25);
    const adventStart = this.getNthSundayBefore(christmas, 4);
    
    // Christmas season: Christmas to Baptism of the Lord (Sunday after Epiphany)
    // Need to check next year's Epiphany if we're in late December
    let epiphany: Date;
    let baptismOfLord: Date;
    
    if (date.getMonth() === 11 && date.getDate() >= 25) {
      // Late December - Christmas season extends into next year
      epiphany = new Date(year + 1, 0, 6);
      baptismOfLord = this.getNextSunday(epiphany);
    } else {
      epiphany = new Date(year, 0, 6);
      baptismOfLord = this.getNextSunday(epiphany);
    }
    
    // Lent: Ash Wednesday to Holy Saturday
    const ashWednesday = new Date(easterDate);
    ashWednesday.setDate(ashWednesday.getDate() - 47);
    const holySaturday = new Date(easterDate);
    holySaturday.setDate(holySaturday.getDate() - 1);
    
    // Easter season: Easter to Pentecost
    const pentecost = new Date(easterDate);
    pentecost.setDate(pentecost.getDate() + 49);
    
    // Check which season the date falls in
    if (date >= adventStart && date < christmas) {
      return 'advent';
    } else if ((date >= christmas && date.getFullYear() === year) || 
               (date <= baptismOfLord && date.getFullYear() === year + 1)) {
      return 'christmas';
    } else if (date >= ashWednesday && date <= holySaturday) {
      return 'lent';
    } else if (date >= easterDate && date <= pentecost) {
      return 'easter';
    } else if (date.getMonth() === 5 && date.getDate() >= pentecost.getDate()) {
      return 'pentecost';
    } else {
      return 'ordinary_time';
    }
  }
  
  /**
   * Get the next Sunday after a given date
   */
  private getNextSunday(date: Date): Date {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysToAdd = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }
  
  /**
   * Get canonical hours (traditional prayer times) for a specific date and location
   * Returns the seven traditional hours: Lauds, Prime, Terce, Sext, None, Vespers, Compline
   */
  async getCanonicalHours(
    date: Date,
    location: Location
  ): Promise<PrayerTime[]> {
    try {
      const prayers: PrayerTime[] = [];
      
      // Calculate sunrise and sunset for the location
      const sunrise = this.calculateSunrise(date, location);
      const sunset = this.calculateSunset(date, location);
      
      // Calculate day length and divide into hours
      const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60); // in minutes
      const hourLength = dayLength / 12; // Divide day into 12 equal hours
      
      // Get liturgical season for seasonal adjustments
      const season = this.getLiturgicalSeason(date);
      
      // Lauds (Morning Prayer) - at dawn/sunrise
      prayers.push({
        name: 'Lauds',
        time: sunrise,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Prime (First Hour) - approximately 6 AM or 1 hour after sunrise
      const prime = new Date(sunrise);
      prime.setMinutes(prime.getMinutes() + hourLength);
      prayers.push({
        name: 'Prime',
        time: prime,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Terce (Third Hour) - approximately 9 AM or 3 hours after sunrise
      const terce = new Date(sunrise);
      terce.setMinutes(terce.getMinutes() + (hourLength * 3));
      prayers.push({
        name: 'Terce',
        time: terce,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Sext (Sixth Hour) - midday, 6 hours after sunrise
      const sext = new Date(sunrise);
      sext.setMinutes(sext.getMinutes() + (hourLength * 6));
      prayers.push({
        name: 'Sext',
        time: sext,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // None (Ninth Hour) - approximately 3 PM or 9 hours after sunrise
      const none = new Date(sunrise);
      none.setMinutes(none.getMinutes() + (hourLength * 9));
      prayers.push({
        name: 'None',
        time: none,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Vespers (Evening Prayer) - at sunset
      prayers.push({
        name: 'Vespers',
        time: sunset,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Compline (Night Prayer) - before bed, approximately 2 hours after sunset
      const compline = new Date(sunset);
      compline.setMinutes(compline.getMinutes() + 120); // 2 hours after sunset
      prayers.push({
        name: 'Compline',
        time: compline,
        tradition: 'christianity',
        calculationMethod: 'canonical-hours'
      });
      
      // Apply seasonal adjustments if needed
      return this.applySeasonalAdjustments(prayers, season);
    } catch (error) {
      console.error('Error calculating canonical hours:', error);
      throw new Error(`Failed to calculate canonical hours: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Apply seasonal adjustments to prayer times based on liturgical season
   */
  private applySeasonalAdjustments(
    prayers: PrayerTime[],
    season: LiturgicalSeason
  ): PrayerTime[] {
    // During Lent and Advent, some traditions observe stricter prayer schedules
    // For now, we return the prayers as-is, but this method allows for future customization
    
    // Example adjustments that could be implemented:
    // - During Lent: Earlier morning prayers, extended evening prayers
    // - During Easter: Additional celebratory prayers
    // - During Advent: Focus on preparation prayers
    
    return prayers;
  }
  
  /**
   * Calculate sunrise time for a given date and location
   * Uses SunCalc library for accurate solar calculations
   */
  private calculateSunrise(date: Date, location: Location): Date {
    const times = SunCalc.getTimes(date, location.latitude, location.longitude);
    return times.sunrise;
  }
  
  /**
   * Calculate sunset time for a given date and location
   * Uses SunCalc library for accurate solar calculations
   */
  private calculateSunset(date: Date, location: Location): Date {
    const times = SunCalc.getTimes(date, location.latitude, location.longitude);
    return times.sunset;
  }
}
