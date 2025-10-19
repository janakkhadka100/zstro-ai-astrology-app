export type Lang = "en" | "hi" | "ne";

export type Shadbala = {
  total: number;
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number;
};

export type BAVRow = {
  planet: string;
  house: number;
  points: number;
};

export type SAVRow = {
  house: number;
  points: number;
};

export type DashaNode = {
  name: string;
  lord: string;
  start: string;
  end: string;
  level: "MAHA" | "ANTAR" | "PRATYANTAR" | "SUKSHMA" | "PRANA" | "YOGINI" | "Y_ANTAR" | "Y_PRATYANTAR" | "Y_SUKSHMA";
  children?: DashaNode[];
};

export type VargaMini = {
  id: "D9" | "D10" | "D7" | "D12" | "D20" | "D60";
  title: string;
  keyHints: string[];
  verdict?: string;
};

export type TransitHighlight = {
  date: string;
  highlights: string[];
};

export type Panchanga = {
  tithi?: string;
  vara?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
};

export type PlanetData = {
  planet: string;
  signLabel: string;
  house: number;
  degree?: number | null;
  combust?: boolean;
  retro?: boolean;
  shadbala?: Shadbala;
};

export type AstroDashboard = {
  lang: Lang;
  asc: string;
  moon: string;
  planets: PlanetData[];
  shadbala: Record<string, Shadbala> | null;
  ashtakavarga: { bav: BAVRow[]; sav: SAVRow[] } | null;
  dasha: { vimshottari: DashaNode[]; yogini: DashaNode[] | null };
  vargas: VargaMini[];
  transits?: TransitHighlight[];
  panchanga?: Panchanga;
  yogas?: { label: string; factors: string[] }[];
  doshas?: { label: string; factors: string[] }[];
};
