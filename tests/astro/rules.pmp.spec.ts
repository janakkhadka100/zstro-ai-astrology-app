// tests/astro/rules.pmp.spec.ts
// Unit tests for Panch-Mahapurush Yogas

import { evaluateYogas } from '../../src/astro/rules';
import { buildAstroFactSheet } from '../../src/astro/facts';

describe('Panch-Mahapurush Yogas', () => {
  test('Shasha Yoga should only be by Saturn, not Moon', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Saturn',
          sign: 'Capricorn',
          house: 10,
          degree: 15,
          isRetro: false
        },
        {
          planet: 'Moon',
          sign: 'Cancer',
          house: 4,
          degree: 20,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    // Should have Shasha Yoga for Saturn
    const shashaYoga = yogas.panchMahapurush?.find(y => y.key === 'PMP_Shasha');
    expect(shashaYoga).toBeDefined();
    expect(shashaYoga?.planet).toBe('Saturn');
    expect(shashaYoga?.kendra).toBe(10);
    expect(shashaYoga?.dignity).toBe('Own');
    
    // Should NOT have any PMP yoga for Moon
    const moonYoga = yogas.panchMahapurush?.find(y => y.planet === 'Moon');
    expect(moonYoga).toBeUndefined();
  });
  
  test('Ruchaka Yoga should be by Mars in own/exalted Kendra', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Mars',
          sign: 'Aries',
          house: 1,
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    const ruchakaYoga = yogas.panchMahapurush?.find(y => y.key === 'PMP_Ruchaka');
    expect(ruchakaYoga).toBeDefined();
    expect(ruchakaYoga?.planet).toBe('Mars');
    expect(ruchakaYoga?.kendra).toBe(1);
    expect(ruchakaYoga?.dignity).toBe('Own');
  });
  
  test('Hamsa Yoga should be by Jupiter in exalted Kendra', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Jupiter',
          sign: 'Cancer',
          house: 4,
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    const hamsaYoga = yogas.panchMahapurush?.find(y => y.key === 'PMP_Hamsa');
    expect(hamsaYoga).toBeDefined();
    expect(hamsaYoga?.planet).toBe('Jupiter');
    expect(hamsaYoga?.kendra).toBe(4);
    expect(hamsaYoga?.dignity).toBe('Exalted');
  });
  
  test('Should not create PMP yoga for planets not in Kendra', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Saturn',
          sign: 'Capricorn',
          house: 2, // Not Kendra
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.panchMahapurush).toHaveLength(0);
  });
  
  test('Should not create PMP yoga for planets not in own/exalted dignity', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Saturn',
          sign: 'Aries', // Debilitated
          house: 10, // Kendra
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.panchMahapurush).toHaveLength(0);
  });
});
