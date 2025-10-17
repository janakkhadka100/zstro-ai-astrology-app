// lib/astrology/types.ts
// Core astrology types - single source of truth

export type PlanetName =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn"
  | "Rahu" | "Ketu";

export interface D1PlanetRow {
  planet: PlanetName;
  signId: number;           // 1..12
  signLabel: string;        // Aries..Pisces (I18n later)
  house: number;            // 1..12 (whole-sign)
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

export interface YogaItem { 
  key: string; 
  label: string; 
  factors?: string[]; 
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

export interface AstroData {
  ascSignId: number;
  ascSignLabel: string;
  d1: D1PlanetRow[];
  divisionals: DivisionalBlock[];
  yogas: YogaItem[];
  doshas: DoshaItem[];
  shadbala: ShadbalaRow[];
  dashas: DashaItem[];
  lang?: "ne" | "en";
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
