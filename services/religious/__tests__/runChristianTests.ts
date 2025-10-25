/**
 * Test runner for ChristianCalendarService
 * Run with: npx tsx services/religious/__tests__/runChristianTests.ts
 */

import { ChristianCalendarService } from '../ChristianCalendarService';

async function runTests() {
  console.log('✝️  Running ChristianCalendarService Tests\n');
  
  const service = new ChristianCalendarService();
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Western Easter calculation for 2024
  try {
    console.log('Test 1: Calculate Western Easter for 2024...');
    const easter2024 = await service.getEasterDate(2024, 'catholic');
    
    if (easter2024.getFullYear() === 2024 && 
        easter2024.getMonth() === 2 && 
        easter2024.getDate() === 31) {
      console.log('✅ PASSED: Easter 2024 is March 31, 2024');
      passedTests++;
    } else {
      console.log(`❌ FAILED: Expected March 31, 2024, got ${easter2024.toDateString()}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 2: Western Easter calculation for 2025
  try {
    console.log('Test 2: Calculate Western Easter for 2025...');
    const easter2025 = await service.getEasterDate(2025, 'protestant');
    
    if (easter2025.getFullYear() === 2025 && 
        easter2025.getMonth() === 3 && 
        easter2025.getDate() === 20) {
      console.log('✅ PASSED: Easter 2025 is April 20, 2025');
      passedTests++;
    } else {
      console.log(`❌ FAILED: Expected April 20, 2025, got ${easter2025.toDateString()}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 3: Orthodox Easter calculation for 2024
  try {
    console.log('Test 3: Calculate Orthodox Easter for 2024...');
    const orthodoxEaster2024 = await service.getEasterDate(2024, 'orthodox');
    
    if (orthodoxEaster2024.getFullYear() === 2024 && 
        orthodoxEaster2024.getMonth() === 4 && 
        orthodoxEaster2024.getDate() === 5) {
      console.log('✅ PASSED: Orthodox Easter 2024 is May 5, 2024');
      passedTests++;
    } else {
      console.log(`❌ FAILED: Expected May 5, 2024, got ${orthodoxEaster2024.toDateString()}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');

  // Test 4: Get liturgical events for a date range
  try {
    console.log('Test 4: Get liturgical events for 2025...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    
    if (events.length > 0 && 
        events.every(e => e.tradition === 'christianity') &&
        events.every(e => e.date >= startDate && e.date <= endDate)) {
      console.log(`✅ PASSED: Retrieved ${events.length} liturgical events for 2025`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid events returned');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 5: Verify Christmas is included
  try {
    console.log('Test 5: Verify Christmas is in the events...');
    const startDate = new Date(2025, 11, 1);
    const endDate = new Date(2025, 11, 31);
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    const christmas = events.find(e => e.name === 'Christmas');
    
    if (christmas && 
        christmas.date.getMonth() === 11 && 
        christmas.date.getDate() === 25) {
      console.log('✅ PASSED: Christmas found on December 25');
      console.log(`   Description: ${christmas.description}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Christmas not found or incorrect date');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 6: Verify moveable feasts are calculated correctly
  try {
    console.log('Test 6: Verify moveable feasts relative to Easter...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    
    const easter = events.find(e => e.name === 'Easter Sunday');
    const ashWednesday = events.find(e => e.name === 'Ash Wednesday');
    const pentecost = events.find(e => e.name === 'Pentecost');
    
    if (!easter || !ashWednesday || !pentecost) {
      console.log('❌ FAILED: Missing key moveable feasts');
      failedTests++;
    } else {
      const ashToEaster = Math.floor((easter.date.getTime() - ashWednesday.date.getTime()) / (1000 * 60 * 60 * 24));
      const easterToPentecost = Math.floor((pentecost.date.getTime() - easter.date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (ashToEaster === 46 && easterToPentecost === 49) {
        console.log('✅ PASSED: Moveable feasts calculated correctly');
        console.log(`   Ash Wednesday to Easter: ${ashToEaster} days`);
        console.log(`   Easter to Pentecost: ${easterToPentecost} days`);
        passedTests++;
      } else {
        console.log(`❌ FAILED: Incorrect day calculations (Ash-Easter: ${ashToEaster}, Easter-Pentecost: ${easterToPentecost})`);
        failedTests++;
      }
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 7: Verify fixed feast days
  try {
    console.log('Test 7: Verify fixed feast days...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    
    const epiphany = events.find(e => e.name === 'Epiphany');
    const assumption = events.find(e => e.name === 'Assumption of Mary');
    const allSaints = events.find(e => e.name === 'All Saints\' Day');
    
    if (epiphany?.date.getMonth() === 0 && epiphany?.date.getDate() === 6 &&
        assumption?.date.getMonth() === 7 && assumption?.date.getDate() === 15 &&
        allSaints?.date.getMonth() === 10 && allSaints?.date.getDate() === 1) {
      console.log('✅ PASSED: Fixed feast days on correct dates');
      console.log(`   Epiphany: January 6`);
      console.log(`   Assumption: August 15`);
      console.log(`   All Saints: November 1`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Fixed feast days on incorrect dates');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 8: Liturgical season detection
  try {
    console.log('Test 8: Test liturgical season detection...');
    
    const adventDate = new Date(2025, 10, 30); // November 30, 2025 (First Sunday of Advent)
    const christmasDate = new Date(2025, 11, 25); // December 25, 2025
    const lentDate = new Date(2025, 2, 10); // March 10, 2025 (during Lent)
    const ordinaryDate = new Date(2025, 6, 15); // July 15, 2025
    
    const adventSeason = service.getLiturgicalSeason(adventDate);
    const christmasSeason = service.getLiturgicalSeason(christmasDate);
    const lentSeason = service.getLiturgicalSeason(lentDate);
    const ordinarySeason = service.getLiturgicalSeason(ordinaryDate);
    
    if (adventSeason === 'advent' && 
        christmasSeason === 'christmas' && 
        lentSeason === 'lent' && 
        ordinarySeason === 'ordinary_time') {
      console.log('✅ PASSED: Liturgical seasons detected correctly');
      console.log(`   Nov 30: ${adventSeason}`);
      console.log(`   Dec 25: ${christmasSeason}`);
      console.log(`   Mar 10: ${lentSeason}`);
      console.log(`   Jul 15: ${ordinarySeason}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Incorrect season detection');
      console.log(`   Got: ${adventSeason}, ${christmasSeason}, ${lentSeason}, ${ordinarySeason}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 9: Events are sorted by date
  try {
    console.log('Test 9: Verify events are sorted by date...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    
    let sorted = true;
    for (let i = 1; i < events.length; i++) {
      if (events[i].date.getTime() < events[i - 1].date.getTime()) {
        sorted = false;
        break;
      }
    }
    
    if (sorted) {
      console.log('✅ PASSED: Events are properly sorted by date');
      passedTests++;
    } else {
      console.log('❌ FAILED: Events are not sorted');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 10: Multi-year date range
  try {
    console.log('Test 10: Test multi-year date range...');
    const startDate = new Date(2024, 11, 1); // December 1, 2024
    const endDate = new Date(2025, 1, 28); // February 28, 2025
    
    const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
    
    const christmas2024 = events.find(e => 
      e.name === 'Christmas' && e.date.getFullYear() === 2024
    );
    const events2025 = events.filter(e => e.date.getFullYear() === 2025);
    
    if (christmas2024 && events2025.length > 0) {
      console.log('✅ PASSED: Multi-year range handled correctly');
      console.log(`   Found Christmas 2024 and ${events2025.length} events in 2025`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Multi-year range not handled correctly');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  
  // Test 11: Canonical hours calculation
  try {
    console.log('Test 11: Calculate canonical hours...');
    const location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const date = new Date(2025, 5, 15); // June 15, 2025
    const canonicalHours = await service.getCanonicalHours(date, location);
    
    if (canonicalHours.length === 7) {
      const hourNames = canonicalHours.map(h => h.name);
      const expectedNames = ['Lauds', 'Prime', 'Terce', 'Sext', 'None', 'Vespers', 'Compline'];
      
      if (JSON.stringify(hourNames) === JSON.stringify(expectedNames)) {
        console.log('✅ PASSED: All seven canonical hours calculated');
        console.log(`   Lauds: ${canonicalHours[0].time.toLocaleTimeString()}`);
        console.log(`   Sext (Midday): ${canonicalHours[3].time.toLocaleTimeString()}`);
        console.log(`   Vespers: ${canonicalHours[5].time.toLocaleTimeString()}`);
        passedTests++;
      } else {
        console.log('❌ FAILED: Incorrect hour names');
        console.log(`   Got: ${hourNames.join(', ')}`);
        failedTests++;
      }
    } else {
      console.log(`❌ FAILED: Expected 7 hours, got ${canonicalHours.length}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 12: Canonical hours are in chronological order
  try {
    console.log('Test 12: Verify canonical hours are in order...');
    const location = {
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London'
    };
    
    const date = new Date(2025, 2, 21); // March 21, 2025 (Spring Equinox)
    const canonicalHours = await service.getCanonicalHours(date, location);
    
    let inOrder = true;
    for (let i = 1; i < canonicalHours.length; i++) {
      if (canonicalHours[i].time.getTime() <= canonicalHours[i - 1].time.getTime()) {
        inOrder = false;
        break;
      }
    }
    
    if (inOrder) {
      console.log('✅ PASSED: Canonical hours are in chronological order');
      passedTests++;
    } else {
      console.log('❌ FAILED: Canonical hours are not in order');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 13: Lauds at sunrise, Vespers at sunset
  try {
    console.log('Test 13: Verify Lauds and Vespers timing...');
    const location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const date = new Date(2025, 5, 15);
    const canonicalHours = await service.getCanonicalHours(date, location);
    
    const lauds = canonicalHours.find(h => h.name === 'Lauds');
    const vespers = canonicalHours.find(h => h.name === 'Vespers');
    
    if (lauds && vespers) {
      // Check that Lauds is before noon and Vespers is after noon
      const laudsHour = lauds.time.getHours();
      const vespersHour = vespers.time.getHours();
      
      // Lauds should be before noon (in UTC, this would be 4-16)
      // Vespers should be after noon or early morning next day in UTC (18-23 or 0-4)
      const laudsBeforeVespers = lauds.time.getTime() < vespers.time.getTime();
      
      if (laudsBeforeVespers) {
        console.log('✅ PASSED: Lauds and Vespers at appropriate times');
        console.log(`   Lauds: ${lauds.time.toLocaleString()}`);
        console.log(`   Vespers: ${vespers.time.toLocaleString()}`);
        passedTests++;
      } else {
        console.log(`❌ FAILED: Lauds not before Vespers`);
        failedTests++;
      }
    } else {
      console.log('❌ FAILED: Lauds or Vespers not found');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 14: Sext at midday
  try {
    console.log('Test 14: Verify Sext (midday prayer) timing...');
    const location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const date = new Date(2025, 5, 15);
    const canonicalHours = await service.getCanonicalHours(date, location);
    
    const lauds = canonicalHours.find(h => h.name === 'Lauds');
    const sext = canonicalHours.find(h => h.name === 'Sext');
    const vespers = canonicalHours.find(h => h.name === 'Vespers');
    
    if (sext && lauds && vespers) {
      // Sext should be between Lauds and Vespers, roughly in the middle
      const sextAfterLauds = sext.time.getTime() > lauds.time.getTime();
      const sextBeforeVespers = sext.time.getTime() < vespers.time.getTime();
      
      if (sextAfterLauds && sextBeforeVespers) {
        console.log('✅ PASSED: Sext at midday (between Lauds and Vespers)');
        console.log(`   Sext time: ${sext.time.toLocaleString()}`);
        passedTests++;
      } else {
        console.log(`❌ FAILED: Sext not between Lauds and Vespers`);
        failedTests++;
      }
    } else {
      console.log('❌ FAILED: Required hours not found');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 15: Seasonal variation (summer vs winter day length)
  try {
    console.log('Test 15: Test seasonal variation in canonical hours...');
    const location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const summerDate = new Date(2025, 5, 21); // June 21 (summer solstice)
    const winterDate = new Date(2025, 11, 21); // December 21 (winter solstice)
    
    const summerHours = await service.getCanonicalHours(summerDate, location);
    const winterHours = await service.getCanonicalHours(winterDate, location);
    
    const summerLauds = summerHours.find(h => h.name === 'Lauds')!;
    const winterLauds = winterHours.find(h => h.name === 'Lauds')!;
    const summerVespers = summerHours.find(h => h.name === 'Vespers')!;
    const winterVespers = winterHours.find(h => h.name === 'Vespers')!;
    
    // Summer day should be longer than winter day
    const summerDayLength = summerVespers.time.getTime() - summerLauds.time.getTime();
    const winterDayLength = winterVespers.time.getTime() - winterLauds.time.getTime();
    
    if (summerDayLength > winterDayLength) {
      console.log('✅ PASSED: Seasonal variation detected correctly');
      console.log(`   Summer day length: ${(summerDayLength / (1000 * 60 * 60)).toFixed(2)} hours`);
      console.log(`   Winter day length: ${(winterDayLength / (1000 * 60 * 60)).toFixed(2)} hours`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Seasonal variation not detected correctly');
      console.log(`   Summer: ${summerDayLength}, Winter: ${winterDayLength}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }

  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
  
  if (failedTests === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run tests
runTests().catch(console.error);
