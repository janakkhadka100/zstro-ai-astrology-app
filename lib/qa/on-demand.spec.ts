// lib/qa/on-demand.spec.ts
// On-demand astrology system tests

import { describe, it, expect } from "vitest";
import { mapAccountToAstroData, getAccountCard } from '@/lib/source/account';
import { fetchScopedData } from '@/lib/source/prokerala';
import { mergeAstroData, getDataCoverage, getMissingData } from '@/lib/cards/compose';
import { detectMissingData, parseDataNeededResponse, createFetchPlansFromKeys } from '@/lib/llm/missing-detector';
import { buildCombinedPrompt, extractDataNeededFromResponse, isDataNeededResponse } from '@/lib/llm/prompt-core';
import { AstroData, FetchPlan } from '@/lib/astrology/types';

describe("Account to AstroData Mapping", () => {
  it("maps account card to astro data correctly", () => {
    const account = getAccountCard("test-user");
    const astroData = mapAccountToAstroData(account, "en");
    
    expect(astroData.profile).toBeDefined();
    expect(astroData.profile?.name).toBe("Test User");
    expect(astroData.profile?.birthDate).toBe("1990-05-15");
    expect(astroData.ascSignId).toBeGreaterThan(0);
    expect(astroData.ascSignId).toBeLessThanOrEqual(12);
    expect(astroData.d1).toHaveLength(9);
    expect(astroData.yogas).toHaveLength(2);
    expect(astroData.doshas).toHaveLength(1);
    expect(astroData.shadbala).toHaveLength(3);
    expect(astroData.dashas).toHaveLength(3);
    expect(astroData.provenance?.account).toContain("d1");
    expect(astroData.provenance?.account).toContain("yogas");
    expect(astroData.provenance?.prokerala).toHaveLength(0);
  });

  it("calculates houses correctly", () => {
    const account = getAccountCard("test-user");
    const astroData = mapAccountToAstroData(account, "en");
    
    // Check that all planets have valid houses
    astroData.d1.forEach(planet => {
      expect(planet.house).toBeGreaterThanOrEqual(1);
      expect(planet.house).toBeLessThanOrEqual(12);
    });
  });

  it("handles missing account data gracefully", () => {
    const emptyAccount = {
      userId: "empty-user",
      profile: {
        name: "Empty User",
        birthDate: "1990-01-01",
        birthTime: "12:00",
        timezone: "UTC",
        latitude: 0,
        longitude: 0
      },
      cachedData: {}
    };
    
    const astroData = mapAccountToAstroData(emptyAccount, "en");
    
    expect(astroData.d1).toHaveLength(0);
    expect(astroData.yogas).toHaveLength(0);
    expect(astroData.doshas).toHaveLength(0);
    expect(astroData.shadbala).toHaveLength(0);
    expect(astroData.dashas).toHaveLength(0);
  });
});

describe("Missing Data Detection", () => {
  const mockCards: AstroData = {
    ascSignId: 1,
    ascSignLabel: "Aries",
    d1: [
      { planet: "Sun", signId: 2, signLabel: "Taurus", house: 2, retro: false }
    ],
    divisionals: [],
    yogas: [],
    doshas: [],
    shadbala: [],
    dashas: [],
    lang: "en",
    provenance: {
      account: ["d1"],
      prokerala: []
    }
  };

  it("detects missing antardasha data", () => {
    const plans = detectMissingData("अन्तरदशा टाइमलाइन?", mockCards);
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("vimshottari");
    expect(plans[0].levels).toContain("antar");
  });

  it("detects missing navamsa data", () => {
    const plans = detectMissingData("नवांशमा शुक्र कता?", mockCards);
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("divisionals");
    expect(plans[0].list).toContain("D9");
  });

  it("detects missing shadbala data", () => {
    const plans = detectMissingData("शड्बलका घटक?", mockCards);
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.some(p => p.kind === "shadbala" && p.detail === true)).toBe(true);
  });

  it("detects missing yogas data", () => {
    const plans = detectMissingData("राजयोग विवरण?", mockCards);
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("yogas");
    expect(plans[0].detail).toBe(true);
  });

  it("does not detect missing data when already present", () => {
    const cardsWithData = {
      ...mockCards,
      divisionals: [{ type: "D9", planets: [] }],
      shadbala: [{ planet: "Sun", value: 1.0 }],
      yogas: [{ key: "rajyoga", label: "Raj Yoga" }]
    };
    
    const plans = detectMissingData("नवांशमा शुक्र कता?", cardsWithData);
    expect(plans).toHaveLength(0);
  });
});

