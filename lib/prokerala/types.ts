// lib/prokerala/types.ts

/* ========= User Query ========= */
export interface UserQuery {
  /** Optional display name of the querent */
  name?: string | null;
  /** Reported gender (if relevant to interpretation texts) */
  gender?: "male" | "female" | "other" | null;
  /** Birth date in ISO (YYYY-MM-DD) */
  birthDate: string;
  /** Birth time in 24h format (HH:mm or HH:mm:ss) */
  birthTime: string;
  /** Human-readable birthplace (city, country). If omitted, lat/lon must be provided. */
  birthPlace: string;
  /** IANA timezone like "Asia/Kathmandu" (optional if backend resolves from place) */
  timezone?: string | null;
  /** Free-form user question for the reading */
  question?: string | null;
  /** UI-preferred language code, e.g. "ne" | "en" */
  language?: string | null;
  /** Optional coordinates when user supplies them directly */
  lat?: number | null;
  lon?: number | null;
}

/* ========= Coordinates ========= */
export interface Coordinates {
  lat: number;
  lon: number;
}

/* ========= Planetary / Chart Data ========= */
export interface PlanetPosition {
  planet: string;          // e.g., "Sun", "Moon", "Mars"
  house: number;           // 1..12
  sign: string;            // e.g., "Aries", "Taurus"
  rasiId: number;          // 1..12 (sign id)
  isRetrograde?: boolean;  // true if retrograde
}

/** Some Prokerala responses use a slightly different shape; keep it liberal. */
export interface ProkeralaPlanet {
  planet: string;          // canonical planet name
  sign?: string;
  house?: number | null;
  rasiId?: number | null;
  degree?: number | null;
  isRetrograde?: boolean;
}

export type DignityStatus =
  | "Exalted"
  | "Debilitated"
  | "Own"
  | "Mooltrikona"
  | string;

export interface DignityItem {
  planet: string;          // e.g., "Saturn"
  status: DignityStatus;   // normalized or raw string
}

export interface AspectItem {
  fromPlanet: string;      // source planet
  toPlanetOrHouse: string; // target planet name or "H<1-12>"
  type?: string;           // e.g., "graha", "rashi", custom flag
}

/* ========= Tithi / Panchang (lightweight) ========= */
export interface ProkeralaTithi {
  name: string;            // e.g., "Pratipada"
  number?: number | null;  // 1..30 (optional)
  paksha?: "Shukla" | "Krishna" | string | null;
}

/* ========= Vimshottari Dasha ========= */
export interface VimshottariLevel {
  planet: string;          // dasha lord
  start: string;           // ISO timestamp/date
  end: string;             // ISO timestamp/date
}

export interface VimshottariDasha {
  current?: VimshottariLevel;
  timelineMaha?: VimshottariLevel[];
  timelineAntar?: VimshottariLevel[];
}

/* ========= Yogini Dasha (lightweight) ========= */
export interface YoginiDashaLevel {
  planet: string;
  start: string;
  end: string;
}

export interface YoginiDasha {
  current?: YoginiDashaLevel;
  timeline?: YoginiDashaLevel[];
}

/* ========= Shadbala (lightweight) ========= */
export interface ShadbalaItem {
  planet: string;
  value: number;           // total shadbala (unit-agnostic)
  unit?: string;           // e.g., "Rupa", "Virupa"
  components?: Record<string, number>; // optional breakdown
}

/* ========= Divisional Charts ========= */
export interface DivisionalPlanet {
  planet: string;
  sign: string;
  house?: number | null;
}

export interface DivisionalChart {
  /** e.g., "D9", "D10", "D7", "D2" */
  type: string;
  planets: DivisionalPlanet[];
}

/* ========= Yogas & Doshas ========= */
export interface YogaItem {
  key: string;             // stable programmatic key
  label: string;           // human-readable name
  factors: string[];       // brief reasons/clauses
  strengthHint?: string;   // optional qualitative strength
}

export interface DoshaItem {
  key: string;
  label: string;
  factors: string[];
  severity?: string;       // e.g., "mild" | "moderate" | "severe"
}

/* ========= Main AstrologyData ========= */
export interface AstrologyData {
  zodiacSign: string;
  ascendantSign?: string;  // optional if backend provides it
  planetPositions: PlanetPosition[];
  dignities?: DignityItem[];
  aspects?: AspectItem[];
  yogas?: YogaItem[];
  doshas?: DoshaItem[];
  vimshottari?: VimshottariDasha | null;
  divisionals?: DivisionalChart[] | null;
  // Optional extras if you pass through provider fields:
  tithi?: ProkeralaTithi | null;
  yogini?: YoginiDasha | null;
  shadbala?: ShadbalaItem[] | null;
}
