// lib/qa/parity.spec.ts
// Parity tests for API vs UI vs LLM consistency

import { describe, it, expect } from "vitest";
import { 
  wholeSignHouse, 
  toPlanet, 
  signIdFrom, 
  isRetrograde,
  getSignLabel,
  formatPlanetRow,
  parsePlanetRow 
} from "@/lib/astrology/util";
import { normalizeD1, normalizeDivisionals, normalizeShadbala, normalizeDashas } from "@/lib/prokerala/service";
import { formatD1Rows } from "@/lib/llm/prompt";
import type { D1PlanetRow } from "@/lib/astrology/types";

describe("Planet–House Parity", () => {
  it("whole-sign mapping basic", () => {
    // asc=2 (Taurus), planet in Libra(7) => H6
    const asc = 2;
    const planetSign = 7;
    const h = wholeSignHouse(asc, planetSign);
    expect(h).toBe(6);
  });

  it("whole-sign mapping edge cases", () => {
    // Aries ascendant (1)
    expect(wholeSignHouse(1, 1)).toBe(1);  // Aries in Aries = H1
    expect(wholeSignHouse(1, 12)).toBe(12); // Pisces in Aries = H12
    expect(wholeSignHouse(1, 2)).toBe(2);   // Taurus in Aries = H2
    
    // Cancer ascendant (4)
    expect(wholeSignHouse(4, 4)).toBe(1);   // Cancer in Cancer = H1
    expect(wholeSignHouse(4, 1)).toBe(10);  // Aries in Cancer = H10
    expect(wholeSignHouse(4, 7)).toBe(4);   // Libra in Cancer = H4
  });

  it("sign ID validation", () => {
    expect(signIdFrom({ rasiId: 5 })).toBe(5);
    expect(signIdFrom({ rasi_id: 3 })).toBe(3);
    expect(signIdFrom({ longitude: 90 })).toBe(4); // 90/30 + 1 = 4
    expect(signIdFrom({ longitude: 120 })).toBe(5); // 120/30 + 1 = 5
    expect(signIdFrom({ longitude: 350 })).toBe(12); // 350/30 + 1 = 12.67 -> 12
  });

  it("planet name normalization", () => {
    expect(toPlanet("Sun")).toBe("Sun");
    expect(toPlanet("Moon")).toBe("Moon");
    expect(toPlanet({ name: "Mars" })).toBe("Mars");
    expect(toPlanet({ planet: "Jupiter" })).toBe("Jupiter");
    expect(toPlanet("Unknown")).toBe("Sun"); // fallback
  });

  it("retrograde detection", () => {
    expect(isRetrograde({ is_retrograde: true })).toBe(true);
    expect(isRetrograde({ isRetrograde: false })).toBe(false);
    expect(isRetrograde({ retro: true })).toBe(true);
    expect(isRetrograde({ isRetro: false })).toBe(false);
    expect(isRetrograde({})).toBe(false);
  });

  it("sign label generation", () => {
    expect(getSignLabel(1, "en")).toBe("Aries");
    expect(getSignLabel(12, "en")).toBe("Pisces");
    expect(getSignLabel(1, "ne")).toBe("मेष");
    expect(getSignLabel(12, "ne")).toBe("मीन");
  });
});