describe("Data Coverage Analysis", () => {
  it("analyzes data coverage correctly", () => {
    const cards: AstroData = {
      ascSignId: 1,
      ascSignLabel: "Aries",
      d1: [{ planet: "Sun", signId: 2, signLabel: "Taurus", house: 2, retro: false }],
      divisionals: [{ type: "D9", planets: [] }],
      yogas: [{ key: "rajyoga", label: "Raj Yoga" }],
      doshas: [],
      shadbala: [{ planet: "Sun", value: 1.0 }],
      dashas: [{ system: "Vimshottari", level: "current", planet: "Jupiter", from: "2023-01-01T00:00:00.000Z", to: "2039-01-01T00:00:00.000Z" }],
      lang: "en",
      provenance: {
        account: ["d1", "yogas"],
        prokerala: ["divisionals.D9", "shadbala"]
      }
    };
    
    const coverage = getDataCoverage(cards);
    
    expect(coverage.d1).toBe(true);
    expect(coverage.divisionals).toContain("D9");
    expect(coverage.yogas).toBe(true);
    expect(coverage.doshas).toBe(false);
    expect(coverage.shadbala).toBe(true);
    expect(coverage.dashas.vimshottari).toContain("current");
  });

  it("identifies missing data correctly", () => {
    const cards: AstroData = {
      ascSignId: 1,
      ascSignLabel: "Aries",
      d1: [],
      divisionals: [],
      yogas: [],
      doshas: [],
      shadbala: [],
      dashas: [],
      lang: "en",
      provenance: {
        account: [],
        prokerala: []
      }
    };
    
    const missing = getMissingData(cards);
    
    expect(missing).toContain("d1");
    expect(missing).toContain("divisionals");
    expect(missing).toContain("yogas");
    expect(missing).toContain("doshas");
    expect(missing).toContain("shadbala");
    expect(missing).toContain("dashas.vimshottari");
    expect(missing).toContain("dashas.yogini");
  });
});

describe("Card Composition", () => {
  it("merges astro data correctly", () => {
    const base: AstroData = {
      ascSignId: 1,
      ascSignLabel: "Aries",
      d1: [{ planet: "Sun", signId: 2, signLabel: "Taurus", house: 2, retro: false }],
      divisionals: [],
      yogas: [{ key: "rajyoga", label: "Raj Yoga" }],
      doshas: [],
      shadbala: [],
      dashas: [],
      lang: "en",
      provenance: {
        account: ["d1", "yogas"],
        prokerala: []
      }
    };
    
    const patch = {
      set: {
        divisionals: [{ type: "D9", planets: [] }],
        shadbala: [{ planet: "Sun", value: 1.0 }]
      },
      provenance: {
        prokerala: ["divisionals.D9", "shadbala"]
      }
    };
    
    const merged = mergeAstroData(base, patch);
    
    expect(merged.divisionals).toHaveLength(1);
    expect(merged.shadbala).toHaveLength(1);
    expect(merged.provenance?.account).toContain("d1");
    expect(merged.provenance?.prokerala).toContain("divisionals.D9");
    expect(merged.provenance?.prokerala).toContain("shadbala");
  });

  it("avoids duplicate data when merging", () => {
    const base: AstroData = {
      ascSignId: 1,
      ascSignLabel: "Aries",
      d1: [],
      divisionals: [],
      yogas: [{ key: "rajyoga", label: "Raj Yoga" }],
      doshas: [],
      shadbala: [],
      dashas: [],
      lang: "en",
      provenance: {
        account: ["yogas"],
        prokerala: []
      }
    };
    
    const patch = {
      set: {
        yogas: [{ key: "gajakesari", label: "Gajakesari Yoga" }]
      },
      provenance: {
        prokerala: ["yogas"]
      }
    };
    
    const merged = mergeAstroData(base, patch);
    
    expect(merged.yogas).toHaveLength(2);
    expect(merged.yogas.some(y => y.key === "rajyoga")).toBe(true);
    expect(merged.yogas.some(y => y.key === "gajakesari")).toBe(true);
  });
});

describe("Prompt System", () => {
  const mockCards: AstroData = {
    ascSignId: 1,
    ascSignLabel: "Aries",
    d1: [
      { planet: "Sun", signId: 2, signLabel: "Taurus", house: 2, retro: false },
      { planet: "Moon", signId: 4, signLabel: "Cancer", house: 4, retro: false }
    ],
    divisionals: [],
    yogas: [{ key: "rajyoga", label: "Raj Yoga" }],
    doshas: [],
    shadbala: [{ planet: "Sun", value: 1.0 }],
    dashas: [{ system: "Vimshottari", level: "current", planet: "Jupiter", from: "2023-01-01T00:00:00.000Z", to: "2039-01-01T00:00:00.000Z" }],
    lang: "en",
    provenance: {
      account: ["d1", "yogas"],
      prokerala: []
    }
  };

  it("builds system prompt correctly", () => {
    const system = buildCombinedPrompt("en", mockCards, "Test question");
    
    expect(system.system).toContain("source of truth");
    expect(system.system).toContain("DataNeeded");
    expect(system.user).toContain("Sun|Taurus|H2");
    expect(system.user).toContain("Moon|Cancer|H4");
    expect(system.user).toContain("Raj Yoga");
  });

  it("builds Nepali prompt correctly", () => {
    const nepaliCards = { ...mockCards, lang: "ne" as const };
    const system = buildCombinedPrompt("ne", nepaliCards, "परीक्षण प्रश्न");
    
    expect(system.system).toContain("स्रोत सत्य");
    expect(system.system).toContain("DataNeeded");
    expect(system.user).toContain("परीक्षण प्रश्न");
  });

  it("extracts data needed from response", () => {
    const response = "DataNeeded: divisionals.D9, shadbala.detail";
    const keys = extractDataNeededFromResponse(response);
    
    expect(keys).toContain("divisionals.D9");
    expect(keys).toContain("shadbala.detail");
  });

  it("detects data needed response", () => {
    expect(isDataNeededResponse("DataNeeded: divisionals.D9")).toBe(true);
    expect(isDataNeededResponse("This is a normal response")).toBe(false);
  });
});

