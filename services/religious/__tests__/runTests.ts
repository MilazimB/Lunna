/**
 * Simple test runner for IslamicCalendarService
 * This can be run directly with ts-node or used as a manual verification script
 */

import { IslamicCalendarService } from '../IslamicCalendarService';
import { Location, IslamicCalculationConfig } from '../../../types';

async function runTests() {
  console.log('🕌 Running IslamicCalendarService Tests\n');
  
  const service = new IslamicCalendarService();
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Basic prayer time calculation
  try {
    console.log('Test 1: Calculate prayer times for New York...');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    const config: IslamicCalculationConfig = {
      method: 'NorthAmerica',
      madhab: 'shafi'
    };
    
    const date = new Date(2025, 0, 15);
    const prayers = await service.getPrayerTimes(date, location, config);

    if (prayers.length === 5 &&
        prayers[0].name === 'Fajr' &&
        prayers[4].name === 'Isha') {
      console.log('✅ PASSED: Prayer times calculated correctly');
      console.log(`   Fajr: ${prayers[0].time.toLocaleTimeString()}`);
      console.log(`   Dhuhr: ${prayers[1].time.toLocaleTimeString()}`);
      console.log(`   Maghrib: ${prayers[3].time.toLocaleTimeString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Incorrect prayer times structure');
      console.log(`   Expected 5 prayers, got ${prayers.length}`);
      console.log(`   Prayers: ${prayers.map(p => p.name).join(', ')}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 2: Qibla direction calculation
  try {
    console.log('Test 2: Calculate Qibla direction for New York...');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060
    };
    
    const qibla = await service.getQiblaDirection(location);
    
    if (typeof qibla === 'number' && qibla >= 0 && qibla < 360) {
      console.log(`✅ PASSED: Qibla direction calculated: ${qibla.toFixed(2)}°`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid Qibla direction');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 3: Madhab difference (Hanafi vs Shafi Asr)
  try {
    console.log('Test 3: Compare Hanafi and Shafi Asr times...');
    const location: Location = {
      latitude: 33.6844,
      longitude: 73.0479,
      timezone: 'Asia/Karachi'
    };
    
    const configShafi: IslamicCalculationConfig = {
      method: 'Karachi',
      madhab: 'shafi'
    };
    
    const configHanafi: IslamicCalculationConfig = {
      method: 'Karachi',
      madhab: 'hanafi'
    };
    
    const date = new Date(2025, 0, 15);
    const prayersShafi = await service.getPrayerTimes(date, location, configShafi);
    const prayersHanafi = await service.getPrayerTimes(date, location, configHanafi);
    
    const asrShafi = prayersShafi.find(p => p.name === 'Asr')!;
    const asrHanafi = prayersHanafi.find(p => p.name === 'Asr')!;
    
    if (asrHanafi.time.getTime() > asrShafi.time.getTime()) {
      console.log('✅ PASSED: Hanafi Asr is later than Shafi Asr');
      console.log(`   Shafi Asr: ${asrShafi.time.toLocaleTimeString()}`);
      console.log(`   Hanafi Asr: ${asrHanafi.time.toLocaleTimeString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Madhab calculation incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 4: Prayer time adjustments
  try {
    console.log('Test 4: Apply manual adjustments to prayer times...');
    const location: Location = {
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London'
    };
    
    const configNoAdj: IslamicCalculationConfig = {
      method: 'MuslimWorldLeague',
      madhab: 'shafi'
    };
    
    const configWithAdj: IslamicCalculationConfig = {
      method: 'MuslimWorldLeague',
      madhab: 'shafi',
      adjustments: {
        fajr: 2
      }
    };
    
    const date = new Date(2025, 0, 15);
    const prayersNoAdj = await service.getPrayerTimes(date, location, configNoAdj);
    const prayersWithAdj = await service.getPrayerTimes(date, location, configWithAdj);
    
    const fajrNoAdj = prayersNoAdj.find(p => p.name === 'Fajr')!;
    const fajrWithAdj = prayersWithAdj.find(p => p.name === 'Fajr')!;
    
    const diff = (fajrWithAdj.time.getTime() - fajrNoAdj.time.getTime()) / (60 * 1000);
    
    if (Math.abs(diff - 2) < 0.1) {
      console.log('✅ PASSED: Adjustments applied correctly');
      console.log(`   Difference: ${diff.toFixed(2)} minutes`);
      passedTests++;
    } else {
      console.log(`❌ FAILED: Adjustment incorrect (${diff} minutes instead of 2)`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 5: Next prayer calculation
  try {
    console.log('Test 5: Get next prayer from current time...');
    const location: Location = {
      latitude: 40.7128,
      longitude: -74.0060
    };
    
    const config: IslamicCalculationConfig = {
      method: 'NorthAmerica',
      madhab: 'shafi'
    };
    
    const date = new Date(2025, 0, 15);
    const prayers = await service.getPrayerTimes(date, location, config);
    
    // Use a time that's definitely between two prayers
    // Set to 2 PM local time (14:00) which should be after Dhuhr and before Asr
    const currentTime = new Date(2025, 0, 15, 14, 0, 0);
    const nextPrayer = service.getNextPrayer(prayers, currentTime);
    
    if (nextPrayer && nextPrayer.time.getTime() > currentTime.getTime()) {
      console.log('✅ PASSED: Next prayer identified correctly');
      console.log(`   Current time: ${currentTime.toLocaleTimeString()}`);
      console.log(`   Next prayer: ${nextPrayer.name} at ${nextPrayer.time.toLocaleTimeString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Next prayer calculation incorrect');
      if (nextPrayer) {
        console.log(`   Got: ${nextPrayer.name} at ${nextPrayer.time.toLocaleTimeString()}`);
      }
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