describe("D1 Normalization Parity", () => {
  const mockPlanets = [
    { name: "Sun", rasiId: 5, is_retrograde: false, house: 5 },
    { name: "Moon", rasiId: 4, is_retrograde: false, house: 4 },
    { name: "Mars", rasiId: 1, is_retrograde: false, house: 1 },
    { name: "Mercury", rasiId: 6, is_retrograde: true, house: 6 },
  ];

  it("normalizes D1 planets correctly", () => {
    const ascSignId = 1; // Aries
    const normalized = normalizeD1(ascSignId, mockPlanets, "en");
    
    expect(normalized).toHaveLength(4);
    expect(normalized[0]).toEqual({
      planet: "Sun",
      signId: 5,
      signLabel: "Leo",
      house: 5,
      retro: false
    });
    expect(normalized[1]).toEqual({
      planet: "Moon",
      signId: 4,
      signLabel: "Cancer",
      house: 4,
      retro: false
    });
    expect(normalized[2]).toEqual({
      planet: "Mars",
      signId: 1,
      signLabel: "Aries",
      house: 1,
      retro: false
    });
    expect(normalized[3]).toEqual({
      planet: "Mercury",
      signId: 6,
      signLabel: "Virgo",
      house: 6,
      retro: true
    });
  });

  it("handles missing house data by calculating", () => {
    const planetsWithoutHouses = [
      { name: "Sun", rasiId: 5, is_retrograde: false }, // no house
      { name: "Moon", rasiId: 4, is_retrograde: false, house: 4 },
    ];
    
    const ascSignId = 1; // Aries
    const normalized = normalizeD1(ascSignId, planetsWithoutHouses, "en");
    
    expect(normalized[0].house).toBe(5); // calculated: (5-1+12)%12+1 = 5
    expect(normalized[1].house).toBe(4); // provided
  });

  it("handles invalid planets gracefully", () => {
    const invalidPlanets = [
      { name: "Sun", rasiId: 5, is_retrograde: false, house: 5 },
      { name: "Invalid", rasiId: 15, is_retrograde: false, house: 1 }, // invalid signId
      { name: "Moon", rasiId: 4, is_retrograde: false, house: 20 }, // invalid house
    ];
    
    const ascSignId = 1;
    const normalized = normalizeD1(ascSignId, invalidPlanets, "en");
    
    // The normalization function converts invalid planets to "Sun" and corrects invalid data
    expect(normalized.length).toBe(3);
    
    // Check that all planets have valid data after normalization
    normalized.forEach(planet => {
      expect(planet.planet).toBeDefined();
      expect(planet.signId).toBeGreaterThanOrEqual(1);
      expect(planet.signId).toBeLessThanOrEqual(12);
      expect(planet.house).toBeGreaterThanOrEqual(1);
      expect(planet.house).toBeLessThanOrEqual(12);
    });
    
    // Verify specific corrections
    expect(normalized[0].planet).toBe("Sun"); // Original Sun
    expect(normalized[1].planet).toBe("Sun"); // Invalid -> Sun
    expect(normalized[1].signId).toBe(1); // 15 -> 1 (corrected)
    expect(normalized[2].planet).toBe("Moon"); // Original Moon
    expect(normalized[2].house).toBe(1); // 20 -> 1 (corrected)
  });
});

describe("Divisional Charts Parity", () => {
  const mockDivisionals = [
    {
      type: "D9",
      planets: [
        { name: "Sun", rasiId: 1, house: 1 },
        { name: "Moon", rasiId: 2, house: 2 },
      ]
    },
    {
      type: "D10",
      planets: [
        { name: "Mars", rasiId: 3, house: 3 },
        { name: "Mercury", rasiId: 4, house: 4 },
      ]
    }
  ];

  it("normalizes divisional charts correctly", () => {
    const ascSignId = 1;
    const normalized = normalizeDivisionals(ascSignId, mockDivisionals, "en");
    
    expect(normalized).toHaveLength(2);
    expect(normalized[0].type).toBe("D9");
    expect(normalized[0].planets).toHaveLength(2);
    expect(normalized[1].type).toBe("D10");
    expect(normalized[1].planets).toHaveLength(2);
  });

  it("filters unsupported chart types", () => {
    const mixedDivisionals = [
      { type: "D9", planets: [] },
      { type: "D3", planets: [] }, // unsupported
      { type: "D10", planets: [] },
      { type: "D12", planets: [] }, // unsupported
    ];
    
    const ascSignId = 1;
    const normalized = normalizeDivisionals(ascSignId, mixedDivisionals, "en");
    
    expect(normalized).toHaveLength(2);
    expect(normalized.map(d => d.type)).toEqual(["D9", "D10"]);
  });
});

