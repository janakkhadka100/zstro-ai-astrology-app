// ✅ lib/types/astro.ts
export interface KundliContent {
  kundliData?: any; // parsed JSON string
}

export interface PlanetContent {
  kundliData?: any;
}

export interface DashaContent {
  kundliData?: any;
}

export type AstroDataContent = KundliContent | PlanetContent | DashaContent;

export interface AstroDataRecord {
  id: string;
  userId: string;
  type: string;
  content: AstroDataContent;
}
