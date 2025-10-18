// lib/astrology/types.ts
// Core astrology types - single source of truth

export type PlanetName =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn"
  | "Rahu" | "Ketu";

export type Lang = "en" | "ne";

export type SignId = 1|2|3|4|5|6|7|8|9|10|11|12;

export interface D1PlanetRow {
  planet: PlanetName;
  signId: SignId;           // 1..12
  signLabel: string;        // Aries..Pisces (I18n later)
  house: 1|2|3|4|5|6|7|8|9|10|11|12;  // 1..12 (whole-sign)
  retro: boolean;
}

export interface DivisionalPlanetRow {
  planet: PlanetName;
  signId: number;
  signLabel: string;
  house: number;
}

export interface DivisionalBlock {
  type: "D2" | "D7" | "D9" | "D10";
  planets: DivisionalPlanetRow[];
}

export interface HouseRow {
  house: 1|2|3|4|5|6|7|8|9|10|11|12;
  signId: SignId;               // sign in that house
  signLabel: string;
  lord: PlanetName;             // sign lord
  occupants: PlanetName[];      // planets placed in this house
  aspectsFrom: { planet: PlanetName; kind: "7"|"mars"|"jupiter"|"saturn"; }[]; // who aspects this house
  aspectPower: number;          // simple score (sum of weights)
}

export interface RelationEdge {
  a: PlanetName; 
  b: PlanetName;
  natural: "friend"|"neutral"|"enemy";
  contextual?: "friend"|"neutral"|"enemy"; // from placement (optional)
}

export interface StrengthRow {
  planet: PlanetName;
  shadbala?: number;          // if available (0..something)
  normalized?: number;        // 0..100 scale
  dignity?: "exalt"|"own"|"mool"|"friend"|"neutral"|"enemy"|"debil";
}

export interface DerivedBundle {
  houses: HouseRow[];
  relations: RelationEdge[];
  strengths: StrengthRow[];
}

export interface YogaExplained { 
  key: string; 
  label: string; 
  why: string; 
}

export interface YogaItem { 
  key: string; 
  label: string; 
  factors?: string[];
  why?: string;
  group?: 'Rajyoga' | 'Pancha-Mahapurusha' | 'Chandra-based' | 'General';
}

export interface DoshaItem { 
  key: string; 
  label: string; 
  factors?: string[]; 
}

export interface ShadbalaComponent { 
  name: string; 
  value: number; 
  unit?: string; 
}

export interface ShadbalaRow {
  planet: PlanetName;
  value: number;
  unit?: string;
  components?: ShadbalaComponent[];
}

export interface DashaItem {
  system: "Vimshottari" | "Yogini";
  level: "maha" | "antar" | "pratyantar" | "current";
  planet: PlanetName;
  from: string; // ISO
  to: string;   // ISO
}

export interface YoginiItem {
  level: "current" | "maha";
  planet: PlanetName;
  from: string; // ISO
  to: string;   // ISO
}

export interface ShadbalaItem {
  planet: PlanetName;
  value: number;
  unit?: string;
  components?: {
    sthana: number;
    dig: number;
    kala: number;
    cheshta: number;
    naisargika: number;
    drik: number;
  };
}

export interface AstroData {
  profile?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    tz?: string;
    lat?: number;
    lon?: number;
    pob?: string;  // Place of birth
  };
  ascSignId: SignId;
  ascSignLabel: string;
  d1: D1PlanetRow[];
  derived: DerivedBundle;          // <<< new - house analysis, relations, strengths
  divisionals: DivisionalBlock[];
  yogas: (YogaExplained|YogaItem)[];
  doshas: (YogaExplained|DoshaItem)[];
  shadbala: ShadbalaRow[];
  dashas: DashaItem[];
  yogini: YoginiItem[];
  lang?: "ne" | "en";
  // Provenance tracking - which data came from where
  provenance?: {
    account: string[];    // e.g., ["d1", "yogas", "dashas.vimshottari.current"]
    prokerala: string[];  // e.g., ["divisionals.D9", "shadbala.detail"]
  };
}

// API request/response types
export interface AstroDataRequest {
  lang?: "ne" | "en";
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
}

export interface AstroAnalysisRequest {
  lang?: "ne" | "en";
  question?: string;
  q?: string;
}

export interface AstroAnalysisResponse {
  promptPreview?: string;
  text?: string;
  answer?: string;
  analysis?: string;
}

// Account-based system types
export interface AccountCard {
  userId: string;
  profile: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
  cachedData?: {
    d1?: D1PlanetRow[];
    yogas?: YogaItem[];
    doshas?: DoshaItem[];
    shadbala?: ShadbalaRow[];
    dashas?: {
      vimshottari?: {
        current?: DashaItem;
        maha?: DashaItem[];
      };
      yogini?: {
        current?: DashaItem;
      };
    };
  };
  lastUpdated?: string;
}

export interface FetchPlan {
  kind: "vimshottari" | "yogini" | "divisionals" | "shadbala" | "yogas";
  levels?: ("maha" | "antar" | "pratyantar" | "current")[];
  list?: ("D2" | "D7" | "D9" | "D10")[];
  detail?: boolean;
}

export interface AstroPatch {
  set?: Partial<AstroData>;
  provenance?: {
    prokerala: string[];
  };
}

export interface BootstrapRequest {
  lang: "ne" | "en";
}

export interface BootstrapResponse {
  success: boolean;
  data: AstroData;
  errors?: string[];
}

export interface FetchRequest {
  profile: AstroData['profile'];
  plan: FetchPlan[];
  lang: "ne" | "en";
}

export interface FetchResponse {
  success: boolean;
  patch: AstroPatch;
  errors?: string[];
}

export interface ChatRequest {
  q: string;
  lang: "ne" | "en";
  cards: AstroData;
  fetchMissing?: boolean;
}

export interface ChatResponse {
  success: boolean;
  analysis: string;
  dataNeeded?: string[];
  cardsUpdated?: boolean;
  warnings?: string[];
}
