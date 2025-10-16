// __tests__/astrology.test.ts
// Unit tests for astrology calculations

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  normalizeDeg,
  rasiIdFromLongitude,
  calculateHouseFromDegrees,
  calculateHouse,
  getHouse,
  calculateNavamsha,
  isKendra,
  isTrikona,
  signName,
} from '../lib/ai/astroCalculations';

describe('Astrology Calculations', () => {
  describe('normalizeDeg', () => {
    it('should normalize degrees within 0-360 range', () => {
      expect(normalizeDeg(0)).toBe(0);
      expect(normalizeDeg(360)).toBe(0);
      expect(normalizeDeg(720)).toBe(0);
      expect(normalizeDeg(180)).toBe(180);
      expect(normalizeDeg(-90)).toBe(270);
      expect(normalizeDeg(450)).toBe(90);
    });
  });

  describe('rasiIdFromLongitude', () => {
    it('should return correct rasi ID from longitude', () => {
      expect(rasiIdFromLongitude(0)).toBe(1);    // Aries
      expect(rasiIdFromLongitude(30)).toBe(2);   // Taurus
      expect(rasiIdFromLongitude(60)).toBe(3);   // Gemini
      expect(rasiIdFromLongitude(90)).toBe(4);   // Cancer
      expect(rasiIdFromLongitude(120)).toBe(5);  // Leo
      expect(rasiIdFromLongitude(150)).toBe(6);  // Virgo
      expect(rasiIdFromLongitude(180)).toBe(7);  // Libra
      expect(rasiIdFromLongitude(210)).toBe(8);  // Scorpio
      expect(rasiIdFromLongitude(240)).toBe(9);  // Sagittarius
      expect(rasiIdFromLongitude(270)).toBe(10); // Capricorn
      expect(rasiIdFromLongitude(300)).toBe(11); // Aquarius
      expect(rasiIdFromLongitude(330)).toBe(12); // Pisces
    });
  });

  describe('calculateHouseFromDegrees', () => {
    it('should calculate house from degrees correctly', () => {
      // Test with Aries ascendant (0 degrees)
      expect(calculateHouseFromDegrees(0, 0)).toBe(1);    // Same as ascendant
      expect(calculateHouseFromDegrees(0, 30)).toBe(2);   // 30 degrees ahead
      expect(calculateHouseFromDegrees(0, 60)).toBe(3);   // 60 degrees ahead
      expect(calculateHouseFromDegrees(0, 90)).toBe(4);   // 90 degrees ahead
      expect(calculateHouseFromDegrees(0, 180)).toBe(7);  // 180 degrees ahead
      expect(calculateHouseFromDegrees(0, 270)).toBe(10); // 270 degrees ahead
    });

    it('should handle wrap-around cases', () => {
      // Test with Cancer ascendant (90 degrees)
      expect(calculateHouseFromDegrees(90, 0)).toBe(10);   // 270 degrees behind
      expect(calculateHouseFromDegrees(90, 30)).toBe(11);  // 300 degrees behind
      expect(calculateHouseFromDegrees(90, 60)).toBe(12);  // 330 degrees behind
      expect(calculateHouseFromDegrees(90, 90)).toBe(1);   // Same as ascendant
      expect(calculateHouseFromDegrees(90, 120)).toBe(2);  // 30 degrees ahead
    });
  });

  describe('calculateHouse', () => {
    it('should calculate house from rasi IDs correctly', () => {
      // Test with Aries ascendant (rasi 1)
      expect(calculateHouse(1, 1)).toBe(1);   // Same rasi
      expect(calculateHouse(1, 2)).toBe(2);   // Next rasi
      expect(calculateHouse(1, 4)).toBe(4);   // 4th rasi
      expect(calculateHouse(1, 7)).toBe(7);   // 7th rasi
      expect(calculateHouse(1, 10)).toBe(10); // 10th rasi
      expect(calculateHouse(1, 12)).toBe(12); // 12th rasi
    });

    it('should handle wrap-around cases', () => {
      // Test with Cancer ascendant (rasi 4)
      expect(calculateHouse(4, 1)).toBe(10);  // 9th from 4
      expect(calculateHouse(4, 2)).toBe(11);  // 10th from 4
      expect(calculateHouse(4, 3)).toBe(12);  // 11th from 4
      expect(calculateHouse(4, 4)).toBe(1);   // Same rasi
      expect(calculateHouse(4, 5)).toBe(2);   // Next rasi
    });
  });

  describe('getHouse', () => {
    it('should use degree-based calculation when available', () => {
      const result = getHouse(0, 30, 1, 2);
      expect(result).toBe(2);
    });

    it('should fallback to rasi-based calculation when degrees unavailable', () => {
      const result = getHouse(null, null, 1, 2);
      expect(result).toBe(2);
    });
  });

  describe('calculateNavamsha', () => {
    it('should calculate navamsha correctly for Aries', () => {
      const result = calculateNavamsha(0);
      expect(result.sign).toBe('Mesha');
      expect(result.pada).toBe(1);
      expect(result.signId).toBe(1);
    });

    it('should calculate navamsha correctly for Taurus', () => {
      const result = calculateNavamsha(30);
      expect(result.sign).toBe('Vrishabha');
      expect(result.pada).toBe(1);
      expect(result.signId).toBe(2);
    });

    it('should handle different padas correctly', () => {
      const result1 = calculateNavamsha(0);
      const result2 = calculateNavamsha(3.33);
      const result3 = calculateNavamsha(6.66);
      
      expect(result1.pada).toBe(1);
      expect(result2.pada).toBe(2);
      expect(result3.pada).toBe(3);
    });
  });

  describe('isKendra', () => {
    it('should identify kendra houses correctly', () => {
      expect(isKendra(1)).toBe(true);
      expect(isKendra(4)).toBe(true);
      expect(isKendra(7)).toBe(true);
      expect(isKendra(10)).toBe(true);
      expect(isKendra(2)).toBe(false);
      expect(isKendra(5)).toBe(false);
      expect(isKendra(8)).toBe(false);
      expect(isKendra(11)).toBe(false);
    });
  });

  describe('isTrikona', () => {
    it('should identify trikona houses correctly', () => {
      expect(isTrikona(1)).toBe(true);
      expect(isTrikona(5)).toBe(true);
      expect(isTrikona(9)).toBe(true);
      expect(isTrikona(2)).toBe(false);
      expect(isTrikona(4)).toBe(false);
      expect(isTrikona(7)).toBe(false);
      expect(isTrikona(10)).toBe(false);
    });
  });

  describe('signName', () => {
    it('should return correct sign names', () => {
      expect(signName(1)).toBe('Mesha');
      expect(signName(2)).toBe('Vrishabha');
      expect(signName(3)).toBe('Mithuna');
      expect(signName(4)).toBe('Karka');
      expect(signName(5)).toBe('Simha');
      expect(signName(6)).toBe('Kanya');
      expect(signName(7)).toBe('Tula');
      expect(signName(8)).toBe('Vrischika');
      expect(signName(9)).toBe('Dhanu');
      expect(signName(10)).toBe('Makara');
      expect(signName(11)).toBe('Kumbha');
      expect(signName(12)).toBe('Meena');
    });

    it('should handle wrap-around cases', () => {
      expect(signName(13)).toBe('Mesha');
      expect(signName(0)).toBe('Meena');
      expect(signName(-1)).toBe('Kumbha');
    });
  });
});
