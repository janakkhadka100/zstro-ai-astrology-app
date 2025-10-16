// src/astro/dasha/expand.ts
// Deterministic dasha expansion with house/lordship effects

import { AstroFactSheet } from '../facts';

export type DashaPeriod = {
  planet: string;
  house: number;
  lordOf: number[];
  strengthBand: 'strong' | 'medium' | 'weak';
  themes: string[];
  start?: string;
  end?: string;
  level: 'maha' | 'antar' | 'pratyantar' | 'sookshma';
};

export type ExpandedDasha = {
  current: {
    maha: DashaPeriod;
    antar?: DashaPeriod;
    pratyantar?: DashaPeriod;
    sookshma?: DashaPeriod;
  };
  timeline: DashaPeriod[];
};

export function expandDasha(facts: AstroFactSheet): ExpandedDasha {
  const current = getCurrentDashaPeriod(facts);
  const timeline = buildDashaTimeline(facts);
  
  return {
    current,
    timeline
  };
}

function getCurrentDashaPeriod(facts: AstroFactSheet): ExpandedDasha['current'] {
  const vimshottari = facts.dashas.vimshottari[0];
  if (!vimshottari) {
    throw new Error('No Vimshottari dasha data available');
  }
  
  const mahaPlanet = facts.planets.find(p => p.planet === vimshottari.maha);
  if (!mahaPlanet) {
    throw new Error(`Planet ${vimshottari.maha} not found in facts`);
  }
  
  const maha: DashaPeriod = {
    planet: vimshottari.maha,
    house: mahaPlanet.house,
    lordOf: mahaPlanet.lordOf,
    strengthBand: getPlanetStrengthBand(vimshottari.maha, facts),
    themes: getHouseThemes(mahaPlanet.house, mahaPlanet.lordOf),
    start: vimshottari.start,
    end: vimshottari.end,
    level: 'maha'
  };
  
  let antar: DashaPeriod | undefined;
  if (vimshottari.antar) {
    const antarPlanet = facts.planets.find(p => p.planet === vimshottari.antar);
    if (antarPlanet) {
      antar = {
        planet: vimshottari.antar,
        house: antarPlanet.house,
        lordOf: antarPlanet.lordOf,
        strengthBand: getPlanetStrengthBand(vimshottari.antar, facts),
        themes: getHouseThemes(antarPlanet.house, antarPlanet.lordOf),
        level: 'antar'
      };
    }
  }
  
  let pratyantar: DashaPeriod | undefined;
  if (vimshottari.pratyantar) {
    const pratyantarPlanet = facts.planets.find(p => p.planet === vimshottari.pratyantar);
    if (pratyantarPlanet) {
      pratyantar = {
        planet: vimshottari.pratyantar,
        house: pratyantarPlanet.house,
        lordOf: pratyantarPlanet.lordOf,
        strengthBand: getPlanetStrengthBand(vimshottari.pratyantar, facts),
        themes: getHouseThemes(pratyantarPlanet.house, pratyantarPlanet.lordOf),
        level: 'pratyantar'
      };
    }
  }
  
  let sookshma: DashaPeriod | undefined;
  if (vimshottari.sookshma) {
    const sookshmaPlanet = facts.planets.find(p => p.planet === vimshottari.sookshma);
    if (sookshmaPlanet) {
      sookshma = {
        planet: vimshottari.sookshma,
        house: sookshmaPlanet.house,
        lordOf: sookshmaPlanet.lordOf,
        strengthBand: getPlanetStrengthBand(vimshottari.sookshma, facts),
        themes: getHouseThemes(sookshmaPlanet.house, sookshmaPlanet.lordOf),
        level: 'sookshma'
      };
    }
  }
  
  return {
    maha,
    antar,
    pratyantar,
    sookshma
  };
}

function buildDashaTimeline(facts: AstroFactSheet): DashaPeriod[] {
  const timeline: DashaPeriod[] = [];
  
  facts.dashas.vimshottari.forEach(dasha => {
    const planet = facts.planets.find(p => p.planet === dasha.maha);
    if (planet) {
      timeline.push({
        planet: dasha.maha,
        house: planet.house,
        lordOf: planet.lordOf,
        strengthBand: getPlanetStrengthBand(dasha.maha, facts),
        themes: getHouseThemes(planet.house, planet.lordOf),
        start: dasha.start,
        end: dasha.end,
        level: 'maha'
      });
    }
  });
  
  return timeline;
}

function getPlanetStrengthBand(planet: string, facts: AstroFactSheet): 'strong' | 'medium' | 'weak' {
  if (facts.shadbala && facts.shadbala[planet]) {
    const score = facts.shadbala[planet];
    if (score >= 1.2) return 'strong';
    if (score >= 0.9) return 'medium';
    return 'weak';
  }
  
  // Fallback to dignity-based strength
  const planetData = facts.planets.find(p => p.planet === planet);
  if (planetData?.dignity === 'Exalted') return 'strong';
  if (planetData?.dignity === 'Own') return 'medium';
  return 'weak';
}

function getHouseThemes(house: number, lordOf: number[]): string[] {
  const themes: string[] = [];
  
  // Themes based on house placement
  const houseThemes: Record<number, string[]> = {
    1: ['personality', 'health', 'appearance', 'overall life'],
    2: ['wealth', 'family', 'speech', 'food habits'],
    3: ['courage', 'siblings', 'communication', 'short journeys'],
    4: ['mother', 'home', 'education', 'property'],
    5: ['children', 'creativity', 'speculation', 'romance'],
    6: ['health', 'service', 'enemies', 'daily work'],
    7: ['marriage', 'partnerships', 'business', 'spouse'],
    8: ['transformation', 'occult', 'longevity', 'shared resources'],
    9: ['father', 'higher learning', 'spirituality', 'long journeys'],
    10: ['career', 'reputation', 'authority', 'public image'],
    11: ['gains', 'friends', 'aspirations', 'income'],
    12: ['losses', 'spirituality', 'foreign lands', 'subconscious']
  };
  
  themes.push(...(houseThemes[house] || []));
  
  // Additional themes based on lordship
  lordOf.forEach(ownedHouse => {
    const ownedThemes = houseThemes[ownedHouse] || [];
    themes.push(...ownedThemes.map(theme => `lordship: ${theme}`));
  });
  
  return [...new Set(themes)]; // Remove duplicates
}

export function describePeriod(period: DashaPeriod): string {
  const themes = period.themes.join(', ');
  const strength = period.strengthBand;
  const lordship = period.lordOf.length > 0 ? ` (owns houses: ${period.lordOf.join(', ')})` : '';
  
  return `${period.planet} in house ${period.house}${lordship} - ${strength} strength, themes: ${themes}`;
}