describe("Shadbala Parity", () => {
  const mockShadbala = [
    { planet: "Sun", value: 1.2, unit: "rupa", components: [
      { name: "Sthana Bala", value: 0.8 },
      { name: "Dik Bala", value: 0.4 }
    ]},
    { planet: "Moon", value: 0.9, unit: "rupa" },
  ];

  it("normalizes shadbala correctly", () => {
    const normalized = normalizeShadbala(mockShadbala);
    
    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toEqual({
      planet: "Sun",
      value: 1.2,
      unit: "rupa",
      components: [
        { name: "Sthana Bala", value: 0.8 },
        { name: "Dik Bala", value: 0.4 }
      ]
    });
    expect(normalized[1]).toEqual({
      planet: "Moon",
      value: 0.9,
      unit: "rupa",
      components: []
    });
  });
});

describe("Dasha Parity", () => {
  const mockDashas = {
    vimshottari: {
      current: { planet: "Jupiter", from: "2023-01-01", to: "2039-01-01" },
      maha: [
        { planet: "Jupiter", from: "2023-01-01", to: "2039-01-01" },
        { planet: "Saturn", from: "2039-01-01", to: "2058-01-01" }
      ],
      antar: [
        { planet: "Jupiter", from: "2023-01-01", to: "2025-01-01" }
      ]
    },
    yogini: {
      current: { planet: "Sankata", from: "2023-01-01", to: "2024-01-01" },
      timeline: [
        { planet: "Sankata", from: "2023-01-01", to: "2024-01-01" }
      ]
    }
  };

  it("normalizes dashas correctly", () => {
    const normalized = normalizeDashas(mockDashas);
    
    expect(normalized.length).toBeGreaterThan(0);
    
    const vimshottariDashas = normalized.filter(d => d.system === "Vimshottari");
    const yoginiDashas = normalized.filter(d => d.system === "Yogini");
    
    expect(vimshottariDashas.length).toBeGreaterThan(0);
    expect(yoginiDashas.length).toBeGreaterThan(0);
    
    // Check current dasha
    const currentVimshottari = vimshottariDashas.find(d => d.level === "current");
    expect(currentVimshottari?.planet).toBe("Jupiter");
  });
});

describe("LLM Prompt Parity", () => {
  const mockD1Data: D1PlanetRow[] = [
    { planet: "Sun", signId: 5, signLabel: "Leo", house: 5, retro: false },
    { planet: "Moon", signId: 4, signLabel: "Cancer", house: 4, retro: false },
    { planet: "Mars", signId: 1, signLabel: "Aries", house: 1, retro: false },
    { planet: "Mercury", signId: 6, signLabel: "Virgo", house: 6, retro: true },
  ];

  it("formats D1 rows for LLM correctly", () => {
    const formatted = formatD1Rows(mockD1Data);
    const lines = formatted.split("\n");
    
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe("Sun|Leo|H5");
    expect(lines[1]).toBe("Moon|Cancer|H4");
    expect(lines[2]).toBe("Mars|Aries|H1");
    expect(lines[3]).toBe("Mercury|Virgo|H6|R");
  });

  it("planet row formatting and parsing", () => {
    const testCases = [
      { planet: "Sun" as const, signLabel: "Leo", house: 5, retro: false },
      { planet: "Mercury" as const, signLabel: "Virgo", house: 6, retro: true },
    ];
    
    testCases.forEach(testCase => {
      const formatted = formatPlanetRow(testCase.planet, testCase.signLabel, testCase.house, testCase.retro);
      const parsed = parsePlanetRow(formatted);
      
      expect(parsed).toEqual(testCase);
    });
  });
});

describe("End-to-End Data Consistency", () => {
  it("maintains consistency across normalization pipeline", () => {
    const rawData = {
      asc: { signId: 1 },
      d1: {
        planets: [
          { name: "Sun", rasiId: 5, is_retrograde: false, house: 5 },
          { name: "Moon", rasiId: 4, is_retrograde: false, house: 4 },
        ]
      }
    };
    
    const ascSignId = 1;
    const normalized = normalizeD1(ascSignId, rawData.d1.planets, "en");
    const formatted = formatD1Rows(normalized);
    
    // Verify the data flows correctly through the pipeline
    expect(normalized[0].planet).toBe("Sun");
    expect(normalized[0].signId).toBe(5);
    expect(normalized[0].house).toBe(5);
    expect(formatted).toContain("Sun|Leo|H5");
  });
});
