// src/astro/house-calculator.ts
// House calculation system with Lagna reference

export const ZODIAC_SIGN_NUMBERS: Record<string, number> = {
  'Aries': 1,
  'Taurus': 2,
  'Gemini': 3,
  'Cancer': 4,
  'Leo': 5,
  'Virgo': 6,
  'Libra': 7,
  'Scorpio': 8,
  'Sagittarius': 9,
  'Capricorn': 10,
  'Aquarius': 11,
  'Pisces': 12
};

export const ZODIAC_SIGN_NAMES: Record<number, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces'
};

/**
 * Compute house number (bhava) for a planet relative to Lagna
 * Formula: House = ((Planet_Rashi - Lagna_Rashi + 12) % 12) + 1
 * 
 * @param planetRashi - The zodiac sign number (1-12) where the planet is located
 * @param lagnaRashi - The zodiac sign number (1-12) of the ascendant
 * @returns The house number (1-12) relative to Lagna
 */
export function computeHouse(planetRashi: number, lagnaRashi: number): number {
  return ((planetRashi - lagnaRashi + 12) % 12) + 1;
}

/**
 * Compute house number using sign names
 * 
 * @param planetSign - The zodiac sign name where the planet is located
 * @param lagnaSign - The zodiac sign name of the ascendant
 * @returns The house number (1-12) relative to Lagna
 */
export function computeHouseFromSigns(planetSign: string, lagnaSign: string): number {
  const planetRashi = ZODIAC_SIGN_NUMBERS[planetSign];
  const lagnaRashi = ZODIAC_SIGN_NUMBERS[lagnaSign];
  
  if (!planetRashi || !lagnaRashi) {
    throw new Error(`Invalid sign names: ${planetSign}, ${lagnaSign}`);
  }
  
  return computeHouse(planetRashi, lagnaRashi);
}

/**
 * Get house name from house number
 * 
 * @param houseNumber - The house number (1-12)
 * @returns The house name
 */
export function getHouseName(houseNumber: number): string {
  const houseNames: Record<number, string> = {
    1: '1st House (Lagna)',
    2: '2nd House (Dhana)',
    3: '3rd House (Sahaja)',
    4: '4th House (Sukha)',
    5: '5th House (Putra)',
    6: '6th House (Ari)',
    7: '7th House (Kalatra)',
    8: '8th House (Ayu)',
    9: '9th House (Bhagya)',
    10: '10th House (Karma)',
    11: '11th House (Labha)',
    12: '12th House (Vyaya)'
  };
  
  return houseNames[houseNumber] || `House ${houseNumber}`;
}

/**
 * Get house significance for life areas
 * 
 * @param houseNumber - The house number (1-12)
 * @returns Array of life areas governed by this house
 */
export function getHouseSignificance(houseNumber: number): string[] {
  const significances: Record<number, string[]> = {
    1: ['Personality', 'Health', 'Appearance', 'Overall Life'],
    2: ['Wealth', 'Family', 'Speech', 'Food Habits'],
    3: ['Courage', 'Siblings', 'Communication', 'Short Journeys'],
    4: ['Mother', 'Home', 'Education', 'Property'],
    5: ['Children', 'Creativity', 'Speculation', 'Romance'],
    6: ['Health', 'Service', 'Enemies', 'Daily Work'],
    7: ['Marriage', 'Partnerships', 'Business', 'Spouse'],
    8: ['Transformation', 'Occult', 'Longevity', 'Shared Resources'],
    9: ['Father', 'Higher Learning', 'Spirituality', 'Long Journeys'],
    10: ['Career', 'Reputation', 'Authority', 'Public Image'],
    11: ['Gains', 'Friends', 'Aspirations', 'Income'],
    12: ['Losses', 'Spirituality', 'Foreign Lands', 'Subconscious']
  };
  
  return significances[houseNumber] || [];
}

/**
 * Calculate houses for all planets in a chart
 * 
 * @param planets - Array of planet objects with sign information
 * @param lagnaSign - The ascendant sign name
 * @returns Array of planet positions with calculated houses
 */
export function calculatePlanetHouses(planets: Array<{
  planet: string;
  sign: string;
  degree?: number;
}>, lagnaSign: string): Array<{
  planet: string;
  sign: string;
  degree?: number;
  house: number;
  houseName: string;
  significance: string[];
}> {
  const lagnaRashi = ZODIAC_SIGN_NUMBERS[lagnaSign];
  
  if (!lagnaRashi) {
    throw new Error(`Invalid lagna sign: ${lagnaSign}`);
  }
  
  return planets.map(planet => {
    const planetRashi = ZODIAC_SIGN_NUMBERS[planet.sign];
    
    if (!planetRashi) {
      throw new Error(`Invalid planet sign: ${planet.sign}`);
    }
    
    const house = computeHouse(planetRashi, lagnaRashi);
    
    return {
      planet: planet.planet,
      sign: planet.sign,
      degree: planet.degree,
      house,
      houseName: getHouseName(house),
      significance: getHouseSignificance(house)
    };
  });
}

/**
 * Generate house calculation table in Markdown format
 * 
 * @param planetHouses - Array of planet positions with calculated houses
 * @returns Markdown table string
 */
export function generateHouseTable(planetHouses: Array<{
  planet: string;
  sign: string;
  degree?: number;
  house: number;
  houseName: string;
  significance: string[];
}>): string {
  let table = '| Planet | Sign | Degree | House from Lagna | House Name | Significance |\n';
  table += '|--------|------|--------|------------------|------------|-------------|\n';
  
  planetHouses.forEach(planet => {
    const degree = planet.degree ? `${planet.degree.toFixed(2)}°` : 'N/A';
    const significance = planet.significance.slice(0, 2).join(', '); // Show first 2 significances
    
    table += `| ${planet.planet} | ${planet.sign} | ${degree} | ${planet.house}th | ${planet.houseName} | ${significance} |\n`;
  });
  
  return table;
}

/**
 * Validate house calculation accuracy
 * 
 * @param planetHouses - Array of planet positions with calculated houses
 * @param lagnaSign - The ascendant sign name
 * @returns Validation result with any errors
 */
export function validateHouseCalculation(
  planetHouses: Array<{
    planet: string;
    sign: string;
    house: number;
  }>, 
  lagnaSign: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lagnaRashi = ZODIAC_SIGN_NUMBERS[lagnaSign];
  
  if (!lagnaRashi) {
    errors.push(`Invalid lagna sign: ${lagnaSign}`);
    return { valid: false, errors };
  }
  
  planetHouses.forEach(planet => {
    const planetRashi = ZODIAC_SIGN_NUMBERS[planet.sign];
    
    if (!planetRashi) {
      errors.push(`Invalid planet sign for ${planet.planet}: ${planet.sign}`);
      return;
    }
    
    const expectedHouse = computeHouse(planetRashi, lagnaRashi);
    
    if (planet.house !== expectedHouse) {
      errors.push(
        `${planet.planet} in ${planet.sign} should be in ${expectedHouse}th house, but got ${planet.house}th house`
      );
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
