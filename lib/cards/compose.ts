// lib/cards/compose.ts
// Compose AstroData from normalized Prokerala data + derived analysis + detected yogas

import { AstroData, D1PlanetRow, YogaExplained, YogaItem, DoshaItem, SignId, ShadbalaItem, DashaItem, YoginiItem } from '@/lib/astrology/types';
import { deriveBundle } from '@/lib/astrology/derive';
import { detectAll } from '@/lib/astrology/detectors';
import { getSignLabel } from '@/lib/astrology/tables';
import { dedupByKey } from '@/lib/astrology/util';

const USE_MOCK = !process.env.PROKERALA_API_KEY;

export interface ProkeralaParams {
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM:SS
  lat: number;
  lon: number;
  tz: string;
  pob?: string;
}

export interface ProkeralaData {
  birth: {
    ascSignId: SignId;
    ascSignLabel: string;
    birthDetails: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };
  };
  d1: D1PlanetRow[];
  dashas: DashaItem[];
  yogini: YoginiItem[];
  shadbala: ShadbalaItem[];
}

export async function composeAstroData(
  params: ProkeralaParams,
  lang: "ne" | "en" = "ne"
): Promise<AstroData> {
  if (USE_MOCK) {
    console.log('Using mock data (PROKERALA_API_KEY not set)');
    // Build minimal cards from params + mock D1 so UI renders
    return buildMockAstroData(params, lang);
  }
  
  // Real Prokerala integration would go here
  // For now, fall back to mock
  return buildMockAstroData(params, lang);
}

export function buildMockAstroData(params: ProkeralaParams, lang: "ne" | "en"): AstroData {
  // Mock data for testing
  const mockData: ProkeralaData = {
    birth: {
      ascSignId: 1, // Aries
      ascSignLabel: getSignLabel(1, lang),
      birthDetails: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        second: 0
      }
    },
    d1: [
      { planet: "Sun", signId: 1, signLabel: getSignLabel(1, lang), house: 1, retro: false },
      { planet: "Moon", signId: 1, signLabel: getSignLabel(1, lang), house: 1, retro: false },
      { planet: "Mars", signId: 1, signLabel: getSignLabel(1, lang), house: 1, retro: false },
      { planet: "Mercury", signId: 2, signLabel: getSignLabel(2, lang), house: 2, retro: false },
      { planet: "Jupiter", signId: 4, signLabel: getSignLabel(4, lang), house: 4, retro: false },
      { planet: "Venus", signId: 7, signLabel: getSignLabel(7, lang), house: 7, retro: false },
      { planet: "Saturn", signId: 10, signLabel: getSignLabel(10, lang), house: 10, retro: false },
      { planet: "Rahu", signId: 5, signLabel: getSignLabel(5, lang), house: 5, retro: true },
      { planet: "Ketu", signId: 11, signLabel: getSignLabel(11, lang), house: 11, retro: true }
    ],
    dashas: [
      { system: "Vimshottari", level: "maha", planet: "Sun", from: "2020-01-01", to: "2026-01-01" },
      { system: "Vimshottari", level: "antar", planet: "Moon", from: "2020-01-01", to: "2021-01-01" },
      { system: "Vimshottari", level: "current", planet: "Mars", from: "2020-01-01", to: "2020-06-01" }
    ],
    yogini: [
      { level: "current", planet: "Sun", from: "2020-01-01", to: "2020-06-01" },
      { level: "maha", planet: "Moon", from: "2020-01-01", to: "2021-01-01" }
    ],
    shadbala: [
      { planet: "Sun", value: 150, unit: "points" },
      { planet: "Moon", value: 200, unit: "points" },
      { planet: "Mars", value: 120, unit: "points" },
      { planet: "Mercury", value: 180, unit: "points" },
      { planet: "Jupiter", value: 250, unit: "points" },
      { planet: "Venus", value: 170, unit: "points" },
      { planet: "Saturn", value: 190, unit: "points" },
      { planet: "Rahu", value: 100, unit: "points" },
      { planet: "Ketu", value: 100, unit: "points" }
    ]
  };

  const { birth, d1, dashas, yogini, shadbala } = mockData;
  const ascSignId = birth.ascSignId;

  // Derive additional data
  const derived = deriveBundle(ascSignId, d1, shadbala);

  // Detect additional yogas
  const detectedYogas = detectAll(ascSignId, d1, lang);
  const existingYogas: (YogaExplained | YogaItem)[] = [];
  const allYogas = dedupByKey([...existingYogas, ...detectedYogas]);
  
  // Construct the final AstroData object
  const astroData: AstroData = {
    profile: {
      name: "Test User",
      birthDate: params.dob,
      birthTime: params.tob,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      pob: params.pob
    },
    ascSignId: ascSignId,
    ascSignLabel: birth.ascSignLabel,
    d1: d1,
    derived: derived,
    divisionals: [],
    yogas: allYogas,
    doshas: [],
    shadbala: shadbala,
    dashas: dashas,
    yogini: yogini,
    lang: lang,
    provenance: {
      account: ["d1", "yogas", "dashas", "yogini", "shadbala"],
      prokerala: []
    }
  };

  return astroData;
}

// Helper to get data coverage (can be moved to a separate utility if needed)
export function getDataCoverage(data: AstroData): string[] {
  const coverage: string[] = [];
  if (data.profile?.birthDate) coverage.push("profile.birthDate");
  if (data.d1?.length > 0) coverage.push("d1");
  if (data.derived?.houses?.length > 0) coverage.push("derived.houses");
  if (data.derived?.relations?.length > 0) coverage.push("derived.relations");
  if (data.derived?.strengths?.length > 0) coverage.push("derived.strengths");
  if (data.yogas?.length > 0) coverage.push("yogas");
  if (data.doshas?.length > 0) coverage.push("doshas");
  if (data.shadbala?.length > 0) coverage.push("shadbala");
  if (data.dashas?.length > 0) coverage.push("dashas");
  if (data.yogini?.length > 0) coverage.push("yogini");
  if (data.divisionals?.length > 0) coverage.push("divisionals");
  return coverage;
}