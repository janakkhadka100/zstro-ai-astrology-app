// lib/ai/astro-worker-integration.ts
// Integration example for ZSTRO AI Vedic astrology house calculations

import {
  calculateHouse,
  getSignNumber,
  getSignName,
  getHouseMeaning,
  getPlanetLordshipHouses,
  formatPlanetPosition,
  formatPlanetPositionWithVerification,
  runSelfTest
} from './astro-worker-prompt';

/**
 * Integration example for existing ZSTRO AI codebase
 */
export class AstroWorkerIntegration {
  
  /**
   * Analyze a birth chart with house calculations
   */
  static analyzeBirthChart(chartData: {
    ascendant: string;
    planets: Array<{
      name: string;
      sign: string;
      degree?: number;
    }>;
    language?: 'en' | 'ne';
  }) {
    const { ascendant, planets, language = 'en' } = chartData;
    const ascendantNum = getSignNumber(ascendant);
    
    if (ascendantNum === 0) {
      throw new Error(`Invalid ascendant: ${ascendant}`);
    }

    const results = planets.map(planet => {
      const planetSignNum = getSignNumber(planet.sign);
      
      if (planetSignNum === 0) {
        return {
          planet: planet.name,
          error: `Invalid sign: ${planet.sign}`,
          house: 0,
          meaning: ''
        };
      }

      const houseNum = calculateHouse(planetSignNum, ascendantNum);
      const houseMeaning = getHouseMeaning(houseNum, language);
      const lordshipHouses = getPlanetLordshipHouses(planet.name, ascendantNum);
      
      return {
        planet: planet.name,
        sign: planet.sign,
        signNum: planetSignNum,
        house: houseNum,
        meaning: houseMeaning,
        lordshipHouses,
        formatted: formatPlanetPosition(planet.name, planet.sign, ascendant, language, true)
      };
    });

    return {
      ascendant,
      ascendantNum,
      planets: results,
      lordshipSummary: this.getLordshipSummary(ascendantNum, language)
    };
  }

