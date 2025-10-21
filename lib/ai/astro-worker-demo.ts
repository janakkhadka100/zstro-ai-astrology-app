// lib/ai/astro-worker-demo.ts
// Comprehensive demo of Vedic astrology house calculations with lordship verification

import {
  calculateHouse,
  getSignNumber,
  getSignName,
  getHouseMeaning,
  getPlanetLordshipHouses,
  formatPlanetPosition,
  formatPlanetPositionWithVerification,
  runSelfTest,
  SIGN_TO_NUM,
  NUM_TO_SIGN,
  NUM_TO_SIGN_NEPALI,
  HOUSE_MEANINGS,
  PLANET_LORDSHIP
} from './astro-worker-prompt';

/**
 * Demo: Complete birth chart analysis with lordship verification
 */
export function demoBirthChartAnalysis() {
  console.log('\n🌟 DEMO: Complete Birth Chart Analysis with Lordship Verification');
  console.log('═'.repeat(80));

  // Real birth chart data - Taurus ascendant chart
  const birthChart = {
    ascendant: 'Taurus',
    ascendantNepali: 'वृष',
    planets: [
      { name: 'Sun', sign: 'Leo', signNepali: 'सिंह', degree: 15.5 },
      { name: 'Moon', sign: 'Capricorn', signNepali: 'मकर', degree: 8.2 },
      { name: 'Mars', sign: 'Aries', signNepali: 'मेष', degree: 22.1 },
      { name: 'Mercury', sign: 'Virgo', signNepali: 'कन्या', degree: 3.7 },
      { name: 'Jupiter', sign: 'Sagittarius', signNepali: 'धनु', degree: 18.9 },
      { name: 'Venus', sign: 'Libra', signNepali: 'तुला', degree: 25.3 },
      { name: 'Saturn', sign: 'Aquarius', signNepali: 'कुम्भ', degree: 12.6 },
      { name: 'Rahu', sign: 'Gemini', signNepali: 'मिथुन', degree: 7.4 },
      { name: 'Ketu', sign: 'Sagittarius', signNepali: 'धनु', degree: 7.4 }
    ]
  };

  console.log(`\n📊 Birth Chart: ${birthChart.ascendant} Ascendant (${birthChart.ascendantNepali})`);
  console.log('─'.repeat(60));

  // English analysis
  console.log('\n🇺🇸 ENGLISH ANALYSIS:');
  console.log('─'.repeat(40));
  
  birthChart.planets.forEach(planet => {
    const result = formatPlanetPosition(
      planet.name,
      planet.sign,
      birthChart.ascendant,
      'en',
      true // Show lordship
    );
    console.log(result);
  });

  // Nepali analysis
  console.log('\n🇳🇵 NEPALI ANALYSIS:');
  console.log('─'.repeat(40));
  
  birthChart.planets.forEach(planet => {
    const result = formatPlanetPosition(
      planet.name,
      planet.signNepali,
      birthChart.ascendantNepali,
      'ne',
      true // Show lordship
    );
    console.log(result);
  });

  // Lordship summary
  console.log('\n👑 LORDSHIP SUMMARY:');
  console.log('─'.repeat(40));
  
  const ascendantNum = getSignNumber(birthChart.ascendant);
  const lordshipSummary = Object.keys(PLANET_LORDSHIP).map(planet => {
    const lordshipHouses = getPlanetLordshipHouses(planet, ascendantNum);
    if (lordshipHouses.length > 0) {
      const houseMeanings = lordshipHouses.map(house => getHouseMeaning(house, 'en'));
      return `${planet}: Houses ${lordshipHouses.join(', ')} (${houseMeanings.join(', ')})`;
    }
    return null;
  }).filter(Boolean);

  lordshipSummary.forEach(summary => console.log(summary));
}

/**
 * Demo: House calculation verification with test cases
 */
export function demoHouseCalculationVerification() {
  console.log('\n🧪 DEMO: House Calculation Verification');
  console.log('═'.repeat(60));

  // Real test cases with actual planetary positions
  const testCases = [
    { planet: 'Saturn', sign: 'Aquarius', ascendant: 'Taurus', expected: 10, desc: 'Taurus→Aquarius', degree: 12.6 },
    { planet: 'Jupiter', sign: 'Sagittarius', ascendant: 'Taurus', expected: 8, desc: 'Taurus→Sagittarius', degree: 18.9 },
    { planet: 'Sun', sign: 'Leo', ascendant: 'Taurus', expected: 4, desc: 'Taurus→Leo', degree: 15.5 },
    { planet: 'Mars', sign: 'Aries', ascendant: 'Taurus', expected: 12, desc: 'Taurus→Aries', degree: 22.1 },
    { planet: 'Venus', sign: 'Taurus', ascendant: 'Taurus', expected: 1, desc: 'Taurus→Taurus', degree: 15.5 },
    { planet: 'Mercury', sign: 'Gemini', ascendant: 'Taurus', expected: 2, desc: 'Taurus→Gemini', degree: 3.7 },
    { planet: 'Moon', sign: 'Cancer', ascendant: 'Taurus', expected: 3, desc: 'Taurus→Cancer', degree: 8.2 },
    { planet: 'Saturn', sign: 'Capricorn', ascendant: 'Taurus', expected: 9, desc: 'Taurus→Capricorn', degree: 12.6 }
  ];

  console.log('\n📋 Test Cases:');
  console.log('─'.repeat(40));

  testCases.forEach(test => {
    const result = formatPlanetPositionWithVerification(
      test.planet,
      test.sign,
      test.ascendant,
      'en',
      test.expected
    );
    console.log(`${test.desc}: ${result}`);
  });
}

/**
 * Demo: Cross-language verification
 */
