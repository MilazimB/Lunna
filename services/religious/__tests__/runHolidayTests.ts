/**
 * Test runner for Islamic holiday calculations
 */

import { IslamicCalendarService } from '../IslamicCalendarService';

async function runHolidayTests() {
  console.log('🌙 Running Islamic Holiday Calculation Tests\n');
  
  const service = new IslamicCalendarService();
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Gregorian to Hijri conversion
  try {
    console.log('Test 1: Convert Gregorian to Hijri date...');
    const gregorianDate = new Date(2025, 0, 15);
    const hijriDate = (service as any).gregorianToHijri(gregorianDate);
    
    if (hijriDate.year && hijriDate.month >= 1 && hijriDate.month <= 12 && 
        hijriDate.day >= 1 && hijriDate.day <= 30 && hijriDate.monthName) {
      console.log('✅ PASSED: Hijri conversion successful');
      console.log(`   Gregorian: ${gregorianDate.toDateString()}`);
      console.log(`   Hijri: ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid Hijri date structure');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 2: Get Islamic holidays for a year
  try {
    console.log('Test 2: Get Islamic holidays for 2025...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const holidays = await service.getIslamicHolidays(startDate, endDate);
    
    if (holidays.length > 0) {
      console.log(`✅ PASSED: Found ${holidays.length} Islamic holidays`);
      console.log('   Sample holidays:');
      holidays.slice(0, 5).forEach(h => {
        console.log(`   - ${h.name} (${h.date.toDateString()})`);
      });
      passedTests++;
    } else {
      console.log('❌ FAILED: No holidays found');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 3: Holiday structure validation
  try {
    console.log('Test 3: Validate holiday data structure...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 11, 31);
    
    const holidays = await service.getIslamicHolidays(startDate, endDate);
    
    if (holidays.length > 0) {
      const holiday = holidays[0];
      const hasRequiredFields = 
        holiday.id && 
        holiday.name && 
        holiday.tradition === 'islam' &&
        holiday.date instanceof Date &&
        holiday.description &&
        holiday.significance &&
        holiday.observanceType;
      
      if (hasRequiredFields) {
        console.log('✅ PASSED: Holiday structure is valid');
        console.log(`   Sample: ${holiday.name}`);
        console.log(`   Type: ${holiday.observanceType}`);
        passedTests++;
      } else {
        console.log('❌ FAILED: Missing required fields');
        failedTests++;
      }
    } else {
      console.log('⚠️  SKIPPED: No holidays to validate');
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 4: Ramadan date calculation
  try {
    console.log('Test 4: Calculate Ramadan dates for 2025...');
    const ramadanDates = service.getRamadanDates(2025);
    
    const durationDays = (ramadanDates.end.getTime() - ramadanDates.start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ramadanDates.start instanceof Date && 
        ramadanDates.end instanceof Date &&
        durationDays >= 28 && durationDays <= 31) {
      console.log('✅ PASSED: Ramadan dates calculated');
      console.log(`   Start: ${ramadanDates.start.toDateString()}`);
      console.log(`   End: ${ramadanDates.end.toDateString()}`);
      console.log(`   Duration: ${Math.round(durationDays)} days`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid Ramadan date range');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 5: Check if date is during Ramadan
  try {
    console.log('Test 5: Check if date is during Ramadan...');
    const ramadanDates = service.getRamadanDates(2025);
    
    // Test a date during Ramadan
    const duringRamadan = new Date(ramadanDates.start);
    duringRamadan.setDate(duringRamadan.getDate() + 10);
    
    const isDuringRamadan = service.isRamadan(duringRamadan);
    
    if (isDuringRamadan) {
      console.log('✅ PASSED: Correctly identified date during Ramadan');
      console.log(`   Date: ${duringRamadan.toDateString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Failed to identify Ramadan date');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 6: Current Hijri date
  try {
    console.log('Test 6: Get current Hijri date...');
    const currentHijri = service.getCurrentHijriDate();
    
    if (currentHijri.year > 1440 && currentHijri.year < 1500 &&
        currentHijri.month >= 1 && currentHijri.month <= 12) {
      console.log('✅ PASSED: Current Hijri date retrieved');
      console.log(`   Current Hijri: ${currentHijri.day} ${currentHijri.monthName} ${currentHijri.year}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid current Hijri date');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 7: Hijri to Gregorian conversion
  try {
    console.log('Test 7: Convert Hijri to Gregorian date...');
    const hijriDate = {
      year: 1446,
      month: 9,
      day: 1,
      monthName: 'Ramadan'
    };
    
    const gregorianDate = service.hijriToGregorian(hijriDate);
    
    if (gregorianDate instanceof Date && 
        gregorianDate.getFullYear() >= 2020 && 
        gregorianDate.getFullYear() <= 2030) {
      console.log('✅ PASSED: Hijri to Gregorian conversion successful');
      console.log(`   Hijri: 1 Ramadan 1446`);
      console.log(`   Gregorian: ${gregorianDate.toDateString()}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Invalid Gregorian date');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 8: Find specific holidays
  try {
    console.log('Test 8: Find Eid al-Fitr and Eid al-Adha...');
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2026, 11, 31);
    
    const holidays = await service.getIslamicHolidays(startDate, endDate);
    const eidFitr = holidays.find(h => h.name.includes('Eid al-Fitr'));
    const eidAdha = holidays.find(h => h.name.includes('Eid al-Adha'));
    
    if (eidFitr || eidAdha) {
      console.log('✅ PASSED: Found major Eid holidays');
      if (eidFitr) {
        console.log(`   Eid al-Fitr: ${eidFitr.date.toDateString()}`);
      }
      if (eidAdha) {
        console.log(`   Eid al-Adha: ${eidAdha.date.toDateString()}`);
      }
      passedTests++;
    } else {
      console.log('❌ FAILED: Could not find Eid holidays');
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
runHolidayTests().catch(console.error);
