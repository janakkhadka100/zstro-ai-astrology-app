// lib/astro/houseCalculation.ts
// Vedic astrology house calculation helpers

export const SIGN_TO_NUM: Record<string, number> = {
  "aries": 1, "मेष": 1,
  "taurus": 2, "वृष": 2,
  "gemini": 3, "मिथुन": 3,
  "cancer": 4, "कर्कट": 4,
  "leo": 5, "सिंह": 5,
  "virgo": 6, "कन्या": 6,
  "libra": 7, "तुला": 7,
  "scorpio": 8, "वृश्चिक": 8,
  "sagittarius": 9, "धनु": 9,
  "capricorn": 10, "मकर": 10,
  "aquarius": 11, "कुम्भ": 11,
  "pisces": 12, "मीन": 12,
};

export const NUM_TO_SIGN = {
  1: { en: "Aries", ne: "मेष" },
  2: { en: "Taurus", ne: "वृष" },
  3: { en: "Gemini", ne: "मिथुन" },
  4: { en: "Cancer", ne: "कर्कट" },
  5: { en: "Leo", ne: "सिंह" },
  6: { en: "Virgo", ne: "कन्या" },
  7: { en: "Libra", ne: "तुला" },
  8: { en: "Scorpio", ne: "वृश्चिक" },
  9: { en: "Sagittarius", ne: "धनु" },
  10: { en: "Capricorn", ne: "मकर" },
  11: { en: "Aquarius", ne: "कुम्भ" },
  12: { en: "Pisces", ne: "मीन" },
};

export const NUM_TO_HOUSE = {
  1: { en: "Self/Body", ne: "लग्न/स्व" },
  2: { en: "Wealth", ne: "धन" },
  3: { en: "Courage", ne: "पराक्रम" },
  4: { en: "Home", ne: "सुख/सन्तोष" },
  5: { en: "Intellect/Children", ne: "सन्तान/बुद्धि" },
  6: { en: "Service/Enemies", ne: "रोग/ऋण/शत्रु" },
  7: { en: "Partnership", ne: "सम्बन्ध/साझेदारी" },
  8: { en: "Transformation", ne: "आयु/गोप्य" },
  9: { en: "Fortune/Dharma", ne: "भाग्य/धर्म" },
  10: { en: "Career", ne: "कर्म/प्रतिष्ठा" },
  11: { en: "Gains", ne: "लाभ/आकांक्षा" },
  12: { en: "Loss/Moksha", ne: "व्यय/मोक्ष" },
};

export function toSignNum(v: string | number): number {
  if (typeof v === "number") return v;
  const key = v.trim().toLowerCase();
  const num = SIGN_TO_NUM[key];
  if (!num) throw new Error(`Unknown sign: ${v}`);
  return num;
}

export function houseFrom(planetSignNum: number, ascSignNum: number): number {
  return ((planetSignNum - ascSignNum + 12) % 12) + 1;
}

// NEW: canonical sign lordships (Parāśara)
const LORDSHIPS: Record<string, number[]> = {
  "Sun":       [5],          // Leo
  "Moon":      [4],          // Cancer
  "Mars":      [1, 8],       // Aries, Scorpio
  "Mercury":   [3, 6],       // Gemini, Virgo
  "Jupiter":   [9, 12],      // Sagittarius, Pisces
  "Venus":     [2, 7],       // Taurus, Libra
  "Saturn":    [10, 11],     // Capricorn, Aquarius
  // Rahu/Ketu: no sign ownership in classical view
  "Rahu":      [],
  "Ketu":      []
};

export function computeLordHouses(
  planet: string,
  ascSignNum: number
): { lord_signs: number[]; lord_houses: number[] } {
  const signs = LORDSHIPS[planet] ?? [];
  const houses = signs.map(s => houseFrom(s, ascSignNum));
  return { lord_signs: signs, lord_houses: houses };
}

export type PlanetsInput = Record<string, string | number>;

export interface DashaContext {
  mahadasha?: string;
  antardasha?: string;
}

