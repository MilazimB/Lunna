/**
 * Simple test runner for JewishCalendarService
 * This can be run directly with ts-node or used as a manual verification script
 */

import { JewishCalendarService } from '../JewishCalendarService';
import { Location, JewishCalculationConfig } from '../../../types';

async function runTests() {
  console.log('✡️  Running JewishCalendarService Tests\n');
  
  const service = new JewishCalendarService();
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Get Jewish observances for a date range
  try {
    console.log('Test 1: Get Jewish observances for September 2024...');
    const startDate = new Date('2024-09-01');
    const endDate = new Date('2024-09-30');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const observances = await service.getJewishObservances(startDate, endDate, location);
    
    if (observances.length > 0 && 
        observances.every(obs => obs.tradition === 'judaism')) {
      console.log(`✅ PASSED: Found ${observances.length} Jewish observances`);
      console.log(`   Sample: ${observances[0].name}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: No observances found or incorrect format');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 2: Find Rosh Hashana
  try {
    console.log('Test 2: Find Rosh Hashana in October 2024...');
    const startDate = new Date('2024-10-01');
    const endDate = new Date('2024-10-31');
    
    const observances = await service.getJewishObservances(startDate, endDate);
    const roshHashana = observances.find(obs => obs.name.includes('Rosh Hashana'));
    
    if (roshHashana) {
      console.log('✅ PASSED: Rosh Hashana found');
      console.log(`   Date: ${roshHashana.date.toLocaleDateString()}`);
      console.log(`   Type: ${roshHashana.observanceType}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Rosh Hashana not found');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 3: Calculate Sabbath times
  try {
    console.log('Test 3: Calculate Sabbath times for New York...');
    const testDate = new Date('2024-09-20'); // A Friday
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const config: JewishCalculationConfig = {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 50,
      useElevation: false
    };
    
    const sabbathTimes = await service.getSabbathTimes(testDate, location, config);
    
    if (sabbathTimes.candleLighting && 
        sabbathTimes.havdalah &&
        sabbathTimes.havdalah.getTime() > sabbathTimes.candleLighting.getTime()) {
      console.log('✅ PASSED: Sabbath times calculated correctly');
      console.log(`   Candle lighting: ${sabbathTimes.candleLighting.toLocaleString()}`);
      console.log(`   Havdalah: ${sabbathTimes.havdalah.toLocaleString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid Sabbath times');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 4: Gregorian to Hebrew date conversion
  try {
    console.log('Test 4: Convert Gregorian to Hebrew date...');
    const gregorianDate = new Date('2024-10-03'); // Rosh Hashana 5785
    
    const hebrewDate = service.gregorianToHebrew(gregorianDate);
    
    if (hebrewDate.year === 5785 && 
        hebrewDate.monthName === 'Tishrei' &&
        hebrewDate.day === 1) {
      console.log('✅ PASSED: Date conversion correct');
      console.log(`   Hebrew date: ${hebrewDate.day} ${hebrewDate.monthName} ${hebrewDate.year}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Incorrect Hebrew date');
      console.log(`   Got: ${hebrewDate.day} ${hebrewDate.monthName} ${hebrewDate.year}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 5: Hebrew to Gregorian date conversion
  try {
    console.log('Test 5: Convert Hebrew to Gregorian date...');
    const hebrewDate = {
      year: 5785,
      month: 7, // Tishrei
      day: 1,
      monthName: 'Tishrei'
    };
    
    const gregorianDate = service.hebrewToGregorian(hebrewDate);
    
    if (gregorianDate.getFullYear() === 2024 &&
        gregorianDate.getMonth() === 9 && // October (0-indexed)
        gregorianDate.getDate() === 3) {
      console.log('✅ PASSED: Hebrew to Gregorian conversion correct');
      console.log(`   Gregorian date: ${gregorianDate.toLocaleDateString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Incorrect Gregorian date');
      console.log(`   Got: ${gregorianDate.toLocaleDateString()}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 6: Round-trip date conversion
  try {
    console.log('Test 6: Round-trip date conversion...');
    const originalDate = new Date('2024-09-15');
    
    const hebrewDate = service.gregorianToHebrew(originalDate);
    const convertedBack = service.hebrewToGregorian(hebrewDate);
    
    if (convertedBack.getFullYear() === originalDate.getFullYear() &&
        convertedBack.getMonth() === originalDate.getMonth() &&
        convertedBack.getDate() === originalDate.getDate()) {
      console.log('✅ PASSED: Round-trip conversion successful');
      console.log(`   Original: ${originalDate.toLocaleDateString()}`);
      console.log(`   Hebrew: ${hebrewDate.day} ${hebrewDate.monthName} ${hebrewDate.year}`);
      console.log(`   Back: ${convertedBack.toLocaleDateString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Round-trip conversion failed');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 7: Check if date is Shabbat
  try {
    console.log('Test 7: Check if date is Shabbat...');
    const saturday = new Date('2024-09-21'); // A Saturday
    const monday = new Date('2024-09-23'); // A Monday
    
    const isSaturdayShabbat = service.isShabbat(saturday);
    const isMondayShabbat = service.isShabbat(monday);
    
    if (isSaturdayShabbat === true && isMondayShabbat === false) {
      console.log('✅ PASSED: Shabbat detection correct');
      console.log(`   Saturday is Shabbat: ${isSaturdayShabbat}`);
      console.log(`   Monday is Shabbat: ${isMondayShabbat}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Shabbat detection incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 8: Check if date is a holiday
  try {
    console.log('Test 8: Check if date is a holiday...');
    const roshHashana = new Date('2024-10-03'); // Rosh Hashana 5785
    const regularDay = new Date('2024-09-15'); // Not a holiday
    
    const isRoshHashanaHoliday = await service.isHoliday(roshHashana);
    const isRegularDayHoliday = await service.isHoliday(regularDay);
    
    if (isRoshHashanaHoliday === true && isRegularDayHoliday === false) {
      console.log('✅ PASSED: Holiday detection correct');
      console.log(`   Rosh Hashana is holiday: ${isRoshHashanaHoliday}`);
      console.log(`   Regular day is holiday: ${isRegularDayHoliday}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Holiday detection incorrect');
      console.log(`   Rosh Hashana: ${isRoshHashanaHoliday}, Regular: ${isRegularDayHoliday}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 9: Get current Hebrew date
  try {
    console.log('Test 9: Get current Hebrew date...');
    const currentHebrew = service.getCurrentHebrewDate();
    
    if (currentHebrew.year > 5780 && 
        currentHebrew.month >= 1 && 
        currentHebrew.month <= 13 &&
        currentHebrew.day >= 1 && 
        currentHebrew.day <= 30) {
      console.log('✅ PASSED: Current Hebrew date retrieved');
      console.log(`   Current: ${currentHebrew.day} ${currentHebrew.monthName} ${currentHebrew.year}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid current Hebrew date');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 10: Different candle lighting times
  try {
    console.log('Test 10: Compare different candle lighting times...');
    const testDate = new Date('2024-09-20');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const config18: JewishCalculationConfig = {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 50,
      useElevation: false
    };
    
    const config40: JewishCalculationConfig = {
      method: 'standard',
      candleLightingMinutes: 40,
      havdalahMinutes: 50,
      useElevation: false
    };
    
    const times18 = await service.getSabbathTimes(testDate, location, config18);
    const times40 = await service.getSabbathTimes(testDate, location, config40);
    
    // With more minutes before sunset, candle lighting should be earlier
    if (times40.candleLighting.getTime() < times18.candleLighting.getTime()) {
      console.log('✅ PASSED: Candle lighting time varies correctly');
      console.log(`   18 min before: ${times18.candleLighting.toLocaleTimeString()}`);
      console.log(`   40 min before: ${times40.candleLighting.toLocaleTimeString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Candle lighting time calculation incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 11: Calculate Jewish prayer times
  try {
    console.log('Test 11: Calculate Jewish prayer times...');
    const testDate = new Date('2024-09-20');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const config: JewishCalculationConfig = {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 50,
      useElevation: false
    };
    
    const prayers = await service.getPrayerTimes(testDate, location, config);
    
    if (prayers.length === 3 &&
        prayers.some(p => p.name === 'Shacharit') &&
        prayers.some(p => p.name === 'Mincha') &&
        prayers.some(p => p.name === 'Maariv')) {
      console.log('✅ PASSED: Jewish prayer times calculated');
      prayers.forEach(p => {
        console.log(`   ${p.name}: ${p.time.toLocaleTimeString()}`);
      });
      passedTests++;
    } else {
      console.log('❌ FAILED: Incorrect prayer times structure');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 12: Calculate zmanim (halachic times)
  try {
    console.log('Test 12: Calculate zmanim (halachic times)...');
    const testDate = new Date('2024-09-20');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const zmanim = service.calculateZmanim(testDate, location);
    
    if (zmanim.sunrise && zmanim.sunset && zmanim.solarNoon &&
        zmanim.sunrise.getTime() < zmanim.solarNoon.getTime() &&
        zmanim.solarNoon.getTime() < zmanim.sunset.getTime()) {
      console.log('✅ PASSED: Zmanim calculated correctly');
      console.log(`   Sunrise: ${zmanim.sunrise.toLocaleTimeString()}`);
      console.log(`   Solar Noon: ${zmanim.solarNoon.toLocaleTimeString()}`);
      console.log(`   Sunset: ${zmanim.sunset.toLocaleTimeString()}`);
      console.log(`   Sof Zman Shema: ${zmanim.sofZmanShma.toLocaleTimeString()}`);
      console.log(`   Mincha Gedola: ${zmanim.minchaGedola.toLocaleTimeString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Zmanim calculation incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 13: Verify prayer times are in correct order
  try {
    console.log('Test 13: Verify prayer times are in correct order...');
    const testDate = new Date('2024-09-20');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const config: JewishCalculationConfig = {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 50,
      useElevation: false
    };
    
    const prayers = await service.getPrayerTimes(testDate, location, config);
    
    const shacharit = prayers.find(p => p.name === 'Shacharit')!;
    const mincha = prayers.find(p => p.name === 'Mincha')!;
    const maariv = prayers.find(p => p.name === 'Maariv')!;
    
    if (shacharit.time.getTime() < mincha.time.getTime() &&
        mincha.time.getTime() < maariv.time.getTime()) {
      console.log('✅ PASSED: Prayer times are in correct chronological order');
      passedTests++;
    } else {
      console.log('❌ FAILED: Prayer times are not in correct order');
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
