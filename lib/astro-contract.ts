export type Lang = "ne"|"hi"|"en";

export type PlanetRow = { 
  planet: string; 
  signLabel: string; 
  house: number; 
  degree?: number | null;
  safeHouse?: number;
};

export type DashaNode = { 
  name: string; 
  lord: string; 
  start: string; 
  end: string; 
  level: "MAHA"|"ANTAR"|"PRATYANTAR"|"SUKSHMA"|"PRANA"|"YOGINI"|"Y_ANTAR"|"Y_PRATYANTAR"|"Y_SUKSHMA"; 
  children?: DashaNode[];
};

export type Charts = { 
  d1?: any; 
  d9?: any;
};

export type Transits = { 
  date: string; 
  highlights: string[]; 
  activeHouses: number[];
};

export type BirthDetails = { 
  name: string; 
  birthDate: string; 
  birthTime: string; 
  birthPlace: string;
};

export type AstroPayload = {
  lang: Lang;
  birth: BirthDetails;
  overview: { 
    asc: string; 
    moon: string; 
    summary?: string;
  };
  planets: PlanetRow[];
  charts: Charts;
  vimshottari: DashaNode[];
  yogini: DashaNode[];
  transits: Transits;
  analysis: string;
  suggestions: string[];
};

// Helper functions for data normalization
export function normalizePlanetRow(raw: any): PlanetRow {
  return {
    planet: raw.planet || "Unknown",
    signLabel: raw.signLabel || raw.sign || "Unknown",
    house: raw.safeHouse || raw.house || 0,
    degree: raw.degree || null,
    safeHouse: raw.safeHouse || raw.house || 0
  };
}

export function normalizeDashaNode(raw: any): DashaNode {
  return {
    name: raw.name || "Unknown",
    lord: raw.lord || raw.ruler || "Unknown",
    start: raw.start || raw.startDate || new Date().toISOString(),
    end: raw.end || raw.endDate || new Date().toISOString(),
    level: raw.level || "MAHA",
    children: raw.children?.map(normalizeDashaNode) || []
  };
}

export function createSkeletonPayload(lang: Lang = "en"): AstroPayload {
  return {
    lang,
    birth: {
      name: "Loading...",
      birthDate: "Loading...",
      birthTime: "Loading...",
      birthPlace: "Loading..."
    },
    overview: {
      asc: "Loading...",
      moon: "Loading...",
      summary: "Loading analysis..."
    },
    planets: [],
    charts: {},
    vimshottari: [],
    yogini: [],
    transits: {
      date: new Date().toISOString(),
      highlights: [],
      activeHouses: []
    },
    analysis: "Loading analysis...",
    suggestions: ["Loading suggestions...", "Loading suggestions...", "Loading suggestions..."]
  };
}
