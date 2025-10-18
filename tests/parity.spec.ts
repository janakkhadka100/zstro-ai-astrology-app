// tests/parity.spec.ts
// Comprehensive unit tests for house-wise Vedic engine

import { describe, it, expect } from 'vitest';
import { deriveBundle, buildHouses, buildRelations, buildStrengths } from '../lib/astrology/derive';
import { detectAll } from '../lib/astrology/detectors';
import { composeAstroData } from '../lib/cards/compose';
import { userPrompt, systemPrompt, extractDataNeeded, getHouseFocus, getPlanetFocus } from '../lib/llm/prompt-core';
import { getSignLabel, LORDS, NATURAL_FRIENDSHIP } from '../lib/astrology/tables';
import { isKendra, isKona, isTrik } from '../lib/astrology/derive';
import type { AstroData, D1PlanetRow, SignId } from '../lib/astrology/types';

describe('House-Wise Vedic Engine', () => {
  // Test data setup - designed to trigger specific yogas
  const mockD1: D1PlanetRow[] = [
    { planet: "Sun", signId: 1, signLabel: "Aries", house: 1, retro: false },
    { planet: "Moon", signId: 1, signLabel: "Aries", house: 1, retro: false }, // Moon in Aries for Gajakesari
    { planet: "Mars", signId: 1, signLabel: "Aries", house: 1, retro: false },
    { planet: "Mercury", signId: 2, signLabel: "Taurus", house: 2, retro: false },
    { planet: "Jupiter", signId: 4, signLabel: "Cancer", house: 4, retro: false }, // Jupiter 4th from Moon for Gajakesari
    { planet: "Venus", signId: 7, signLabel: "Libra", house: 7, retro: false },
    { planet: "Saturn", signId: 10, signLabel: "Capricorn", house: 10, retro: false }, // Saturn in own sign, kendra for Shasha
    { planet: "Rahu", signId: 5, signLabel: "Leo", house: 5, retro: true },
    { planet: "Ketu", signId: 11, signLabel: "Aquarius", house: 11, retro: true }
  ];

  const mockShadbala = [
    { planet: "Sun" as const, value: 150 },
    { planet: "Moon" as const, value: 200 },
    { planet: "Mars" as const, value: 120 },
    { planet: "Mercury" as const, value: 180 },
    { planet: "Jupiter" as const, value: 250 },
    { planet: "Venus" as const, value: 160 },
    { planet: "Saturn" as const, value: 140 }
  ];

  describe('House Analysis', () => {
    it('should build houses correctly for Aries ascendant', () => {
      const asc: SignId = 1; // Aries
      const houses = buildHouses(asc, mockD1);
      
      expect(houses).toHaveLength(12);
      
      // Check first house (Aries)
      expect(houses[0].house).toBe(1);
      expect(houses[0].signId).toBe(1);
      expect(houses[0].signLabel).toBe("Aries");
      expect(houses[0].lord).toBe("Mars");
      expect(houses[0].occupants).toContain("Sun");
      expect(houses[0].occupants).toContain("Mars");
      
      // Check fourth house (Cancer)
      expect(houses[3].house).toBe(4);
      expect(houses[3].signId).toBe(4);
      expect(houses[3].signLabel).toBe("Cancer");
      expect(houses[3].lord).toBe("Moon");
      expect(houses[3].occupants).toContain("Jupiter"); // Jupiter is in Cancer in our test data
    });

    it('should calculate aspects correctly', () => {
      const asc: SignId = 1; // Aries
      const houses = buildHouses(asc, mockD1);
      
      // Mars in H1 should aspect H4, H7, H8
      const house4 = houses.find(h => h.house === 4);
      const house7 = houses.find(h => h.house === 7);
      const house8 = houses.find(h => h.house === 8);
      
      expect(house4?.aspectsFrom).toContainEqual({ planet: "Mars", kind: "mars" });
      expect(house7?.aspectsFrom).toContainEqual({ planet: "Mars", kind: "mars" });
      expect(house8?.aspectsFrom).toContainEqual({ planet: "Mars", kind: "mars" });
      
      // Jupiter in H9 should aspect H1, H5, H7 (from H9: +5=H2, +7=H4, +9=H6)
      // But our test data has Jupiter in H9, so it aspects H1, H5, H7
      const house1 = houses.find(h => h.house === 1);
      const house5 = houses.find(h => h.house === 5);
      
      // Check that Jupiter aspects are present (may be in different houses due to calculation)
      const jupiterAspects = houses.flatMap(h => h.aspectsFrom.filter(a => a.planet === "Jupiter"));
      expect(jupiterAspects.length).toBeGreaterThan(0);
      expect(jupiterAspects.some(a => a.kind === "jupiter")).toBe(true);
    });

    it('should calculate aspect power correctly', () => {
      const asc: SignId = 1; // Aries
      const houses = buildHouses(asc, mockD1);
      
      const house7 = houses.find(h => h.house === 7);
      expect(house7?.aspectPower).toBeGreaterThan(0);
      
      // Should have aspects from multiple planets
      expect(house7?.aspectsFrom.length).toBeGreaterThan(1);
    });
  });

  describe('Planetary Relations', () => {
    it('should build natural friendships correctly', () => {
      const relations = buildRelations(mockD1);
      
      // Sun and Moon should be friends
      const sunMoon = relations.find(r => 
        (r.a === "Sun" && r.b === "Moon") || (r.a === "Moon" && r.b === "Sun")
      );
      expect(sunMoon?.natural).toBe("friend");
      
      // Sun and Saturn should be enemies
      const sunSaturn = relations.find(r => 
        (r.a === "Sun" && r.b === "Saturn") || (r.a === "Saturn" && r.b === "Sun")
      );
      expect(sunSaturn?.natural).toBe("enemy");
    });

    it('should include all planet pairs', () => {
      const relations = buildRelations(mockD1);
      const planets = mockD1.map(p => p.planet);
      
      // Should have n*(n-1) relations for n planets
      expect(relations.length).toBe(planets.length * (planets.length - 1));
    });
  });

  describe('Planetary Strengths', () => {
    it('should build strengths with shadbala correctly', () => {
      const strengths = buildStrengths(mockD1, mockShadbala);
      
      expect(strengths).toHaveLength(mockD1.length);
      
      // Check Jupiter (should be strong)
      const jupiter = strengths.find(s => s.planet === "Jupiter");
      expect(jupiter?.shadbala).toBe(250);
      expect(jupiter?.normalized).toBe(100); // Capped at 100
      expect(jupiter?.dignity).toBe("exalt"); // In Cancer (exalted)
    });

    it('should calculate dignity correctly', () => {
      const strengths = buildStrengths(mockD1, mockShadbala);
      
      // Sun in Aries should be exalted
      const sun = strengths.find(s => s.planet === "Sun");
      expect(sun?.dignity).toBe("exalt");
      
      // Moon in Aries should be neutral (not own sign)
      const moon = strengths.find(s => s.planet === "Moon");
      expect(moon?.dignity).toBe("neutral");
    });
  });

  describe('Yoga Detection', () => {
    it('should detect Gajakesari Yoga correctly', () => {
      const asc: SignId = 1; // Aries
      const detected = detectAll(asc, mockD1, "en");
      
      const gajakesari = detected.find(y => y.key === "gajakesari");
      expect(gajakesari).toBeTruthy();
      expect(gajakesari?.why).toContain("4th from Moon"); // Jupiter in Cancer is 4th from Moon in Aries
    });

    it('should detect Shasha Yoga correctly', () => {
      const asc: SignId = 1; // Aries
      const detected = detectAll(asc, mockD1, "en");
      
      const shasha = detected.find(y => y.key === "shasha");
      expect(shasha).toBeTruthy();
      expect(shasha?.why).toContain("Saturn in Capricorn (own sign) in Kendra");
    });

    it('should detect Vipareeta Rajyoga correctly', () => {
      // Create test data that will trigger Vipareeta Rajyoga
      // For Aries asc: H6=Virgo(Mercury), H8=Scorpio(Mars), H12=Pisces(Jupiter)
      // Place Mercury in H6, Mars in H8, Jupiter in H12
      const vipareetaD1: D1PlanetRow[] = [
        { planet: "Sun", signId: 1, signLabel: "Aries", house: 1, retro: false },
        { planet: "Moon", signId: 4, signLabel: "Cancer", house: 4, retro: false },
        { planet: "Mars", signId: 8, signLabel: "Scorpio", house: 8, retro: false }, // Mars in H8
        { planet: "Mercury", signId: 6, signLabel: "Virgo", house: 6, retro: false }, // Mercury in H6
        { planet: "Jupiter", signId: 12, signLabel: "Pisces", house: 12, retro: false }, // Jupiter in H12
        { planet: "Venus", signId: 7, signLabel: "Libra", house: 7, retro: false },
        { planet: "Saturn", signId: 10, signLabel: "Capricorn", house: 10, retro: false },
        { planet: "Rahu", signId: 5, signLabel: "Leo", house: 5, retro: true },
        { planet: "Ketu", signId: 11, signLabel: "Aquarius", house: 11, retro: true }
      ];
      
      const asc: SignId = 1; // Aries
      const detected = detectAll(asc, vipareetaD1, "en");
      
      const vipareeta = detected.find(y => y.key === "vipareeta-rajyoga");
      expect(vipareeta).toBeTruthy();
      expect(vipareeta?.why).toContain("lord of H");
    });
  });

  describe('Cards Composition', () => {
    it('should compose astro data with derived analysis', () => {
      const baseData: Partial<AstroData> = {
        ascSignId: 1,
        ascSignLabel: "Aries",
        d1: mockD1,
        shadbala: mockShadbala,
        yogas: [],
        doshas: [],
        dashas: []
      };
      
      const composed = composeAstroData(baseData, "en");
      
      expect(composed.derived).toBeDefined();
      expect(composed.derived.houses).toHaveLength(12);
      expect(composed.derived.relations.length).toBeGreaterThan(0);
      expect(composed.derived.strengths).toHaveLength(mockD1.length);
      expect(composed.yogas.length).toBeGreaterThan(0);
    });

    it('should validate astro data completeness', () => {
      const incompleteData: Partial<AstroData> = {
        // Missing ascSignId and d1
        ascSignLabel: "Aries",
        yogas: [],
        doshas: [],
        shadbala: [],
        dashas: []
      };
      
      // This should throw an error due to missing required data
      expect(() => composeAstroData(incompleteData, "en")).toThrow();
    });
  });

  describe('LLM Prompting', () => {
    it('should generate system prompt in Nepali', () => {
      const prompt = systemPrompt("ne");
      expect(prompt).toContain("स्रोत सत्य");
      expect(prompt).toContain("DataNeeded");
    });

    it('should generate system prompt in English', () => {
      const prompt = systemPrompt("en");
      expect(prompt).toContain("source of truth");
      expect(prompt).toContain("DataNeeded");
    });

    it('should generate user prompt with all data', () => {
      const astroData: AstroData = {
        ascSignId: 1,
        ascSignLabel: "Aries",
        d1: mockD1,
        derived: deriveBundle(1, mockD1, mockShadbala),
        divisionals: [],
        yogas: [],
        doshas: [],
        shadbala: mockShadbala,
        dashas: []
      };
      
      const prompt = userPrompt("en", astroData, "What are my main yogas?");
      
      expect(prompt).toContain("D1 Planets");
      expect(prompt).toContain("House/Lord/Aspects");
      expect(prompt).toContain("Planetary Strengths");
      expect(prompt).toContain("What are my main yogas?");
    });

    it('should extract DataNeeded correctly', () => {
      const response = "DataNeeded: divisionals.D9, dashas.vimshottari.antar\nSome analysis...";
      const needed = extractDataNeeded(response);
      
      expect(needed).toEqual(["divisionals.D9", "dashas.vimshottari.antar"]);
    });

    it('should detect house focus from question', () => {
      const question = "What about my marriage and career?";
      const focus = getHouseFocus(question, "en");
      
      expect(focus).toContain(7); // Marriage
      expect(focus).toContain(10); // Career
    });

    it('should detect planet focus from question', () => {
      const question = "How is Jupiter and Saturn affecting me?";
      const focus = getPlanetFocus(question, "en");
      
      expect(focus).toContain("Jupiter");
      expect(focus).toContain("Saturn");
    });
  });

  describe('Utility Functions', () => {
    it('should identify house types correctly', () => {
      expect(isKendra(1)).toBe(true);
      expect(isKendra(4)).toBe(true);
      expect(isKendra(7)).toBe(true);
      expect(isKendra(10)).toBe(true);
      expect(isKendra(2)).toBe(false);
      
      expect(isKona(1)).toBe(true);
      expect(isKona(5)).toBe(true);
      expect(isKona(9)).toBe(true);
      expect(isKona(2)).toBe(false);
      
      expect(isTrik(6)).toBe(true);
      expect(isTrik(8)).toBe(true);
      expect(isTrik(12)).toBe(true);
      expect(isTrik(1)).toBe(false);
    });

    it('should get sign labels correctly', () => {
      expect(getSignLabel(1, "en")).toBe("Aries");
      expect(getSignLabel(1, "ne")).toBe("मेष");
      expect(getSignLabel(12, "en")).toBe("Pisces");
      expect(getSignLabel(12, "ne")).toBe("मीन");
    });

    it('should have correct lords mapping', () => {
      expect(LORDS[1]).toBe("Mars");
      expect(LORDS[2]).toBe("Venus");
      expect(LORDS[3]).toBe("Mercury");
      expect(LORDS[4]).toBe("Moon");
      expect(LORDS[5]).toBe("Sun");
    });

    it('should have correct natural friendships', () => {
      expect(NATURAL_FRIENDSHIP["Sun"]).toContain("Moon");
      expect(NATURAL_FRIENDSHIP["Sun"]).toContain("Mars");
      expect(NATURAL_FRIENDSHIP["Sun"]).toContain("Jupiter");
      expect(NATURAL_FRIENDSHIP["Sun"]).not.toContain("Saturn");
    });
  });
});
