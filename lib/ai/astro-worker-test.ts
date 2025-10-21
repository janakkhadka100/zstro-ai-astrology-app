// lib/ai/astro-worker-test.ts
// Test suite for Vedic astrology house calculations

import {
  calculateHouse,
  getSignNumber,
  getSignName,
  getHouseMeaning,
  getPlanetLordshipHouses,
  formatPlanetPosition,
  runSelfTest,
  SIGN_TO_NUM,
  NUM_TO_SIGN,
  NUM_TO_SIGN_NEPALI,
  HOUSE_MEANINGS,
  PLANET_LORDSHIP
} from './astro-worker-prompt';

/**
 * Test suite for Vedic astrology house calculations
 */
export class AstroWorkerTestSuite {
  
  /**
   * Test basic house calculation formula
   */
  static testHouseCalculation() {
    console.log('🧪 Testing House Calculation Formula...');
    
    const testCases = [
      { asc: 2, planet: 11, expected: 10, desc: 'Taurus→Aquarius' },
      { asc: 2, planet: 10, expected: 9, desc: 'Taurus→Capricorn' },
      { asc: 1, planet: 1, expected: 1, desc: 'Aries→Aries' },
      { asc: 12, planet: 2, expected: 3, desc: 'Pisces→Taurus' },
      { asc: 5, planet: 8, expected: 4, desc: 'Leo→Scorpio' },
      { asc: 7, planet: 1, expected: 7, desc: 'Libra→Aries' },
      { asc: 9, planet: 6, expected: 10, desc: 'Sagittarius→Virgo' }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(test => {
      const actual = calculateHouse(test.planet, test.asc);
      const success = actual === test.expected;
      
      if (success) {
        passed++;
        console.log(`✅ ${test.desc}: ${test.asc}→${test.planet} = ${actual} (expected ${test.expected})`);
      } else {
        failed++;
        console.log(`❌ ${test.desc}: ${test.asc}→${test.planet} = ${actual} (expected ${test.expected})`);
      }
    });

    console.log(`\n📊 House Calculation Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
  }

  /**
   * Test sign number mapping
   */
  static testSignMapping() {
    console.log('\n🧪 Testing Sign Number Mapping...');
    
    const testSigns = [
      { name: 'Aries', expected: 1 },
      { name: 'Taurus', expected: 2 },
      { name: 'Gemini', expected: 3 },
      { name: 'Cancer', expected: 4 },
      { name: 'Leo', expected: 5 },
      { name: 'Virgo', expected: 6 },
      { name: 'Libra', expected: 7 },
      { name: 'Scorpio', expected: 8 },
      { name: 'Sagittarius', expected: 9 },
      { name: 'Capricorn', expected: 10 },
      { name: 'Aquarius', expected: 11 },
      { name: 'Pisces', expected: 12 },
      { name: 'मेष', expected: 1 },
      { name: 'वृष', expected: 2 },
      { name: 'मिथुन', expected: 3 },
      { name: 'कर्क', expected: 4 },
      { name: 'सिंह', expected: 5 },
      { name: 'कन्या', expected: 6 },
      { name: 'तुला', expected: 7 },
      { name: 'वृश्चिक', expected: 8 },
      { name: 'धनु', expected: 9 },
      { name: 'मकर', expected: 10 },
      { name: 'कुम्भ', expected: 11 },
      { name: 'मीन', expected: 12 }
    ];

    let passed = 0;
    let failed = 0;

    testSigns.forEach(test => {
      const actual = getSignNumber(test.name);
      const success = actual === test.expected;
      
      if (success) {
        passed++;
        console.log(`✅ ${test.name} → ${actual}`);
      } else {
        failed++;
        console.log(`❌ ${test.name} → ${actual} (expected ${test.expected})`);
      }
    });

    console.log(`\n📊 Sign Mapping Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testSigns.length };
  }

  /**
   * Test planet lordship calculations
   */
  static testPlanetLordship() {
    console.log('\n🧪 Testing Planet Lordship...');
    
    const testCases = [
      { planet: 'Sun', asc: 2, expected: [4], desc: 'Sun lordship in Taurus lagna' },
      { planet: 'Moon', asc: 2, expected: [3], desc: 'Moon lordship in Taurus lagna' },
      { planet: 'Mars', asc: 2, expected: [12, 7], desc: 'Mars lordship in Taurus lagna' },
      { planet: 'Mercury', asc: 2, expected: [2, 5], desc: 'Mercury lordship in Taurus lagna' },
      { planet: 'Jupiter', asc: 2, expected: [8, 11], desc: 'Jupiter lordship in Taurus lagna' },
      { planet: 'Venus', asc: 2, expected: [1, 6], desc: 'Venus lordship in Taurus lagna' },
      { planet: 'Saturn', asc: 2, expected: [9, 10], desc: 'Saturn lordship in Taurus lagna' }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(test => {
      const actual = getPlanetLordshipHouses(test.planet, test.asc);
      const success = JSON.stringify(actual.sort()) === JSON.stringify(test.expected.sort());
      
      if (success) {
        passed++;
        console.log(`✅ ${test.desc}: ${test.planet} owns houses ${actual.join(', ')}`);
      } else {
        failed++;
        console.log(`❌ ${test.desc}: ${test.planet} owns houses ${actual.join(', ')} (expected ${test.expected.join(', ')})`);
      }
    });

    console.log(`\n📊 Lordship Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
  }

  /**
   * Test house meaning translations
   */
  static testHouseMeanings() {
    console.log('\n🧪 Testing House Meanings...');
    
    const testHouses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let passed = 0;
    let failed = 0;

    testHouses.forEach(houseNum => {
      const enMeaning = getHouseMeaning(houseNum, 'en');
      const neMeaning = getHouseMeaning(houseNum, 'ne');
      
      if (enMeaning && neMeaning && enMeaning !== 'Unknown' && neMeaning !== 'Unknown') {
        passed++;
        console.log(`✅ House ${houseNum}: ${enMeaning} / ${neMeaning}`);
      } else {
        failed++;
        console.log(`❌ House ${houseNum}: Missing meaning`);
      }
    });

    console.log(`\n📊 House Meanings Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testHouses.length };
  }

  /**
   * Test planet position formatting
   */
  static testPlanetPositionFormatting() {
    console.log('\n🧪 Testing Planet Position Formatting...');
    
    const testCases = [
      { planet: 'Saturn', planetSign: 'Aquarius', ascendantSign: 'Taurus', language: 'en' as const },
      { planet: 'Mars', planetSign: 'Aries', ascendantSign: 'Leo', language: 'en' as const },
      { planet: 'शनि', planetSign: 'कुम्भ', ascendantSign: 'वृष', language: 'ne' as const },
      { planet: 'बुध', planetSign: 'मिथुन', ascendantSign: 'सिंह', language: 'ne' as const }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(test => {
      try {
        const result = formatPlanetPosition(
          test.planet,
          test.planetSign,
          test.ascendantSign,
          test.language
        );
        
        if (result && !result.includes('Invalid')) {
          passed++;
          console.log(`✅ ${test.planet}: ${result}`);
        } else {
          failed++;
          console.log(`❌ ${test.planet}: Invalid result`);
        }
      } catch (error) {
        failed++;
        console.log(`❌ ${test.planet}: Error - ${error}`);
      }
    });

    console.log(`\n📊 Formatting Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: testCases.length };
  }

  /**
   * Run all tests
   */
  static runAllTests() {
    console.log('🚀 Starting Vedic Astrology House Calculation Test Suite\n');
    
    const results = {
      houseCalculation: this.testHouseCalculation(),
      signMapping: this.testSignMapping(),
      planetLordship: this.testPlanetLordship(),
      houseMeanings: this.testHouseMeanings(),
      planetPositionFormatting: this.testPlanetPositionFormatting()
    };

    const totalPassed = Object.values(results).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(results).reduce((sum, result) => sum + result.failed, 0);
    const totalTests = Object.values(results).reduce((sum, result) => sum + result.total, 0);

    console.log('\n🎯 FINAL RESULTS:');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`🎯 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! House calculation system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }

    return {
      totalPassed,
      totalFailed,
      totalTests,
      successRate: (totalPassed / totalTests) * 100,
      results
    };
  }

  /**
   * Run self-test from the prompt
   */
  static runSelfTest() {
    console.log('\n🧪 Running Self-Test from Prompt...');
    const selfTestResult = runSelfTest();
    
    if (selfTestResult.passed) {
      console.log('✅ Self-test passed! All house calculations are correct.');
    } else {
      console.log('❌ Self-test failed! Some house calculations are incorrect.');
      selfTestResult.results.forEach(result => {
        console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
      });
    }

    return selfTestResult;
  }
}

// Export for use in other files
export default AstroWorkerTestSuite;
