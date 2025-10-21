// test-astro-worker.js
// Simple test for Vedic astrology house calculations

const { 
  calculateHouse, 
  getSignNumber, 
  formatPlanetPosition,
  runSelfTest 
} = require('./lib/ai/astro-worker-prompt.ts');

console.log('🧪 Testing Vedic Astrology House Calculations');
console.log('═'.repeat(60));

// Test 1: Basic house calculation
console.log('\n1️⃣ Basic House Calculation:');
const testCases = [
  { planet: 'Saturn', sign: 'Aquarius', ascendant: 'Taurus', expected: 10 },
  { planet: 'Jupiter', sign: 'Sagittarius', ascendant: 'Taurus', expected: 8 },
  { planet: 'Sun', sign: 'Leo', ascendant: 'Taurus', expected: 4 }
];

testCases.forEach(test => {
  const planetSignNum = getSignNumber(test.sign);
  const ascendantSignNum = getSignNumber(test.ascendant);
  const calculatedHouse = calculateHouse(planetSignNum, ascendantSignNum);
  
  const status = calculatedHouse === test.expected ? '✅' : '❌';
  console.log(`${status} ${test.planet} in ${test.sign} (${test.ascendant} asc): House ${calculatedHouse} (expected ${test.expected})`);
});

// Test 2: Formatted output
console.log('\n2️⃣ Formatted Output:');
const formatted = formatPlanetPosition('Saturn', 'Aquarius', 'Taurus', 'en', true);
console.log(formatted);

// Test 3: Self-test
console.log('\n3️⃣ Self-Test:');
const selfTestResult = runSelfTest();
console.log(selfTestResult.passed ? '✅ All self-tests passed!' : '❌ Some self-tests failed!');

console.log('\n🎉 Test completed!');
