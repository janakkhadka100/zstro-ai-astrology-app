// tests/astro/house-calculator.spec.ts
// Unit tests for house calculation system

import { 
  computeHouse, 
  computeHouseFromSigns, 
  calculatePlanetHouses, 
  validateHouseCalculation,
  getHouseName,
  getHouseSignificance,
  generateHouseTable
} from '../../src/astro/house-calculator';

describe('House Calculator', () => {
  test('should compute house correctly for basic cases', () => {
    // Lagna = Aries (1), Planet = Leo (5) -> 5th house
    expect(computeHouse(5, 1)).toBe(5);
    
    // Lagna = Taurus (2), Planet = Scorpio (8) -> 7th house
    expect(computeHouse(8, 2)).toBe(7);
    
    // Lagna = Cancer (4), Planet = Aries (1) -> 10th house
    expect(computeHouse(1, 4)).toBe(10);
    
    // Lagna = Pisces (12), Planet = Aries (1) -> 2nd house
    expect(computeHouse(1, 12)).toBe(2);
  });
  
  test('should compute house using sign names', () => {
    expect(computeHouseFromSigns('Leo', 'Aries')).toBe(5);
    expect(computeHouseFromSigns('Scorpio', 'Taurus')).toBe(7);
    expect(computeHouseFromSigns('Aries', 'Cancer')).toBe(10);
    expect(computeHouseFromSigns('Aries', 'Pisces')).toBe(2);
  });
  
  test('should handle edge cases correctly', () => {
    // Same sign as lagna -> 1st house
    expect(computeHouse(5, 5)).toBe(1);
    
    // Lagna = Aries (1), Planet = Pisces (12) -> 12th house
    expect(computeHouse(12, 1)).toBe(12);
    
    // Lagna = Pisces (12), Planet = Pisces (12) -> 1st house
    expect(computeHouse(12, 12)).toBe(1);
  });
  
  test('should calculate houses for all planets', () => {
    const planets = [
      { planet: 'Sun', sign: 'Leo', degree: 15.5 },
      { planet: 'Moon', sign: 'Cancer', degree: 8.2 },
      { planet: 'Mars', sign: 'Aries', degree: 22.1 }
    ];
    
    const result = calculatePlanetHouses(planets, 'Aries');
    
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      planet: 'Sun',
      sign: 'Leo',
      degree: 15.5,
      house: 5,
      houseName: '5th House (Putra)',
      significance: ['Children', 'Creativity', 'Speculation', 'Romance']
    });
    expect(result[1]).toEqual({
      planet: 'Moon',
      sign: 'Cancer',
      degree: 8.2,
      house: 4,
      houseName: '4th House (Sukha)',
      significance: ['Mother', 'Home', 'Education', 'Property']
    });
    expect(result[2]).toEqual({
      planet: 'Mars',
      sign: 'Aries',
      degree: 22.1,
      house: 1,
      houseName: '1st House (Lagna)',
      significance: ['Personality', 'Health', 'Appearance', 'Overall Life']
    });
  });
  
  test('should validate house calculations correctly', () => {
    const planetHouses = [
      { planet: 'Sun', sign: 'Leo', house: 5 },
      { planet: 'Moon', sign: 'Cancer', house: 4 }
    ];
    
    const validation = validateHouseCalculation(planetHouses, 'Aries');
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
  
  test('should detect incorrect house calculations', () => {
    const planetHouses = [
      { planet: 'Sun', sign: 'Leo', house: 6 }, // Should be 5th house
      { planet: 'Moon', sign: 'Cancer', house: 4 } // Correct
    ];
    
    const validation = validateHouseCalculation(planetHouses, 'Aries');
    expect(validation.valid).toBe(false);
    expect(validation.errors).toHaveLength(1);
    expect(validation.errors[0]).toContain('Sun in Leo should be in 5th house');
  });
  
  test('should get correct house names', () => {
    expect(getHouseName(1)).toBe('1st House (Lagna)');
    expect(getHouseName(7)).toBe('7th House (Kalatra)');
    expect(getHouseName(10)).toBe('10th House (Karma)');
    expect(getHouseName(12)).toBe('12th House (Vyaya)');
  });
  
  test('should get correct house significances', () => {
    const significances = getHouseSignificance(7);
    expect(significances).toContain('Marriage');
    expect(significances).toContain('Partnerships');
    expect(significances).toContain('Spouse');
    
    const careerSignificances = getHouseSignificance(10);
    expect(careerSignificances).toContain('Career');
    expect(careerSignificances).toContain('Reputation');
    expect(careerSignificances).toContain('Authority');
  });
  
  test('should generate house table in markdown format', () => {
    const planetHouses = [
      {
        planet: 'Sun',
        sign: 'Leo',
        degree: 15.5,
        house: 5,
        houseName: '5th House (Putra)',
        significance: ['Children', 'Creativity', 'Speculation', 'Romance']
      },
      {
        planet: 'Moon',
        sign: 'Cancer',
        degree: 8.2,
        house: 4,
        houseName: '4th House (Sukha)',
        significance: ['Mother', 'Home', 'Education', 'Property']
      }
    ];
    
    const table = generateHouseTable(planetHouses);
    
    expect(table).toContain('| Planet | Sign | Degree | House from Lagna | House Name | Significance |');
    expect(table).toContain('| Sun | Leo | 15.50° | 5th | 5th House (Putra) | Children, Creativity |');
    expect(table).toContain('| Moon | Cancer | 8.20° | 4th | 4th House (Sukha) | Mother, Home |');
  });
  
  test('should handle missing degree gracefully', () => {
    const planetHouses = [
      {
        planet: 'Sun',
        sign: 'Leo',
        degree: undefined,
        house: 5,
        houseName: '5th House (Putra)',
        significance: ['Children', 'Creativity']
      }
    ];
    
    const table = generateHouseTable(planetHouses);
    expect(table).toContain('| Sun | Leo | N/A | 5th | 5th House (Putra) | Children, Creativity |');
  });
  
  test('should throw error for invalid sign names', () => {
    expect(() => computeHouseFromSigns('InvalidSign', 'Aries')).toThrow('Invalid sign names');
    expect(() => computeHouseFromSigns('Leo', 'InvalidSign')).toThrow('Invalid sign names');
  });
});
