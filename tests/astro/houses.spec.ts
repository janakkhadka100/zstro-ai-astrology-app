// tests/astro/houses.spec.ts
// Unit tests for house calculations and sanity checks

import { buildAstroFactSheet } from '../../src/astro/facts';
import { isKendra, isTrikona, isDusthana, isUpachaya } from '../../src/astro/utils';

describe('House Calculations', () => {
  test('Should correctly identify Kendra houses', () => {
    expect(isKendra(1)).toBe(true);
    expect(isKendra(4)).toBe(true);
    expect(isKendra(7)).toBe(true);
    expect(isKendra(10)).toBe(true);
    expect(isKendra(2)).toBe(false);
    expect(isKendra(5)).toBe(false);
    expect(isKendra(6)).toBe(false);
    expect(isKendra(8)).toBe(false);
    expect(isKendra(9)).toBe(false);
    expect(isKendra(11)).toBe(false);
    expect(isKendra(12)).toBe(false);
  });
  
  test('Should correctly identify Trikona houses', () => {
    expect(isTrikona(1)).toBe(true);
    expect(isTrikona(5)).toBe(true);
    expect(isTrikona(9)).toBe(true);
    expect(isTrikona(2)).toBe(false);
    expect(isTrikona(3)).toBe(false);
    expect(isTrikona(4)).toBe(false);
    expect(isTrikona(6)).toBe(false);
    expect(isTrikona(7)).toBe(false);
    expect(isTrikona(8)).toBe(false);
    expect(isTrikona(10)).toBe(false);
    expect(isTrikona(11)).toBe(false);
    expect(isTrikona(12)).toBe(false);
  });
  
  test('Should correctly identify Dusthana houses', () => {
    expect(isDusthana(6)).toBe(true);
    expect(isDusthana(8)).toBe(true);
    expect(isDusthana(12)).toBe(true);
    expect(isDusthana(1)).toBe(false);
    expect(isDusthana(2)).toBe(false);
    expect(isDusthana(3)).toBe(false);
    expect(isDusthana(4)).toBe(false);
    expect(isDusthana(5)).toBe(false);
    expect(isDusthana(7)).toBe(false);
    expect(isDusthana(9)).toBe(false);
    expect(isDusthana(10)).toBe(false);
    expect(isDusthana(11)).toBe(false);
  });
  
  test('Should correctly identify Upachaya houses', () => {
    expect(isUpachaya(3)).toBe(true);
    expect(isUpachaya(6)).toBe(true);
    expect(isUpachaya(10)).toBe(true);
    expect(isUpachaya(11)).toBe(true);
    expect(isUpachaya(1)).toBe(false);
    expect(isUpachaya(2)).toBe(false);
    expect(isUpachaya(4)).toBe(false);
    expect(isUpachaya(5)).toBe(false);
    expect(isUpachaya(7)).toBe(false);
    expect(isUpachaya(8)).toBe(false);
    expect(isUpachaya(9)).toBe(false);
    expect(isUpachaya(12)).toBe(false);
  });
  
  test('Should correctly calculate house lordship from Aries lagna', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Mars',
          sign: 'Aries',
          house: 1,
          degree: 15,
          isRetro: false
        },
        {
          planet: 'Venus',
          sign: 'Taurus',
          house: 2,
          degree: 20,
          isRetro: false
        },
        {
          planet: 'Mercury',
          sign: 'Gemini',
          house: 3,
          degree: 25,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    
    // Mars should own houses 1 and 8 from Aries lagna
    const mars = facts.planets.find(p => p.planet === 'Mars');
    expect(mars?.lordOf).toContain(1);
    expect(mars?.lordOf).toContain(8);
    
    // Venus should own houses 2 and 7 from Aries lagna
    const venus = facts.planets.find(p => p.planet === 'Venus');
    expect(venus?.lordOf).toContain(2);
    expect(venus?.lordOf).toContain(7);
    
    // Mercury should own houses 3 and 6 from Aries lagna
    const mercury = facts.planets.find(p => p.planet === 'Mercury');
    expect(mercury?.lordOf).toContain(3);
    expect(mercury?.lordOf).toContain(6);
  });
  
  test('Should correctly calculate house lordship from Cancer lagna', () => {
    const mockData = {
      ascendant: { sign: 'Cancer', degree: 0, lord: 'Moon' },
      planets: [
        {
          planet: 'Moon',
          sign: 'Cancer',
          house: 1,
          degree: 15,
          isRetro: false
        },
        {
          planet: 'Sun',
          sign: 'Leo',
          house: 2,
          degree: 20,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    
    // Moon should own house 1 from Cancer lagna (Cancer is 1st house)
    const moon = facts.planets.find(p => p.planet === 'Moon');
    expect(moon?.lordOf).toContain(1);
    
    // Sun should own house 2 from Cancer lagna (Leo is 2nd house)
    const sun = facts.planets.find(p => p.planet === 'Sun');
    expect(sun?.lordOf).toContain(2);
  });
  
  test('Should handle house number validation', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Mars',
          sign: 'Aries',
          house: 15, // Invalid house number
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const mars = facts.planets.find(p => p.planet === 'Mars');
    
    // Should clamp to valid range
    expect(mars?.house).toBeGreaterThanOrEqual(1);
    expect(mars?.house).toBeLessThanOrEqual(12);
  });
  
  test('Should handle negative house numbers', () => {
    const mockData = {
      ascendant: { sign: 'Aries', degree: 0, lord: 'Mars' },
      planets: [
        {
          planet: 'Mars',
          sign: 'Aries',
          house: -5, // Invalid house number
          degree: 15,
          isRetro: false
        }
      ]
    };
    
    const facts = buildAstroFactSheet(mockData);
    const mars = facts.planets.find(p => p.planet === 'Mars');
    
    // Should clamp to valid range
    expect(mars?.house).toBeGreaterThanOrEqual(1);
    expect(mars?.house).toBeLessThanOrEqual(12);
  });
});
