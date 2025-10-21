// lib/ai/astro-worker-runner.ts
// Simple test runner for Vedic astrology house calculations

import { runAllDemos } from './astro-worker-demo';
import { runSelfTest } from './astro-worker-prompt';

/**
 * Quick test runner for development
 */
export function quickTest() {
  console.log('🧪 Quick Test - Vedic Astrology House Calculations');
  console.log('═'.repeat(60));

  // Run self-test first
  console.log('\n1️⃣ Self-Test Validation:');
  const selfTestResult = runSelfTest();
  
  if (selfTestResult.passed) {
    console.log('✅ All self-tests passed!');
  } else {
    console.log('❌ Some self-tests failed!');
    return false;
  }

  // Run a few key demos
  console.log('\n2️⃣ Key Demos:');
  console.log('─'.repeat(30));
  
  // Test basic house calculation
  console.log('\n📊 Basic House Calculation Test:');
  const testCases = [
    { planet: 'Saturn', sign: 'Aquarius', ascendant: 'Taurus', expected: 10 },
    { planet: 'Jupiter', sign: 'Sagittarius', ascendant: 'Taurus', expected: 8 },
    { planet: 'Sun', sign: 'Leo', ascendant: 'Taurus', expected: 4 }
  ];

  testCases.forEach(test => {
    const { calculateHouse, getSignNumber } = require('./astro-worker-prompt');
    const planetSignNum = getSignNumber(test.sign);
    const ascendantSignNum = getSignNumber(test.ascendant);
    const calculatedHouse = calculateHouse(planetSignNum, ascendantSignNum);
    
    const status = calculatedHouse === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.planet} in ${test.sign} (${test.ascendant} asc): House ${calculatedHouse} (expected ${test.expected})`);
  });

  console.log('\n🎉 Quick test completed!');
  return true;
}

/**
 * Full demo runner
 */
export function runFullDemo() {
  console.log('🚀 Running Full Demo Suite...');
  runAllDemos();
}

/**
 * Main runner function
 */
export function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--full') || args.includes('-f')) {
    runFullDemo();
  } else if (args.includes('--quick') || args.includes('-q')) {
    quickTest();
  } else {
    console.log('Usage:');
    console.log('  --quick, -q    Run quick test');
    console.log('  --full, -f     Run full demo suite');
    console.log('');
    console.log('Running quick test by default...');
    quickTest();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default {
  quickTest,
  runFullDemo,
  main
};