describe("Fetch Plan Creation", () => {
  it("creates fetch plans from keys", () => {
    const keys = ["divisionals.D9", "dashas.vimshottari.antar", "shadbala"];
    const plans = createFetchPlansFromKeys(keys);
    
    expect(plans).toHaveLength(3);
    expect(plans.some(p => p.kind === "divisionals" && p.list?.includes("D9"))).toBe(true);
    expect(plans.some(p => p.kind === "vimshottari" && p.levels?.includes("antar"))).toBe(true);
    expect(plans.some(p => p.kind === "shadbala" && p.detail === true)).toBe(true);
  });

  it("handles invalid keys gracefully", () => {
    const keys = ["invalid.key", "divisionals.D9"];
    const plans = createFetchPlansFromKeys(keys);
    
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("divisionals");
  });
});

describe("Scoped Data Fetching", () => {
  it("fetches vimshottari data", async () => {
    const profile = {
      birthDate: "1990-05-15",
      birthTime: "14:30",
      tz: "Asia/Kathmandu",
      lat: 27.7172,
      lon: 85.3240
    };
    
    const plans: FetchPlan[] = [
      { kind: "vimshottari", levels: ["antar"] }
    ];
    
    const patch = await fetchScopedData(profile, plans, "en");
    
    expect(patch.set?.dashas).toBeDefined();
    expect(patch.set?.dashas?.length).toBeGreaterThan(0);
    expect(patch.provenance?.prokerala).toContain("dashas.vimshottari.antar");
  });

  it("fetches divisional data", async () => {
    const profile = {
      birthDate: "1990-05-15",
      birthTime: "14:30",
      tz: "Asia/Kathmandu",
      lat: 27.7172,
      lon: 85.3240
    };
    
    const plans: FetchPlan[] = [
      { kind: "divisionals", list: ["D9"] }
    ];
    
    const patch = await fetchScopedData(profile, plans, "en");
    
    expect(patch.set?.divisionals).toBeDefined();
    expect(patch.set?.divisionals?.length).toBe(1);
    expect(patch.set?.divisionals?.[0].type).toBe("D9");
    expect(patch.provenance?.prokerala).toContain("divisionals.D9");
  });

  it("fetches shadbala data", async () => {
    const profile = {
      birthDate: "1990-05-15",
      birthTime: "14:30",
      tz: "Asia/Kathmandu",
      lat: 27.7172,
      lon: 85.3240
    };
    
    const plans: FetchPlan[] = [
      { kind: "shadbala", detail: true }
    ];
    
    const patch = await fetchScopedData(profile, plans, "en");
    
    expect(patch.set?.shadbala).toBeDefined();
    expect(patch.set?.shadbala?.length).toBeGreaterThan(0);
    expect(patch.provenance?.prokerala).toContain("shadbala.detail");
  });
});

describe("End-to-End Flow", () => {
  it("processes complete on-demand flow", async () => {
    // 1. Bootstrap from account
    const account = getAccountCard("test-user");
    const initialCards = mapAccountToAstroData(account, "en");
    
    expect(initialCards.d1.length).toBeGreaterThan(0);
    expect(initialCards.provenance?.account).toContain("d1");
    
    // 2. Detect missing data
    const missingPlans = detectMissingData("नवांशमा शुक्र कता?", initialCards);
    expect(missingPlans.length).toBeGreaterThan(0);
    
    // 3. Fetch missing data
    const patch = await fetchScopedData(initialCards.profile || {}, missingPlans, "en");
    expect(patch.set).toBeDefined();
    
    // 4. Merge data
    const updatedCards = mergeAstroData(initialCards, patch);
    expect(updatedCards.divisionals.length).toBeGreaterThan(0);
    expect(updatedCards.provenance?.prokerala.length).toBeGreaterThan(0);
    
    // 5. Build prompt
    const prompt = buildCombinedPrompt("en", updatedCards, "नवांशमा शुक्र कता?");
    expect(prompt.user).toContain("D9");
  });
});
