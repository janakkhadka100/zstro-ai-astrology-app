// lib/qa/yoga-detectors.spec.ts
// Regression tests for yoga detection accuracy

import { describe, it, expect } from 'vitest';
import { 
  detectGajakesari, 
  detectShasha, 
  detectVipareetaRajyoga, 
  detectBudhaAditya,
  detectHamsa,
  detectAll 
} from '@/lib/astrology/detectors';

describe('Yoga Detectors', () => {
  describe('Gajakesari Yoga', () => {
    it('should detect Gajakesari: Moon in Capricorn, Jupiter in Libra → rel=10th', () => {
      const d1 = [
        { planet: "Moon", signId: 10, house: 10 }, // Capricorn
        { planet: "Jupiter", signId: 7, house: 7 }, // Libra
      ];
      const gk = detectGajakesari(d1, "en");
      expect(gk).toBeTruthy();
      expect(gk?.key).toBe("gajakesari");
      expect(gk?.why).toContain("10th");
      expect(gk?.group).toBe("Chandra-based");
    });

    it('should detect Gajakesari: Moon in Aries, Jupiter in Cancer → rel=4th', () => {
      const d1 = [
        { planet: "Moon", signId: 1, house: 1 }, // Aries
        { planet: "Jupiter", signId: 4, house: 4 }, // Cancer
      ];
      const gk = detectGajakesari(d1, "en");
      expect(gk).toBeTruthy();
      expect(gk?.why).toContain("4th");
    });

    it('should not detect Gajakesari: Moon in Aries, Jupiter in Gemini → rel=3rd (not kendra)', () => {
      const d1 = [
        { planet: "Moon", signId: 1, house: 1 }, // Aries
        { planet: "Jupiter", signId: 3, house: 3 }, // Gemini
      ];
      const gk = detectGajakesari(d1, "en");
      expect(gk).toBeNull();
    });

    it('should return null if Moon or Jupiter missing', () => {
      const d1 = [
        { planet: "Sun", signId: 1, house: 1 },
        { planet: "Moon", signId: 1, house: 1 },
      ];
      const gk = detectGajakesari(d1, "en");
      expect(gk).toBeNull();
    });
  });

  describe('Shasha Yoga (Pancha Mahapurusha)', () => {
    it('should detect Shasha: Taurus asc, Saturn in Aquarius (H10) → Pancha Mahapurusha', () => {
      const asc = 2; // Taurus
      const d1 = [{ planet: "Saturn", signId: 11, house: 10 }]; // Aquarius in H10
      const sh = detectShasha(asc, d1, "en");
      expect(sh).toBeTruthy();
      expect(sh?.key).toBe("shasha");
      expect(sh?.why).toContain("Aquarius");
      expect(sh?.why).toContain("H10");
      expect(sh?.group).toBe("Pancha-Mahapurusha");
    });

    it('should detect Shasha: Leo asc, Saturn in Capricorn (H10) → own sign', () => {
      const asc = 5; // Leo
      const d1 = [{ planet: "Saturn", signId: 10, house: 10 }]; // Capricorn in H10 (kendra)
      const sh = detectShasha(asc, d1, "en");
      expect(sh).toBeTruthy();
      expect(sh?.why).toContain("own sign");
    });

    it('should detect Shasha: Libra asc, Saturn in Libra (H1) → exalted', () => {
      const asc = 7; // Libra
      const d1 = [{ planet: "Saturn", signId: 7, house: 1 }]; // Libra in H1
      const sh = detectShasha(asc, d1, "en");
      expect(sh).toBeTruthy();
      expect(sh?.why).toContain("exalted");
    });

    it('should not detect Shasha: Saturn in non-kendra house', () => {
      const asc = 2; // Taurus
      const d1 = [{ planet: "Saturn", signId: 11, house: 11 }]; // Aquarius in H11
      const sh = detectShasha(asc, d1, "en");
      expect(sh).toBeNull();
    });
  });

  describe('Vipareeta Rajyoga', () => {
    it('should detect Vipareeta Rajyoga: 12th lord Mars placed in 8th', () => {
      const asc = 2; // Taurus ⇒ H12 = Aries (lord Mars)
      const d1 = [{ planet: "Mars", signId: 8, house: 8 }]; // Mars in H8
      const vr = detectVipareetaRajyoga(asc, d1, "en");
      expect(vr).toBeTruthy();
      expect(vr?.key).toBe("vipareeta-rajyoga");
      expect(vr?.why).toContain("Mars (lord of H12th) placed in H8th");
      expect(vr?.group).toBe("Rajyoga");
    });

    it('should detect Vipareeta Rajyoga: 6th lord Mercury placed in 12th', () => {
      const asc = 1; // Aries ⇒ H6 = Virgo (lord Mercury)
      const d1 = [{ planet: "Mercury", signId: 6, house: 12 }]; // Mercury in H12
      const vr = detectVipareetaRajyoga(asc, d1, "en");
      expect(vr).toBeTruthy();
      expect(vr?.why).toContain("Mercury (lord of H6th) placed in H12th");
    });

    it('should detect multiple Vipareeta Rajyogas', () => {
      const asc = 2; // Taurus ⇒ H6=Libra(Venus), H8=Sagittarius(Jupiter), H12=Aries(Mars)
      const d1 = [
        { planet: "Venus", signId: 7, house: 6 }, // Venus (lord of H6) in H6
        { planet: "Mars", signId: 1, house: 12 }, // Mars (lord of H12) in H12
      ];
      const vr = detectVipareetaRajyoga(asc, d1, "en");
      expect(vr).toBeTruthy();
      // Check that both yogas are detected (order may vary)
      expect(vr?.why).toContain("Venus (lord of H6th) placed in H6th");
      expect(vr?.why).toContain("Mars (lord of H12th) placed in H12th");
    });
  });

  describe('Budha-Aditya Yoga', () => {
    it('should detect Budha-Aditya: Mercury and Sun in same sign', () => {
      const d1 = [
        { planet: "Mercury", signId: 2, house: 2 }, // Taurus
        { planet: "Sun", signId: 2, house: 2 }, // Taurus
      ];
      const ba = detectBudhaAditya(d1, "en");
      expect(ba).toBeTruthy();
      expect(ba?.key).toBe("budha-aditya");
      expect(ba?.why).toContain("Taurus");
      expect(ba?.group).toBe("General");
    });

    it('should not detect Budha-Aditya: Mercury and Sun in different signs', () => {
      const d1 = [
        { planet: "Mercury", signId: 2, house: 2 }, // Taurus
        { planet: "Sun", signId: 3, house: 3 }, // Gemini
      ];
      const ba = detectBudhaAditya(d1, "en");
      expect(ba).toBeNull();
    });
  });

  describe('Hamsa Yoga (Pancha Mahapurusha)', () => {
    it('should detect Hamsa: Jupiter in Kendra, own sign', () => {
      const asc = 1; // Aries
      const d1 = [{ planet: "Jupiter", signId: 9, house: 1 }]; // Sagittarius in H1
      const h = detectHamsa(asc, d1, "en");
      expect(h).toBeTruthy();
      expect(h?.key).toBe("hamsa");
      expect(h?.why).toContain("Sagittarius");
      expect(h?.why).toContain("own sign");
      expect(h?.group).toBe("Pancha-Mahapurusha");
    });

    it('should detect Hamsa: Jupiter in Kendra, exalted', () => {
      const asc = 1; // Aries
      const d1 = [{ planet: "Jupiter", signId: 5, house: 1 }]; // Leo in H1
      const h = detectHamsa(asc, d1, "en");
      expect(h).toBeTruthy();
      expect(h?.why).toContain("exalted");
    });
  });

  describe('detectAll integration', () => {
    it('should detect multiple yogas in a complete chart', () => {
      const asc = 2; // Taurus
      const d1 = [
        { planet: "Sun", signId: 2, house: 2 },
        { planet: "Moon", signId: 10, house: 10 }, // Capricorn
        { planet: "Mars", signId: 1, house: 12 }, // Aries in H12
        { planet: "Mercury", signId: 2, house: 2 }, // Same as Sun
        { planet: "Jupiter", signId: 7, house: 7 }, // Libra
        { planet: "Venus", signId: 3, house: 3 },
        { planet: "Saturn", signId: 11, house: 10 }, // Aquarius in H10
      ];
      
      const yogas = detectAll(asc, d1, "en");
      expect(yogas.length).toBeGreaterThan(0);
      
      const keys = yogas.map(y => y.key);
      expect(keys).toContain("gajakesari"); // Moon-Jupiter kendra
      expect(keys).toContain("budha-aditya"); // Mercury-Sun same sign
      expect(keys).toContain("shasha"); // Saturn in kendra, own/exalt
      expect(keys).toContain("vipareeta-rajyoga"); // 12th lord Mars in 12th
    });
  });

  describe('Nepali language support', () => {
    it('should return Nepali labels and explanations', () => {
      const d1 = [
        { planet: "Moon", signId: 10, house: 10 }, // Capricorn
        { planet: "Jupiter", signId: 7, house: 7 }, // Libra
      ];
      const gk = detectGajakesari(d1, "ne");
      expect(gk).toBeTruthy();
      expect(gk?.why).toContain("10द"); // Nepali house indicator
    });
  });
});
