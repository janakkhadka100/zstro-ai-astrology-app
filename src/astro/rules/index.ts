// src/astro/rules/index.ts
// Pure TypeScript rule engine for Yogas and Doshas

import { AstroFactSheet } from '../facts';
import { isKendra, isDusthana, getShadbalaBand } from '../utils';

export type PanchMahapurushYoga = {
  key: string;
  planet: string;
  kendra: 1|4|7|10;
  dignity: "Own"|"Exalted";
  sign: string;
};

export type VipareetaRajyoga = {
  key: string;
  lordOf: 6|8|12;
  placedIn: 6|8|12;
  planet: string;
  note: string;
};

export type OtherYoga = {
  key: string;
  reason: string;
  factors: string[];
};

export type ShadbalaEntry = {
  planet: string;
  score: number;
  band: "strong"|"medium"|"weak";
};

export type EvaluatedYogas = {
  panchMahapurush?: PanchMahapurushYoga[];
  vipareetaRajyoga?: VipareetaRajyoga[];
  other?: OtherYoga[];
  shadbala: ShadbalaEntry[];
};

export function evaluateYogas(facts: AstroFactSheet): EvaluatedYogas {
  const result: EvaluatedYogas = {
    shadbala: []
  };
  
  // Evaluate Panch-Mahapurush Yogas
  result.panchMahapurush = evaluatePanchMahapurush(facts);
  
  // Evaluate Vipareeta Rajyoga
  result.vipareetaRajyoga = evaluateVipareetaRajyoga(facts);
  
  // Evaluate other yogas
  result.other = evaluateOtherYogas(facts);
  
  // Process Shadbala
  result.shadbala = evaluateShadbala(facts);
  
  return result;
}

function evaluatePanchMahapurush(facts: AstroFactSheet): PanchMahapurushYoga[] {
  const yogas: PanchMahapurushYoga[] = [];
  
  const panchMahapurushPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const yogaNames: Record<string, string> = {
    'Mars': 'PMP_Ruchaka',
    'Mercury': 'PMP_Bhadra', 
    'Jupiter': 'PMP_Hamsa',
    'Venus': 'PMP_Malavya',
    'Saturn': 'PMP_Shasha'
  };
  
  facts.planets.forEach(planet => {
    if (panchMahapurushPlanets.includes(planet.planet)) {
      const isInKendra = isKendra(planet.house);
      const isOwnOrExalted = planet.dignity === 'Own' || planet.dignity === 'Exalted';
      
      if (isInKendra && isOwnOrExalted) {
        yogas.push({
          key: yogaNames[planet.planet],
          planet: planet.planet,
          kendra: planet.house as 1|4|7|10,
          dignity: planet.dignity as "Own"|"Exalted",
          sign: planet.sign
        });
      }
    }
  });
  
  return yogas;
}

function evaluateVipareetaRajyoga(facts: AstroFactSheet): VipareetaRajyoga[] {
  const yogas: VipareetaRajyoga[] = [];
  
  facts.planets.forEach(planet => {
    // Check if this planet owns dusthana houses
    const dusthanaOwned = planet.lordOf.filter(house => isDusthana(house));
    
    dusthanaOwned.forEach(ownedHouse => {
      // Check if the planet is placed in another dusthana
      if (isDusthana(planet.house) && ownedHouse !== planet.house) {
        yogas.push({
          key: 'VRY',
          lordOf: ownedHouse as 6|8|12,
          placedIn: planet.house as 6|8|12,
          planet: planet.planet,
          note: `dusthana lord in dusthana`
        });
      }
    });
  });
  
  return yogas;
}

function evaluateOtherYogas(facts: AstroFactSheet): OtherYoga[] {
  const yogas: OtherYoga[] = [];
  
  // Gajakesari Yoga: Moon and Jupiter in Kendra from each other
  const moon = facts.planets.find(p => p.planet === 'Moon');
  const jupiter = facts.planets.find(p => p.planet === 'Jupiter');
  
  if (moon && jupiter) {
    const moonInKendra = isKendra(moon.house);
    const jupiterInKendra = isKendra(jupiter.house);
    
    if (moonInKendra && jupiterInKendra) {
      yogas.push({
        key: 'Gajakesari',
        reason: 'Moon and Jupiter both in Kendra houses',
        factors: ['Moon', 'Jupiter']
      });
    }
  }
  
  // Budha-Aditya Yoga: Sun and Mercury in same house
  const sun = facts.planets.find(p => p.planet === 'Sun');
  const mercury = facts.planets.find(p => p.planet === 'Mercury');
  
  if (sun && mercury && sun.house === mercury.house) {
    yogas.push({
      key: 'BudhaAditya',
      reason: 'Sun and Mercury in same house',
      factors: ['Sun', 'Mercury']
    });
  }
  
  return yogas;
}

function evaluateShadbala(facts: AstroFactSheet): ShadbalaEntry[] {
  const entries: ShadbalaEntry[] = [];
  
  if (facts.shadbala) {
    for (const [planet, score] of Object.entries(facts.shadbala)) {
      entries.push({
        planet,
        score,
        band: getShadbalaBand(score)
      });
    }
  }
  
  return entries;
}
