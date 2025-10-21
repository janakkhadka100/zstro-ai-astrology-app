// test-astro-function.js
// Test the calculateHouse function

// Simple implementation of calculateHouse
function calculateHouse(planetSignNum, ascendantSignNum) {
  return ((planetSignNum - ascendantSignNum + 12) % 12) + 1;
}

// Test cases
const tests = [
  { asc: 2, planet: 11, expected: 10, desc: 'Taurus→Aquarius' },
  { asc: 2, planet: 10, expected: 9, desc: 'Taurus→Capricorn' },
  { asc: 1, planet: 1, expected: 1, desc: 'Aries→Aries' },
  { asc: 12, planet: 2, expected: 3, desc: 'Pisces→Taurus' }
];

console.log('🧪 Testing calculateHouse function...\n');

tests.forEach(test => {
  const actual = calculateHouse(test.planet, test.asc);
  const passed = actual === test.expected;
  console.log(`${passed ? '✅' : '❌'} ${test.desc}: Expected ${test.expected}, Got ${actual}`);
});

console.log('\n🎉 Test completed!');