  /**
   * Get lordship summary for an ascendant
   */
  static getLordshipSummary(ascendantNum: number, language: 'en' | 'ne' = 'en') {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    return planets.map(planet => {
      const lordshipHouses = getPlanetLordshipHouses(planet, ascendantNum);
      if (lordshipHouses.length > 0) {
        const houseMeanings = lordshipHouses.map(house => getHouseMeaning(house, language));
        return {
          planet,
          houses: lordshipHouses,
          meanings: houseMeanings,
          formatted: language === 'ne' 
            ? `${planet} ले ${lordshipHouses.join(', ')} औं भावहरूको स्वामित्व गर्छ (${houseMeanings.join(', ')})`
            : `${planet} owns houses ${lordshipHouses.join(', ')} (${houseMeanings.join(', ')})`
        };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * Quick house lookup for a specific planet
   */
  static getPlanetHouse(planet: string, planetSign: string, ascendant: string, language: 'en' | 'ne' = 'en') {
    const planetSignNum = getSignNumber(planetSign);
    const ascendantNum = getSignNumber(ascendant);
    
    if (planetSignNum === 0 || ascendantNum === 0) {
      throw new Error('Invalid planet sign or ascendant');
    }

    const houseNum = calculateHouse(planetSignNum, ascendantNum);
    const houseMeaning = getHouseMeaning(houseNum, language);
    const lordshipHouses = getPlanetLordshipHouses(planet, ascendantNum);
    
    return {
      planet,
      sign: planetSign,
      house: houseNum,
      meaning: houseMeaning,
      lordshipHouses,
      formatted: formatPlanetPosition(planet, planetSign, ascendant, language, true)
    };
  }

  /**
   * Validate house calculations for a chart
   */
  static validateChart(chartData: {
    ascendant: string;
    planets: Array<{
      name: string;
      sign: string;
      expectedHouse?: number;
    }>;
  }) {
    const { ascendant, planets } = chartData;
    const ascendantNum = getSignNumber(ascendant);
    
    if (ascendantNum === 0) {
      throw new Error(`Invalid ascendant: ${ascendant}`);
    }

    const results = planets.map(planet => {
      const planetSignNum = getSignNumber(planet.sign);
      const calculatedHouse = calculateHouse(planetSignNum, ascendantNum);
      const isValid = !planet.expectedHouse || calculatedHouse === planet.expectedHouse;
      
      return {
        planet: planet.name,
        sign: planet.sign,
        calculatedHouse,
        expectedHouse: planet.expectedHouse,
        isValid,
        formatted: formatPlanetPositionWithVerification(
          planet.name,
          planet.sign,
          ascendant,
          'en',
          planet.expectedHouse
        )
      };
    });

    const validCount = results.filter(r => r.isValid).length;
    const totalCount = results.length;
    
    return {
      results,
      summary: {
        valid: validCount,
        total: totalCount,
        successRate: (validCount / totalCount) * 100
      }
    };
  }

  /**
   * Run system validation
   */
  static async runValidation() {
    console.log('🔍 Running ZSTRO AI Astro Worker Validation...');
    
    // Run self-test
    const selfTestResult = runSelfTest();
    
    if (!selfTestResult.passed) {
      console.error('❌ Self-test failed!');
      return false;
    }
    
    console.log('✅ Self-test passed!');
    
  // Real integration test with actual planetary positions
  const testChart = {
    ascendant: 'Taurus',
    ascendantDegree: 15.5,
    planets: [
      { name: 'Sun', sign: 'Leo', expectedHouse: 4, degree: 15.5 },
      { name: 'Moon', sign: 'Capricorn', expectedHouse: 9, degree: 8.2 },
      { name: 'Mars', sign: 'Aries', expectedHouse: 12, degree: 22.1 },
      { name: 'Mercury', sign: 'Virgo', expectedHouse: 5, degree: 3.7 },
      { name: 'Jupiter', sign: 'Sagittarius', expectedHouse: 8, degree: 18.9 },
      { name: 'Venus', sign: 'Libra', expectedHouse: 6, degree: 25.3 },
      { name: 'Saturn', sign: 'Aquarius', expectedHouse: 10, degree: 12.6 }
    ]
  };
    
    const validationResult = this.validateChart(testChart);
    
    console.log(`📊 Validation Results: ${validationResult.summary.valid}/${validationResult.summary.total} calculations valid`);
    console.log(`🎯 Success Rate: ${validationResult.summary.successRate.toFixed(2)}%`);
    
    if (validationResult.summary.successRate === 100) {
      console.log('🎉 All validations passed! System is ready for production.');
      return true;
    } else {
      console.log('⚠️ Some validations failed. Please check the implementation.');
      return false;
    }
  }
}

/**
 * Example usage for ZSTRO AI integration
 */
export function exampleUsage() {
  console.log('🌟 ZSTRO AI Astro Worker Integration Example');
  console.log('═'.repeat(60));

  // Real birth chart analysis with actual data
  console.log('\n1️⃣ Real Birth Chart Analysis:');
  const birthChart = {
    ascendant: 'Taurus',
    ascendantDegree: 15.5,
    planets: [
      { name: 'Sun', sign: 'Leo', degree: 15.5, retro: false },
      { name: 'Moon', sign: 'Capricorn', degree: 8.2, retro: false },
      { name: 'Mars', sign: 'Aries', degree: 22.1, retro: false },
      { name: 'Mercury', sign: 'Virgo', degree: 3.7, retro: false },
      { name: 'Jupiter', sign: 'Sagittarius', degree: 18.9, retro: false },
      { name: 'Venus', sign: 'Libra', degree: 25.3, retro: false },
      { name: 'Saturn', sign: 'Aquarius', degree: 12.6, retro: false }
    ],
    language: 'en' as const
  };

  const analysis = AstroWorkerIntegration.analyzeBirthChart(birthChart);
  console.log(`Ascendant: ${analysis.ascendant} (${analysis.ascendantNum})`);
  analysis.planets.forEach(planet => {
    if (planet.error) {
      console.log(`❌ ${planet.planet}: ${planet.error}`);
    } else {
      console.log(`✅ ${planet.formatted}`);
    }
  });

  // Example 2: Lordship summary
  console.log('\n2️⃣ Lordship Summary:');
  analysis.lordshipSummary.forEach(lordship => {
    console.log(lordship.formatted);
  });

  // Example 3: Quick planet lookup
  console.log('\n3️⃣ Quick Planet Lookup:');
  const planetInfo = AstroWorkerIntegration.getPlanetHouse('Saturn', 'Aquarius', 'Taurus', 'en');
  console.log(planetInfo.formatted);

  // Real Nepali language analysis
  console.log('\n4️⃣ Real Nepali Language Analysis:');
  const nepaliInfo = AstroWorkerIntegration.getPlanetHouse('शनि', 'कुम्भ', 'वृष', 'ne');
  console.log(nepaliInfo.formatted);
}

// Export for use in other files
export default AstroWorkerIntegration;
