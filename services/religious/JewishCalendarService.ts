import {
  ReligiousEvent,
  Location,
  JewishCalculationConfig,
  HebrewDate,
  PrayerTime
} from '../../types';

/**
 * Service for Jewish calendar calculations including holidays, Sabbath times, and observances
 */
export class JewishCalendarService {
  /**
   * Get Jewish observances (holidays and special days) for a date range
   */
  async getJewishObservances(
    startDate: Date,
    endDate: Date,
    location?: Location
  ): Promise<ReligiousEvent[]> {
    try {
      const observances: ReligiousEvent[] = [];

      // Add major Jewish holidays for the date range
      const holidays = this.getMajorJewishHolidays(startDate.getFullYear());

      for (const holiday of holidays) {
        if (holiday.date >= startDate && holiday.date <= endDate) {
          observances.push(holiday);
        }
      }

      // Add weekly Shabbat observances
      const shabbatDates = this.getShabbatDates(startDate, endDate);
      for (const shabbatDate of shabbatDates) {
        observances.push({
          id: `jewish-shabbat-${shabbatDate.toISOString().split('T')[0]}`,
          name: 'Shabbat',
          tradition: 'judaism',
          date: shabbatDate,
          localTime: shabbatDate,
          description: 'The Jewish Sabbath, a day of rest.',
          significance: 'The seventh day of the week, a day of rest and spiritual enrichment.',
          astronomicalBasis: 'From Friday evening to Saturday evening, based on sunset',
          observanceType: 'sabbath'
        });
      }

      // Sort by date
      observances.sort((a, b) => a.date.getTime() - b.date.getTime());

      return observances;
    } catch (error) {
      console.error('Error calculating Jewish observances:', error);
      throw new Error(`Failed to calculate Jewish observances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Sabbath times (candle lighting and Havdalah) for a specific date
   */
  async getSabbathTimes(
    date: Date,
    location: Location,
    config: JewishCalculationConfig
  ): Promise<{ candleLighting: Date; havdalah: Date }> {
    try {
      // Get the Friday of the week containing this date
      const dayOfWeek = date.getDay();
      let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      if (daysUntilFriday === 0 && dayOfWeek !== 5) {
        daysUntilFriday = 7; // If not Friday, get next Friday
      }

      // Calculate Friday's date
      const fridayDate = new Date(date);
      fridayDate.setDate(fridayDate.getDate() + daysUntilFriday);

      // Calculate sunset time for Friday (candle lighting)
      const candleLightingTime = this.calculateSunset(fridayDate, location);
      candleLightingTime.setMinutes(candleLightingTime.getMinutes() - config.candleLightingMinutes);

      // Calculate Saturday's date
      const saturdayDate = new Date(fridayDate);
      saturdayDate.setDate(saturdayDate.getDate() + 1);

      // Calculate sunset time for Saturday (havdalah)
      const havdalahTime = this.calculateSunset(saturdayDate, location);
      havdalahTime.setMinutes(havdalahTime.getMinutes() + config.havdalahMinutes);

      return {
        candleLighting: candleLightingTime,
        havdalah: havdalahTime
      };
    } catch (error) {
      console.error('Error calculating Sabbath times:', error);
      throw new Error(`Failed to calculate Sabbath times: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Jewish prayer times (Shacharit, Mincha, Maariv) for a specific date
   */
  async getPrayerTimes(
    date: Date,
    location: Location,
    config: JewishCalculationConfig
  ): Promise<PrayerTime[]> {
    try {
      const prayers: PrayerTime[] = [];

      // Calculate zmanim (halachic times)
      const zmanim = this.calculateZmanim(date, location);

      // Shacharit (morning prayer) - can be said from dawn until midday
      // Typically starts after sunrise
      prayers.push({
        name: 'Shacharit',
        time: zmanim.sunrise,
        tradition: 'judaism',
        calculationMethod: config.method
      });

      // Mincha (afternoon prayer) - can be said from half hour after midday until sunset
      // Mincha Gedola (earliest time) is 30 minutes after solar noon
      const minchaTime = new Date(zmanim.solarNoon);
      minchaTime.setMinutes(minchaTime.getMinutes() + 30);

      prayers.push({
        name: 'Mincha',
        time: minchaTime,
        tradition: 'judaism',
        calculationMethod: config.method
      });

      // Maariv (evening prayer) - can be said after nightfall
      // Nightfall is typically 42-72 minutes after sunset (depending on custom)
      const maarivTime = new Date(zmanim.sunset);
      maarivTime.setMinutes(maarivTime.getMinutes() + 50); // Using 50 minutes as default

      prayers.push({
        name: 'Maariv',
        time: maarivTime,
        tradition: 'judaism',
        calculationMethod: config.method
      });

      return prayers;
    } catch (error) {
      console.error('Error calculating Jewish prayer times:', error);
      throw new Error(`Failed to calculate Jewish prayer times: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate zmanim (halachic times) for a specific date and location
   * Returns key times used in Jewish law
   */
  calculateZmanim(date: Date, location: Location): {
    alos: Date;           // Dawn (72 minutes before sunrise)
    misheyakir: Date;     // Earliest time for tallit and tefillin
    sunrise: Date;        // Sunrise (netz)
    sofZmanShma: Date;    // Latest time for Shema (Magen Avraham)
    sofZmanTfilla: Date;  // Latest time for morning prayer
    chatzos: Date;        // Midday (solar noon)
    solarNoon: Date;      // Solar noon
    minchaGedola: Date;   // Earliest time for Mincha
    minchaKetana: Date;   // Preferred time for Mincha
    plagHamincha: Date;   // 1.25 hours before sunset
    sunset: Date;         // Sunset (shkiah)
    tzais: Date;          // Nightfall (when 3 stars are visible)
    tzais72: Date;        // Nightfall (72 minutes after sunset)
  } {
    const sunrise = this.calculateSunrise(date, location);
    const sunset = this.calculateSunset(date, location);
    const solarNoon = this.calculateSolarNoon(date, location);

    // Calculate day length
    const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60); // in minutes
    const shaahZmanis = dayLength / 12; // Proportional hour

    // Alos Hashachar (dawn) - 72 minutes before sunrise
    const alos = new Date(sunrise);
    alos.setMinutes(alos.getMinutes() - 72);

    // Misheyakir - 60 minutes before sunrise
    const misheyakir = new Date(sunrise);
    misheyakir.setMinutes(misheyakir.getMinutes() - 60);

    // Sof Zman Shema (Magen Avraham) - 3 proportional hours after sunrise
    const sofZmanShma = new Date(sunrise);
    sofZmanShma.setMinutes(sofZmanShma.getMinutes() + (shaahZmanis * 3));

    // Sof Zman Tfilla - 4 proportional hours after sunrise
    const sofZmanTfilla = new Date(sunrise);
    sofZmanTfilla.setMinutes(sofZmanTfilla.getMinutes() + (shaahZmanis * 4));

    // Chatzos (midday) - same as solar noon
    const chatzos = new Date(solarNoon);

    // Mincha Gedola - 30 minutes after solar noon
    const minchaGedola = new Date(solarNoon);
    minchaGedola.setMinutes(minchaGedola.getMinutes() + 30);

    // Mincha Ketana - 2.5 proportional hours before sunset
    const minchaKetana = new Date(sunset);
    minchaKetana.setMinutes(minchaKetana.getMinutes() - (shaahZmanis * 2.5));

    // Plag Hamincha - 1.25 proportional hours before sunset
    const plagHamincha = new Date(sunset);
    plagHamincha.setMinutes(plagHamincha.getMinutes() - (shaahZmanis * 1.25));

    // Tzais (nightfall) - when 3 stars are visible, approximately 42 minutes after sunset
    const tzais = new Date(sunset);
    tzais.setMinutes(tzais.getMinutes() + 42);

    // Tzais 72 - 72 minutes after sunset (stringent opinion)
    const tzais72 = new Date(sunset);
    tzais72.setMinutes(tzais72.getMinutes() + 72);

    return {
      alos,
      misheyakir,
      sunrise,
      sofZmanShma,
      sofZmanTfilla,
      chatzos,
      solarNoon,
      minchaGedola,
      minchaKetana,
      plagHamincha,
      sunset,
      tzais,
      tzais72
    };
  }

  /**
   * Calculate sunrise time for a given date and location
   */
  private calculateSunrise(date: Date, location: Location): Date {
    const lat = location.latitude * Math.PI / 180;
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

    // Solar declination
    const declination = 0.4095 * Math.sin(0.016906 * (dayOfYear - 80.086));

    // Hour angle at sunrise
    const hourAngle = Math.acos(-Math.tan(lat) * Math.tan(declination));

    // Sunrise time in hours from solar noon
    const sunriseHour = 12 - (hourAngle * 12 / Math.PI);

    // Adjust for longitude (4 minutes per degree)
    const longitudeAdjustment = location.longitude / 15;
    const localSunriseHour = sunriseHour - longitudeAdjustment;

    // Create sunrise time
    const sunriseTime = new Date(date);
    sunriseTime.setHours(Math.floor(localSunriseHour));
    sunriseTime.setMinutes(Math.round((localSunriseHour % 1) * 60));
    sunriseTime.setSeconds(0);
    sunriseTime.setMilliseconds(0);

    return sunriseTime;
  }

  /**
   * Calculate solar noon for a given date and location
   */
  private calculateSolarNoon(date: Date, location: Location): Date {
    // Solar noon occurs when the sun is at its highest point
    // Approximately 12:00 adjusted for longitude
    const longitudeAdjustment = location.longitude / 15;
    const solarNoonHour = 12 - longitudeAdjustment;

    const solarNoon = new Date(date);
    solarNoon.setHours(Math.floor(solarNoonHour));
    solarNoon.setMinutes(Math.round((solarNoonHour % 1) * 60));
    solarNoon.setSeconds(0);
    solarNoon.setMilliseconds(0);

    return solarNoon;
  }

  /**
   * Calculate sunset time for a given date and location
   * Uses a simplified algorithm
   */
  private calculateSunset(date: Date, location: Location): Date {
    // This is a simplified sunset calculation
    // For production, you'd want to use a more accurate library like suncalc
    const lat = location.latitude * Math.PI / 180;
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

    // Solar declination
    const declination = 0.4095 * Math.sin(0.016906 * (dayOfYear - 80.086));

    // Hour angle at sunset
    const hourAngle = Math.acos(-Math.tan(lat) * Math.tan(declination));

    // Sunset time in hours from solar noon
    const sunsetHour = 12 + (hourAngle * 12 / Math.PI);

    // Adjust for longitude (4 minutes per degree)
    const longitudeAdjustment = location.longitude / 15;
    const localSunsetHour = sunsetHour - longitudeAdjustment;

    // Create sunset time
    const sunsetTime = new Date(date);
    sunsetTime.setHours(Math.floor(localSunsetHour));
    sunsetTime.setMinutes(Math.round((localSunsetHour % 1) * 60));
    sunsetTime.setSeconds(0);
    sunsetTime.setMilliseconds(0);

    return sunsetTime;
  }

  /**
   * Convert a Gregorian date to Hebrew date (simplified approximation)
   */
  gregorianToHebrew(date: Date): HebrewDate {
    try {
      // This is a simplified approximation
      // For accurate conversion, a proper Hebrew calendar library would be needed
      const gregorianYear = date.getFullYear();
      const hebrewYear = gregorianYear + 3760; // Approximate conversion

      return {
        year: hebrewYear,
        month: 1, // Simplified - would need proper lunar month calculation
        day: date.getDate(),
        monthName: 'Tishrei' // Simplified - would need proper month name
      };
    } catch (error) {
      console.error('Error converting to Hebrew date:', error);
      throw new Error(`Failed to convert to Hebrew date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert a Hebrew date to Gregorian date (simplified approximation)
   */
  hebrewToGregorian(hebrewDate: HebrewDate): Date {
    try {
      // This is a simplified approximation
      const gregorianYear = hebrewDate.year - 3760;
      return new Date(gregorianYear, 0, hebrewDate.day);
    } catch (error) {
      console.error('Error converting Hebrew date to Gregorian:', error);
      throw new Error(`Failed to convert Hebrew date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current Hebrew date
   */
  getCurrentHebrewDate(): HebrewDate {
    return this.gregorianToHebrew(new Date());
  }

  /**
   * Check if a given date is Shabbat (Saturday)
   */
  isShabbat(date: Date): boolean {
    return date.getDay() === 6; // Saturday
  }

  /**
   * Check if a given date is a Jewish holiday
   */
  async isHoliday(date: Date): Promise<boolean> {
    const holidays = this.getMajorJewishHolidays(date.getFullYear());
    return holidays.some(holiday =>
      holiday.date.toDateString() === date.toDateString()
    );
  }

  /**
   * Get major Jewish holidays for a given year
   */
  private getMajorJewishHolidays(year: number): ReligiousEvent[] {
    const holidays: ReligiousEvent[] = [];

    // These are approximate dates - in reality, Jewish holidays follow the lunar calendar
    // and their Gregorian dates vary each year
    const holidayDates = [
      { name: 'Rosh Hashana', month: 8, day: 15, type: 'feast' as const },
      { name: 'Yom Kippur', month: 8, day: 24, type: 'fast' as const },
      { name: 'Sukkot', month: 8, day: 29, type: 'feast' as const },
      { name: 'Chanukah', month: 11, day: 10, type: 'feast' as const },
      { name: 'Purim', month: 2, day: 14, type: 'feast' as const },
      { name: 'Pesach (Passover)', month: 3, day: 15, type: 'feast' as const },
      { name: 'Shavuot', month: 5, day: 6, type: 'feast' as const }
    ];

    for (const holiday of holidayDates) {
      const date = new Date(year, holiday.month, holiday.day);
      const { description, significance, astronomicalBasis } = this.getEventDetails(holiday.name);

      holidays.push({
        id: `jewish-${holiday.name.toLowerCase().replace(/\s+/g, '-')}-${year}`,
        name: holiday.name,
        tradition: 'judaism',
        date,
        localTime: date,
        description,
        significance,
        astronomicalBasis,
        observanceType: holiday.type
      });
    }

    return holidays;
  }

  /**
   * Get all Shabbat dates within a date range
   */
  private getShabbatDates(startDate: Date, endDate: Date): Date[] {
    const shabbatDates: Date[] = [];
    const current = new Date(startDate);

    // Find the first Saturday in the range
    while (current.getDay() !== 6 && current <= endDate) {
      current.setDate(current.getDate() + 1);
    }

    // Add all Saturdays in the range
    while (current <= endDate) {
      shabbatDates.push(new Date(current));
      current.setDate(current.getDate() + 7); // Next Saturday
    }

    return shabbatDates;
  }

  /**
   * Get detailed information about a Jewish observance
   */
  private getEventDetails(
    eventName: string
  ): { description: string; significance: string; astronomicalBasis: string } {
    // Major holidays and their details
    const eventDetails: { [key: string]: { description: string; significance: string; astronomicalBasis: string } } = {
      'Rosh Hashana': {
        description: 'The Jewish New Year, a time of reflection and renewal.',
        significance: 'Marks the beginning of the High Holy Days and the start of the Hebrew calendar year. A time for introspection, prayer, and hearing the shofar.',
        astronomicalBasis: 'Begins on the first day of Tishrei, the seventh month of the Hebrew lunar calendar'
      },
      'Yom Kippur': {
        description: 'The Day of Atonement, the holiest day in the Jewish calendar.',
        significance: 'A day of fasting, prayer, and repentance. Jews seek forgiveness for sins and reconciliation with God.',
        astronomicalBasis: 'Occurs on the tenth day of Tishrei, ten days after Rosh Hashana'
      },
      'Sukkot': {
        description: 'The Feast of Tabernacles, commemorating the Israelites\' journey through the desert.',
        significance: 'Jews build and dwell in temporary structures (sukkot) and celebrate the fall harvest.',
        astronomicalBasis: 'Begins on the fifteenth day of Tishrei, during the full moon'
      },
      'Chanukah': {
        description: 'The Festival of Lights, commemorating the rededication of the Second Temple.',
        significance: 'Celebrates the miracle of the oil that burned for eight days. Families light the menorah and celebrate religious freedom.',
        astronomicalBasis: 'Begins on the twenty-fifth day of Kislev, near the winter solstice'
      },
      'Purim': {
        description: 'Celebrates the salvation of the Jewish people from Haman\'s plot in ancient Persia.',
        significance: 'A joyous holiday marked by reading the Megillah (Book of Esther), giving to charity, and festive meals.',
        astronomicalBasis: 'Occurs on the fourteenth day of Adar, one month before Passover'
      },
      'Pesach': {
        description: 'Passover, commemorating the Exodus from Egypt.',
        significance: 'Celebrates freedom from slavery. Families hold Seders and eat matzah to remember the hasty departure from Egypt.',
        astronomicalBasis: 'Begins on the fifteenth day of Nisan, during the full moon of spring'
      },
      'Shavuot': {
        description: 'The Feast of Weeks, celebrating the giving of the Torah at Mount Sinai.',
        significance: 'Commemorates the revelation of the Torah and the spring harvest. Traditional to study Torah all night.',
        astronomicalBasis: 'Occurs fifty days after Passover, seven weeks after the second night of Passover'
      },
      'Tish\'a B\'Av': {
        description: 'A day of mourning for the destruction of the First and Second Temples.',
        significance: 'The saddest day in the Jewish calendar, marked by fasting and reading the Book of Lamentations.',
        astronomicalBasis: 'Occurs on the ninth day of Av, during the summer'
      }
    };

    // Check for partial matches in event name
    for (const [key, details] of Object.entries(eventDetails)) {
      if (eventName.includes(key)) {
        return details;
      }
    }

    // Default details based on event name patterns
    const eventLower = eventName.toLowerCase();

    if (eventLower.includes('shabbat mevarchim')) {
      return {
        description: 'Shabbat when the new month is blessed.',
        significance: 'A special Sabbath when the upcoming new month is announced and blessed in the synagogue.',
        astronomicalBasis: 'Occurs on the Sabbath before the new moon (Rosh Chodesh)'
      };
    }

    if (eventLower.includes('rosh chodesh')) {
      return {
        description: 'The beginning of a new Hebrew month.',
        significance: 'Marks the start of a new lunar month in the Hebrew calendar. Traditionally a minor holiday.',
        astronomicalBasis: 'Begins with the sighting of the new moon'
      };
    }

    if (eventLower.includes('fast')) {
      return {
        description: 'A fast day in the Jewish calendar.',
        significance: 'A day of fasting and reflection, commemorating historical events.',
        astronomicalBasis: 'Based on the Hebrew lunar calendar'
      };
    }

    if (eventLower.includes('shabbat')) {
      return {
        description: 'The Jewish Sabbath, a day of rest.',
        significance: 'The seventh day of the week, a day of rest and spiritual enrichment.',
        astronomicalBasis: 'From Friday evening to Saturday evening, based on sunset'
      };
    }

    // Generic details
    return {
      description: `${eventName} - A Jewish observance.`,
      significance: 'An important day in the Jewish calendar.',
      astronomicalBasis: 'Based on the Hebrew lunar calendar'
    };
  }
}
