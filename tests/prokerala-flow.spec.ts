import { describe, it, expect } from 'vitest';
import { composeAstroData } from '../lib/cards/compose';
import { detectAll } from '../lib/astrology/detectors';
import { deriveBundle } from '../lib/astrology/derive';
import { userPrompt, systemPrompt } from '../lib/llm/prompt-core';

describe('Prokerala Flow Integration', () => {
  const mockParams = {
    dob: "1990-01-01",
    tob: "12:00:00",
    lat: 27.7172,
    lon: 85.3240,
    tz: "Asia/Kathmandu",
    pob: "Kathmandu, Nepal"
  };

  it('should compose astro data with all components', async () => {
    const data = await composeAstroData(mockParams, "en");
    
    expect(data).toBeDefined();
    expect(data.profile).toBeDefined();
    expect(data.profile?.birthDate).toBe("1990-01-01");
    expect(data.profile?.birthTime).toBe("12:00:00");
    expect(data.profile?.lat).toBe(27.7172);
    expect(data.profile?.lon).toBe(85.3240);
    expect(data.profile?.tz).toBe("Asia/Kathmandu");
    expect(data.profile?.pob).toBe("Kathmandu, Nepal");
    
    expect(data.ascSignId).toBe(1); // Aries
    expect(data.ascSignLabel).toBe("Aries");
    expect(data.d1).toHaveLength(9); // All planets
    expect(data.derived).toBeDefined();
    expect(data.derived.houses).toHaveLength(12);
    expect(data.derived.relations.length).toBeGreaterThan(0);
    expect(data.derived.strengths).toHaveLength(9);
    expect(data.yogas.length).toBeGreaterThan(0);
    expect(data.dashas.length).toBeGreaterThan(0);
    expect(data.yogini.length).toBeGreaterThan(0);
    expect(data.shadbala.length).toBeGreaterThan(0);
    expect(data.lang).toBe("en");
  });

  it('should detect yogas with WHY explanations', () => {
    const mockD1 = [
      { planet: "Sun" as const, signId: 1 as const, signLabel: "Aries", house: 1 as const, retro: false },
      { planet: "Moon" as const, signId: 1 as const, signLabel: "Aries", house: 1 as const, retro: false },
      { planet: "Mars" as const, signId: 1 as const, signLabel: "Aries", house: 1 as const, retro: false },
      { planet: "Mercury" as const, signId: 2 as const, signLabel: "Taurus", house: 2 as const, retro: false },
      { planet: "Jupiter" as const, signId: 4 as const, signLabel: "Cancer", house: 4 as const, retro: false },
      { planet: "Venus" as const, signId: 7 as const, signLabel: "Libra", house: 7 as const, retro: false },
      { planet: "Saturn" as const, signId: 10 as const, signLabel: "Capricorn", house: 10 as const, retro: false },
      { planet: "Rahu" as const, signId: 5 as const, signLabel: "Leo", house: 5 as const, retro: true },
      { planet: "Ketu" as const, signId: 11 as const, signLabel: "Aquarius", house: 11 as const, retro: true }
    ];

    const detected = detectAll(1, mockD1, "en");
    
    expect(detected.length).toBeGreaterThan(0);
    
    // Check that all detected yogas have WHY explanations
    detected.forEach(yoga => {
      expect(yoga.key).toBeDefined();
      expect(yoga.label).toBeDefined();
      expect(yoga.why).toBeDefined();
      expect(yoga.why.length).toBeGreaterThan(0);
    });
  });

  it('should generate proper system prompt', () => {
    const nepaliPrompt = systemPrompt("ne");
    const englishPrompt = systemPrompt("en");
    
    expect(nepaliPrompt).toContain("स्रोत सत्य");
    expect(nepaliPrompt).toContain("DataNeeded:");
    expect(englishPrompt).toContain("source of truth");
    expect(englishPrompt).toContain("DataNeeded:");
  });

  it('should generate user prompt with all data sections', async () => {
    const data = await composeAstroData(mockParams, "en");
    const prompt = userPrompt("en", data, "What about my career?");
    
    expect(prompt).toContain("# D1 Planets");
    expect(prompt).toContain("# House/Lord/Aspects");
    expect(prompt).toContain("# Planetary Strengths");
    expect(prompt).toContain("# Planetary Relations");
    expect(prompt).toContain("# Yogas/Doshas");
    expect(prompt).toContain("# Dashas (short)");
    expect(prompt).toContain("# Yogini");
    expect(prompt).toContain("Question:");
    expect(prompt).toContain("What about my career?");
    expect(prompt).toContain("Instructions:");
  });

  it('should generate Nepali user prompt', async () => {
    const data = await composeAstroData(mockParams, "ne");
    const prompt = userPrompt("ne", data, "मेरो करियर कस्तो छ?");
    
    expect(prompt).toContain("# D1 ग्रहहरू");
    expect(prompt).toContain("# घर/मालिक/दृष्टि");
    expect(prompt).toContain("# ग्रह बल");
    expect(prompt).toContain("# ग्रह सम्बन्ध");
    expect(prompt).toContain("# योग/दोष");
    expect(prompt).toContain("# दशा (छोटो)");
    expect(prompt).toContain("# योगिनी");
    expect(prompt).toContain("प्रश्न:");
    expect(prompt).toContain("मेरो करियर कस्तो छ?");
    expect(prompt).toContain("निर्देश:");
  });

  it('should derive house analysis correctly', async () => {
    const data = await composeAstroData(mockParams, "en");
    const houses = data.derived.houses;
    
    expect(houses).toHaveLength(12);
    
    // Check first house (Aries)
    const firstHouse = houses.find(h => h.house === 1);
    expect(firstHouse).toBeDefined();
    expect(firstHouse?.signId).toBe(1);
    expect(firstHouse?.signLabel).toBe("Aries");
    expect(firstHouse?.lord).toBe("Mars");
    expect(firstHouse?.occupants).toContain("Sun");
    expect(firstHouse?.occupants).toContain("Moon");
    expect(firstHouse?.occupants).toContain("Mars");
  });

  it('should calculate planetary strengths with dignity', async () => {
    const data = await composeAstroData(mockParams, "en");
    const strengths = data.derived.strengths;
    
    expect(strengths).toHaveLength(9); // All planets
    
    // Check that each planet has strength data
    strengths.forEach(strength => {
      expect(strength.planet).toBeDefined();
      expect(strength.dignity).toBeDefined();
      expect(['exalt', 'own', 'neutral', 'debil', 'friend', 'enemy']).toContain(strength.dignity);
    });
  });
});

