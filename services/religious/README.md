# Religious Calendar Services

This directory contains services for calculating religious observances, prayer times, and calendar events for multiple faith traditions.

## Services

### IslamicCalendarService

Provides Islamic prayer times and holiday calculations.

**Features:**
- Prayer time calculations (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Multiple calculation methods (Muslim World League, ISNA, etc.)
- Qibla direction calculation
- Hijri calendar conversion
- Islamic holiday detection
- Support for different madhabs (Hanafi, Shafi)

**Usage:**
```typescript
import { IslamicCalendarService } from './services/religious/IslamicCalendarService';

const service = new IslamicCalendarService();

// Get prayer times
const prayers = await service.getPrayerTimes(
  new Date(),
  { latitude: 40.7128, longitude: -74.0060 },
  { method: 'NorthAmerica', madhab: 'shafi' }
);

// Get Qibla direction
const qibla = await service.getQiblaDirection({ latitude: 40.7128, longitude: -74.0060 });

// Get Islamic holidays
const holidays = await service.getIslamicHolidays(startDate, endDate);
```

### JewishCalendarService

Provides Jewish calendar calculations, observances, and prayer times.

**Features:**
- Jewish observance and holiday calculations
- Sabbath times (candle lighting and Havdalah)
- Prayer times (Shacharit, Mincha, Maariv)
- Zmanim (halachic times) calculations
- Hebrew calendar conversion
- Holiday detection

**Usage:**
```typescript
import { JewishCalendarService } from './services/religious/JewishCalendarService';

const service = new JewishCalendarService();

// Get Jewish observances
const observances = await service.getJewishObservances(
  startDate,
  endDate,
  { latitude: 40.7128, longitude: -74.0060 }
);

// Get Sabbath times
const sabbathTimes = await service.getSabbathTimes(
  new Date(),
  { latitude: 40.7128, longitude: -74.0060 },
  { 
    method: 'standard',
    candleLightingMinutes: 18,
    havdalahMinutes: 50,
    useElevation: false
  }
);

// Get prayer times
const prayers = await service.getPrayerTimes(
  new Date(),
  { latitude: 40.7128, longitude: -74.0060 },
  config
);

// Calculate zmanim
const zmanim = service.calculateZmanim(
  new Date(),
  { latitude: 40.7128, longitude: -74.0060 }
);

// Convert dates
const hebrewDate = service.gregorianToHebrew(new Date());
const gregorianDate = service.hebrewToGregorian(hebrewDate);
```

## Testing

Each service has comprehensive unit tests. To run the tests:

```bash
# Islamic Calendar Service tests
npx tsx services/religious/__tests__/runTests.ts

# Jewish Calendar Service tests
npx tsx services/religious/__tests__/runJewishTests.ts
```

## Dependencies

- **adhan**: Islamic prayer time calculations
- **hebcal**: Hebrew calendar and Jewish observances

## Calculation Methods

### Islamic Prayer Times

The service supports multiple calculation methods:
- Muslim World League
- Egyptian General Authority of Survey
- University of Islamic Sciences, Karachi
- Umm al-Qura University, Makkah
- Dubai
- Moonsighting Committee
- ISNA (Islamic Society of North America)
- Kuwait
- Qatar
- Singapore
- Tehran
- Turkey

### Jewish Zmanim

The service calculates the following halachic times:
- **Alos Hashachar**: Dawn (72 minutes before sunrise)
- **Misheyakir**: Earliest time for tallit and tefillin
- **Sunrise (Netz)**: Sunrise
- **Sof Zman Shema**: Latest time for Shema
- **Sof Zman Tfilla**: Latest time for morning prayer
- **Chatzos**: Midday (solar noon)
- **Mincha Gedola**: Earliest time for Mincha
- **Mincha Ketana**: Preferred time for Mincha
- **Plag Hamincha**: 1.25 hours before sunset
- **Sunset (Shkiah)**: Sunset
- **Tzais**: Nightfall (when 3 stars are visible)

## Accuracy Notes

- Prayer times are calculated based on astronomical algorithms
- Actual prayer times may vary slightly based on local customs and moon sighting
- For critical religious observances, consult with local religious authorities
- Sunset/sunrise calculations use simplified algorithms; for production use, consider integrating with more accurate libraries like SunCalc

### ChristianCalendarService

Provides Christian liturgical calendar and canonical hours calculations.

**Features:**
- Easter date calculation (Western and Orthodox)
- Liturgical events (fixed and moveable feasts)
- Liturgical season detection (Advent, Christmas, Lent, Easter, Ordinary Time)
- Canonical hours (Lauds, Prime, Terce, Sext, None, Vespers, Compline)
- Seasonal adjustments for prayer times
- Support for multiple denominations (Catholic, Orthodox, Protestant)

**Usage:**
```typescript
import { ChristianCalendarService } from './services/religious/ChristianCalendarService';

const service = new ChristianCalendarService();

// Get liturgical events
const events = await service.getLiturgicalEvents(
  new Date(2025, 0, 1),
  new Date(2025, 11, 31),
  'catholic'
);

// Get canonical hours (traditional prayer times)
const prayers = await service.getCanonicalHours(
  new Date(),
  { latitude: 40.7128, longitude: -74.0060 }
);

// Get Easter date
const easter = await service.getEasterDate(2025, 'catholic');
const orthodoxEaster = await service.getEasterDate(2025, 'orthodox');

// Detect liturgical season
const season = service.getLiturgicalSeason(new Date());
```

## Testing

Each service has comprehensive unit tests. To run the tests:

```bash
# Islamic Calendar Service tests
npx tsx services/religious/__tests__/runTests.ts

# Islamic Holidays tests
npx tsx services/religious/__tests__/runHolidayTests.ts

# Jewish Calendar Service tests
npx tsx services/religious/__tests__/runJewishTests.ts

# Christian Calendar Service tests
npx tsx services/religious/__tests__/runChristianTests.ts
```

## Dependencies

- **adhan**: Islamic prayer time calculations
- **hebcal**: Hebrew calendar and Jewish observances
- **suncalc**: Solar position calculations for canonical hours

## Future Enhancements

- More accurate astronomical calculations
- Support for additional calculation methods
- Caching for improved performance
- Offline support with pre-calculated data
- Additional Christian denominations and traditions