export interface HouseCalculationRequest {
  ascendant: string | number;
  planets: PlanetsInput;
  dasha?: DashaContext;
  locale?: "ne-NP" | "en";
}

export interface PlanetResult {
  planet: string;
  rashi_name: string;
  rashi_num: number;
  house_num: number;
  house_name: string;
  lord_signs: number[];        // e.g. [9,12] for Jupiter
  lord_houses: number[];       // e.g. [8,11] for Taurus lagna
  note: string;
}

export interface HouseCalculationResponse {
  ascendant: {
    name: string;
    num: number;
    label: string;
  };
  results: PlanetResult[];
  dasha_context?: {
    mahadasha?: string;
    antardasha?: string;
    time_note?: string;
  };
  summary: string;
}

export function buildAstroDerivePayload(
  ascendant: string | number,
  planets: PlanetsInput,
  dasha?: DashaContext,
  locale: "ne-NP" | "en" = "ne-NP"
): HouseCalculationRequest {
  const ascNum = toSignNum(ascendant);
  const ascName = NUM_TO_SIGN[ascNum][locale === "ne-NP" ? "ne" : "en"];

  return {
    ascendant,
    planets,
    dasha,
    locale
  };
}

// Build payload including placement + lordship
export function buildAstroDerivePayloadWithLordship(
  ascendant: string | number,
  planets: PlanetsInput,
  dasha?: DashaContext,
  locale: "ne-NP" | "en" = "ne-NP"
) {
  const ascNum = toSignNum(ascendant);
  const ascName = NUM_TO_SIGN[ascNum][locale === "ne-NP" ? "ne" : "en"];

  const results = Object.entries(planets).map(([planet, signVal]) => {
    const rashiNum = toSignNum(signVal);
    const rashiName = NUM_TO_SIGN[rashiNum][locale === "ne-NP" ? "ne" : "en"];
    const houseNum = houseFrom(rashiNum, ascNum);
    const houseName = NUM_TO_HOUSE[houseNum][locale === "ne-NP" ? "ne" : "en"];

    const { lord_signs, lord_houses } = computeLordHouses(planet, ascNum);

    return {
      planet,
      rashi_name: rashiName,
      rashi_num: rashiNum,
      house_num: houseNum,       // placement
      house_name: houseName,
      lord_signs,                // e.g. [9,12] for Jupiter
      lord_houses,               // e.g. [8,11] for Taurus lagna
      note: ""
    };
  });

  return {
    ascendant: { name: ascName, num: ascNum, label: locale === "ne-NP" ? "लग्न" : "Ascendant" },
    results,
    dasha: dasha ?? {},
    locale
  };
}

export function calculateHouses(
  ascendant: string | number,
  planets: PlanetsInput,
  locale: "ne-NP" | "en" = "ne-NP"
): Omit<HouseCalculationResponse, 'dasha_context' | 'summary'> {
  const ascNum = toSignNum(ascendant);
  const ascName = NUM_TO_SIGN[ascNum][locale === "ne-NP" ? "ne" : "en"];

  const results: PlanetResult[] = Object.entries(planets).map(([planet, signVal]) => {
    const rashiNum = toSignNum(signVal);
    const rashiName = NUM_TO_SIGN[rashiNum][locale === "ne-NP" ? "ne" : "en"];
    const houseNum = houseFrom(rashiNum, ascNum);
    const houseName = NUM_TO_HOUSE[houseNum][locale === "ne-NP" ? "ne" : "en"];
    
    const { lord_signs, lord_houses } = computeLordHouses(planet, ascNum);
    
    return {
      planet,
      rashi_name: rashiName,
      rashi_num: rashiNum,
      house_num: houseNum,
      house_name: houseName,
      lord_signs,
      lord_houses,
      note: "" // LLM will fill this
    };
  });

  return {
    ascendant: { 
      name: ascName, 
      num: ascNum, 
      label: locale === "ne-NP" ? "लग्न" : "Ascendant" 
    },
    results
  };
}