export function demoCrossLanguageVerification() {
  console.log('\n🌐 DEMO: Cross-Language Verification');
  console.log('═'.repeat(60));

  // Real planetary data for cross-language verification
  const testPlanets = [
    { name: 'Saturn', sign: 'Aquarius', signNe: 'कुम्भ', degree: 12.6 },
    { name: 'Jupiter', sign: 'Sagittarius', signNe: 'धनु', degree: 18.9 },
    { name: 'Sun', sign: 'Leo', signNe: 'सिंह', degree: 15.5 },
    { name: 'Mars', sign: 'Aries', signNe: 'मेष', degree: 22.1 }
  ];

  const ascendant = 'Taurus';
  const ascendantNe = 'वृष';

  console.log('\n🔄 English vs Nepali Verification:');
  console.log('─'.repeat(50));

  testPlanets.forEach(planet => {
    const enResult = formatPlanetPosition(planet.name, planet.sign, ascendant, 'en', true);
    const neResult = formatPlanetPosition(planet.name, planet.signNe, ascendantNe, 'ne', true);
    
    console.log(`\n${planet.name}:`);
    console.log(`  EN: ${enResult}`);
    console.log(`  NE: ${neResult}`);
  });
}

/**
 * Demo: Self-test validation
 */
export function demoSelfTestValidation() {
  console.log('\n🔍 DEMO: Self-Test Validation');
  console.log('═'.repeat(60));

  const selfTestResult = runSelfTest();
  
  console.log('\n📊 Self-Test Results:');
  console.log('─'.repeat(30));
  
  if (selfTestResult.passed) {
    console.log('✅ All self-tests passed! House calculation system is working correctly.');
  } else {
    console.log('❌ Some self-tests failed! Please check the implementation.');
    selfTestResult.results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
    });
  }

  return selfTestResult;
}

/**
 * Demo: Lordship house calculation for different ascendants
 */
export function demoLordshipCalculation() {
  console.log('\n👑 DEMO: Lordship House Calculation for Different Ascendants');
  console.log('═'.repeat(80));

  const ascendants = [
    { name: 'Aries', nameNe: 'मेष' },
    { name: 'Taurus', nameNe: 'वृष' },
    { name: 'Gemini', nameNe: 'मिथुन' },
    { name: 'Cancer', nameNe: 'कर्क' },
    { name: 'Leo', nameNe: 'सिंह' },
    { name: 'Virgo', nameNe: 'कन्या' }
  ];

  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  ascendants.forEach(asc => {
    console.log(`\n📊 ${asc.name} Ascendant (${asc.nameNe}):`);
    console.log('─'.repeat(40));
    
    const ascNum = getSignNumber(asc.name);
    
    planets.forEach(planet => {
      const lordshipHouses = getPlanetLordshipHouses(planet, ascNum);
      if (lordshipHouses.length > 0) {
        const houseMeanings = lordshipHouses.map(house => getHouseMeaning(house, 'en'));
        console.log(`${planet}: Houses ${lordshipHouses.join(', ')} (${houseMeanings.join(', ')})`);
      }
    });
  });
}

/**
 * Demo: Error handling and edge cases
 */
export function demoErrorHandling() {
  console.log('\n⚠️ DEMO: Error Handling and Edge Cases');
  console.log('═'.repeat(60));

  // Real error handling test cases
  const errorCases = [
    { planet: 'Sun', sign: 'InvalidSign', ascendant: 'Taurus', desc: 'Invalid planet sign' },
    { planet: 'Sun', sign: 'Leo', ascendant: 'InvalidAscendant', desc: 'Invalid ascendant' },
    { planet: 'UnknownPlanet', sign: 'Leo', ascendant: 'Taurus', desc: 'Unknown planet' },
    { planet: 'Sun', sign: 'Leo', ascendant: 'Taurus', expected: 4, desc: 'Correct expectation (Sun in Leo = 4th house)' },
    { planet: 'Sun', sign: 'Leo', ascendant: 'Taurus', expected: 3, desc: 'Incorrect expectation (should auto-correct to 4th house)' }
  ];

  console.log('\n🧪 Error Test Cases:');
  console.log('─'.repeat(40));

  errorCases.forEach(test => {
    try {
      const result = formatPlanetPositionWithVerification(
        test.planet,
        test.sign,
        test.ascendant,
        'en',
        test.expected
      );
      console.log(`${test.desc}: ${result}`);
    } catch (error) {
      console.log(`${test.desc}: Error - ${error}`);
    }
  });
}

/**
 * Run all demos
 */
export function runAllDemos() {
  console.log('🚀 ZSTRO AI Vedic Astrology House Calculation System Demo');
  console.log('═'.repeat(80));
  console.log('Advanced Vedic astrology computation agent with deterministic math');
  console.log('═'.repeat(80));

  // Run all demos
  demoBirthChartAnalysis();
  demoHouseCalculationVerification();
  demoCrossLanguageVerification();
  demoSelfTestValidation();
  demoLordshipCalculation();
  demoErrorHandling();

  console.log('\n🎉 All demos completed successfully!');
  console.log('\n📝 Key Features Demonstrated:');
  console.log('  ✅ Deterministic house calculation formula');
  console.log('  ✅ Auto-verification and correction');
  console.log('  ✅ Lordship house calculation');
  console.log('  ✅ Cross-language support (English/Nepali)');
  console.log('  ✅ Error handling and edge cases');
  console.log('  ✅ Self-test validation');
  console.log('  ✅ Comprehensive birth chart analysis');
}

// Export for use in other files
export default {
  demoBirthChartAnalysis,
  demoHouseCalculationVerification,
  demoCrossLanguageVerification,
  demoSelfTestValidation,
  demoLordshipCalculation,
  demoErrorHandling,
  runAllDemos
};
