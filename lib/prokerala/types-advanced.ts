// lib/prokerala/types-advanced.ts
// Advanced Vedic astrology data structures for deep analysis

export interface AdvancedPlanetPosition {
  planet: string;
  sign: string;
  house: number;
  lord: string;
  isRetro: boolean;
  dignity: 'Own' | 'Exalted' | 'Debilitated' | 'Neutral' | 'Enemy' | 'Friend';
  degree: number;
  nakshatra: string;
  nakshatraLord: string;
  shadbala: number;
  aspects: string[]; // Planets this planet aspects
  conjunctions: string[]; // Planets in same house
}

export interface AscendantData {
  sign: string;
  degree: number;
  lord: string;
  nakshatra: string;
  nakshatraLord: string;
}

export interface YogaItem {
  label: string;
  type: 'Rajyoga' | 'Dhanayoga' | 'Panchmahapurush' | 'Vipareeta' | 'Special';
  factors: string[];
  description: string;
  strength: 'Strong' | 'Medium' | 'Weak';
  effects: string[];
}

export interface DoshaItem {
  label: string;
  type: 'Kaal Sarp' | 'Mangal' | 'Rahu-Ketu' | 'Pitru' | 'Nadi';
  factors: string[];
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  remedies: string[];
}

export interface DashaPeriod {
  mahadasha: string;
  antardasha: string;
  pratyantar: string;
  sookshma?: string;
  start: string;
  end: string;
  duration: string;
  planetHouse: number;
  planetLord: string;
  effects: string[];
}

export interface VimshottariDasha {
  current: DashaPeriod;
  timeline: DashaPeriod[];
  major: DashaPeriod[];
  sub: DashaPeriod[];
  subSub: DashaPeriod[];
}

export interface YoginiDasha {
  current: {
    yogini: string;
    planet: string;
    start: string;
    end: string;
    effects: string[];
  };
  timeline: Array<{
    yogini: string;
    planet: string;
    start: string;
    end: string;
    effects: string[];
  }>;
}

export interface ShadbalaData {
  [planet: string]: {
    total: number;
    sthana: number;
    kala: number;
    cheshta: number;
    naisargika: number;
    drik: number;
    bhava: number;
    strength: 'Strong' | 'Medium' | 'Weak';
  };
}

export interface DivisionalChart {
  D1: {
    planets: AdvancedPlanetPosition[];
    houses: Array<{
      number: number;
      sign: string;
      lord: string;
      planets: string[];
    }>;
  };
  D9: {
    planets: AdvancedPlanetPosition[];
    houses: Array<{
      number: number;
      sign: string;
      lord: string;
      planets: string[];
    }>;
  };
  D10: {
    planets: AdvancedPlanetPosition[];
    houses: Array<{
      number: number;
      sign: string;
      lord: string;
      planets: string[];
    }>;
  };
}

export interface AdvancedAstrologyData {
  ascendant: AscendantData;
  planets: AdvancedPlanetPosition[];
  yogas: YogaItem[];
  doshas: DoshaItem[];
  dashas: {
    vimshottari: VimshottariDasha;
    yogini: YoginiDasha;
  };
  shadbala: ShadbalaData;
  divisionalCharts: DivisionalChart;
  birthData: {
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    career: string[];
    marriage: string[];
    health: string[];
    spirituality: string[];
    remedies: string[];
  };
}

export interface AstrologyReport {
  basicChart: {
    ascendant: string;
    ascendantLord: string;
    planets: Array<{
      planet: string;
      sign: string;
      house: number;
      lord: string;
      dignity: string;
    }>;
  };
  planetaryAnalysis: Array<{
    planet: string;
    interpretation: string;
    effects: string[];
  }>;
  yogasAndDoshas: {
    yogas: YogaItem[];
    doshas: DoshaItem[];
    analysis: string;
  };
  dashaAnalysis: {
    current: DashaPeriod;
    vimshottari: string;
    yogini: string;
    predictions: string[];
  };
  shadbalaAnalysis: {
    strongest: string[];
    weakest: string[];
    analysis: string;
  };
  divisionalInsights: {
    navamsha: string;
    dashamsha: string;
    analysis: string;
  };
  finalInterpretation: {
    summary: string;
    career: string;
    marriage: string;
    health: string;
    spirituality: string;
    remedies: string[];
  };
}
