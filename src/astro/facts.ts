// src/astro/facts.ts
// Deterministic fact sheet generation from Pokhrel data

import { normalizePlanetName, normalizeSignName, calculateHouseFromLongitude, calculateDignity } from './utils';
import { getHousesOwnedBy } from './lords';

export type AstroFactSheet = {
  ascendant: { 
    sign: string; 
    degree: number; 
    lord: string; 
    house: 1;
  };
  planets: Array<{
    planet: string; 
    sign: string; 
    degree?: number; 
    house: 1|2|3|4|5|6|7|8|9|10|11|12;
    lordOf: number[];  // which houses it owns from lagna
    dignity?: "Exalted"|"Debilitated"|"Own"|"Friendly"|"Neutral"|"Enemy";
    isRetro?: boolean;
    divisional?: { 
      D9?: { sign: string; dignity?: string }, 
      D10?: { sign: string; dignity?: string }
    };
  }>;
  aspects?: Array<{ 
    from: string; 
    toHouse: number; 
    type: "aspect"|"conjunction" 
  }>;
  shadbala?: Record<string, number>;
  yogasRaw?: string[]; // from Pokhrel if provided
  doshasRaw?: string[]; // from Pokhrel if provided
  dashas: {
    vimshottari: Array<{ 
      maha: string; 
      antar?: string; 
      pratyantar?: string; 
      sookshma?: string; 
      start?: string; 
      end?: string 
    }>;
    yogini?: Array<{ 
      period: string; 
      start?: string; 
      end?: string 
    }>;
  };
};

export function buildAstroFactSheet(astroData: any): AstroFactSheet {
  // Normalize ascendant data
  const ascendantSign = normalizeSignName(astroData.ascendant?.sign || 'Unknown');
  const ascendantDegree = astroData.ascendant?.degree || 0;
  const ascendantLord = getAscendantLord(ascendantSign);
  
  // Process planets
  const planets = (astroData.planets || []).map((planet: any) => {
    const normalizedPlanet = normalizePlanetName(planet.planet || 'Unknown');
    const normalizedSign = normalizeSignName(planet.sign || 'Unknown');
    const house = planet.house || calculateHouseFromLongitude(
      planet.degree || 0, 
      ascendantDegree
    );
    
    return {
      planet: normalizedPlanet,
      sign: normalizedSign,
      degree: planet.degree,
      house: Math.max(1, Math.min(12, house)) as 1|2|3|4|5|6|7|8|9|10|11|12,
      lordOf: getHousesOwnedBy(normalizedPlanet, ascendantSign),
      dignity: calculateDignity(normalizedPlanet, normalizedSign) as any,
      isRetro: planet.isRetro || planet.isRetrograde || false,
      divisional: {
        D9: planet.navamsha ? {
          sign: normalizeSignName(planet.navamsha.sign || 'Unknown'),
          dignity: calculateDignity(normalizedPlanet, normalizeSignName(planet.navamsha.sign || 'Unknown'))
        } : undefined,
        D10: planet.dashamsha ? {
          sign: normalizeSignName(planet.dashamsha.sign || 'Unknown'),
          dignity: calculateDignity(normalizedPlanet, normalizeSignName(planet.dashamsha.sign || 'Unknown'))
        } : undefined
      }
    };
  });
  
  // Process aspects
  const aspects = (astroData.aspects || []).map((aspect: any) => ({
    from: normalizePlanetName(aspect.fromPlanet || aspect.from || 'Unknown'),
    toHouse: aspect.toHouse || aspect.to || 0,
    type: aspect.type || 'aspect'
  }));
  
  // Process Shadbala
  const shadbala: Record<string, number> = {};
  if (astroData.shadbala) {
    for (const [planet, score] of Object.entries(astroData.shadbala)) {
      shadbala[normalizePlanetName(planet)] = score as number;
    }
  }
  
  // Process dashas
  const vimshottari = (astroData.dashas?.vimshottari?.timelineMaha || []).map((dasha: any) => ({
    maha: normalizePlanetName(dasha.planet || dasha.mahadasha || 'Unknown'),
    antar: dasha.antardasha ? normalizePlanetName(dasha.antardasha) : undefined,
    pratyantar: dasha.pratyantar ? normalizePlanetName(dasha.pratyantar) : undefined,
    sookshma: dasha.sookshma ? normalizePlanetName(dasha.sookshma) : undefined,
    start: dasha.start,
    end: dasha.end
  }));
  
  const yogini = (astroData.dashas?.yogini?.timeline || []).map((yogini: any) => ({
    period: yogini.yogini || yogini.period || 'Unknown',
    start: yogini.start,
    end: yogini.end
  }));
  
  return {
    ascendant: {
      sign: ascendantSign,
      degree: ascendantDegree,
      lord: ascendantLord,
      house: 1
    },
    planets,
    aspects,
    shadbala,
    yogasRaw: astroData.yogas?.map((y: any) => y.label || y.name || y) || [],
    doshasRaw: astroData.doshas?.map((d: any) => d.label || d.name || d) || [],
    dashas: {
      vimshottari,
      yogini
    }
  };
}

function getAscendantLord(sign: string): string {
  const lords: Record<string, string> = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Saturn',
    'Pisces': 'Jupiter'
  };
  return lords[sign] || 'Unknown';
}
