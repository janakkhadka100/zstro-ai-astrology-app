// tests/astro/rules.vry.spec.ts
// Unit tests for Vipareeta Rajyoga

import { evaluateYogas } from '../../src/astro/rules';
import { buildAstroFactSheet } from '../../src/astro/facts';

describe('Vipareeta Rajyoga', () => {
  test('Should detect VRY when 12th lord is in 6th house', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Jupiter', // 12th lord from Aries
          sign: 'Pisces',
          house: 6, // Dusthana house
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    const vry = yogas.vipareetaRajyoga?.find(y => y.key === 'VRY');
    expect(vry).toBeDefined();
    expect(vry?.lordOf).toBe(12);
    expect(vry?.placedIn).toBe(6);
    expect(vry?.planet).toBe('Jupiter');
    expect(vry?.note).toBe('dusthana lord in dusthana');
  });
  
  test('Should detect VRY when 8th lord is in 12th house', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Mars', // 8th lord from Aries (Scorpio is 8th house)
          sign: 'Scorpio',
          house: 12, // Dusthana house
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    const vry = yogas.vipareetaRajyoga?.find(y => y.key === 'VRY');
    expect(vry).toBeDefined();
    expect(vry?.lordOf).toBe(8);
    expect(vry?.placedIn).toBe(12);
    expect(vry?.planet).toBe('Mars');
  });
  
  test('Should detect multiple VRY when multiple dusthana lords are in dusthana', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Jupiter', // 12th lord from Aries
          sign: 'Pisces',
          house: 6, // Dusthana house
          degree: 15,
          isRetro: false
        },
        {
          planet: 'Mars', // 8th lord from Aries (Scorpio is 8th house)
          sign: 'Scorpio',
          house: 12, // Dusthana house
          degree: 20,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.vipareetaRajyoga).toHaveLength(2);
    
    const vry1 = yogas.vipareetaRajyoga?.find(y => y.lordOf === 12);
    expect(vry1).toBeDefined();
    expect(vry1?.placedIn).toBe(6);
    
    const vry2 = yogas.vipareetaRajyoga?.find(y => y.lordOf === 8);
    expect(vry2).toBeDefined();
    expect(vry2?.placedIn).toBe(12);
  });
  
  test('Should not create VRY when dusthana lord is in non-dusthana house', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Jupiter', // 12th lord from Aries
          sign: 'Pisces',
          house: 2, // Not dusthana
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.vipareetaRajyoga).toHaveLength(0);
  });
  
  test('Should not create VRY when non-dusthana lord is in dusthana house', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Venus', // 2nd lord from Aries (not dusthana)
          sign: 'Taurus',
          house: 6, // Dusthana house
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.vipareetaRajyoga).toHaveLength(0);
  });
  
  test('Should not create VRY when dusthana lord is in same dusthana house', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Jupiter', // 12th lord from Aries
          sign: 'Pisces',
          house: 12, // Same dusthana house
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const yogas = evaluateYogas(facts);
    
    expect(yogas.vipareetaRajyoga).toHaveLength(0);
  });
});
