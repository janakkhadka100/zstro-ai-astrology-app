// lib/astrology/detectors.ts
// Deterministic yoga/rajyoga detectors based on D1 cards

import { SignId, find, relHouse, signLabel, LORDS, houseOf, houseLordOf } from './util';

export interface YogaDetection {
  key: string;
  label: string;
  why: string;
  group?: 'Rajyoga' | 'Pancha-Mahapurusha' | 'Chandra-based' | 'General';
}

// 1) Gajakesari Yoga (Moon ↔ Jupiter kendra FROM MOON)
export function detectGajakesari(d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection | null {
  const M = find(d1, "Moon");
  const J = find(d1, "Jupiter");
  
  if (!M || !J) {
    return null; // Required planets missing
  }
  
  const rel = relHouse(M.signId as SignId, J.signId as SignId);
  const kendra = [1, 4, 7, 10];
  
  if (kendra.includes(rel)) {
    const moonSign = signLabel(M.signId, lang);
    const jupSign = signLabel(J.signId, lang);
    const houseName = lang === "ne" ? 
      `${rel}${rel === 1 ? 'ल' : rel === 4 ? 'च' : rel === 7 ? 'स' : 'द'}` :
      `${rel}${rel === 1 ? 'st' : rel === 2 ? 'nd' : rel === 3 ? 'rd' : 'th'}`;
    
    return {
      key: "gajakesari",
      label: "Gajakesari Yoga",
      why: `Jupiter is ${houseName} from Moon (${moonSign} → ${jupSign}).`,
      group: "Chandra-based"
    };
  }
  
  return null;
}

// 2) Shasha Yoga (Pancha-Mahapurusha: Saturn in Kendra, own/exaltation)
function isOwnOrExalted_Saturn(sign: SignId): boolean {
  return [10, 11, 7].includes(sign); // Capricorn (own), Aquarius (own), Libra (exalted)
}

export function detectShasha(asc: SignId, d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection | null {
  const S = find(d1, "Saturn");
  if (!S) return null;
  
  const inKendra = [1, 4, 7, 10].includes(S.house);
  const isOwnExalt = isOwnOrExalted_Saturn(S.signId as SignId);
  
  if (inKendra && isOwnExalt) {
    const satSign = signLabel(S.signId, lang);
    const houseName = lang === "ne" ? 
      `H${S.house}${S.house === 1 ? 'ल' : S.house === 4 ? 'च' : S.house === 7 ? 'स' : 'द'}` :
      `H${S.house}${S.house === 1 ? 'st' : S.house === 2 ? 'nd' : S.house === 3 ? 'rd' : 'th'}`;
    
    const status = S.signId === 10 ? "own sign" : S.signId === 11 ? "own sign" : "exalted";
    const statusNepali = S.signId === 10 ? "स्वराशि" : S.signId === 11 ? "स्वराशि" : "उच्च";
    
    return {
      key: "shasha",
      label: "Shasha (Pancha Mahapurusha)",
      why: `Saturn in ${satSign} (${lang === "ne" ? statusNepali : status}) in Kendra H${houseName} from Lagna.`,
      group: "Pancha-Mahapurusha"
    };
  }
  
  return null;
}

// 3) Vipareeta Rajyoga (lord of 6/8/12 placed in 6/8/12)
export function detectVipareetaRajyoga(asc: SignId, d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection | null {
  const maleficHouses = [6, 8, 12];
  const out: any[] = [];
  
  // Compute lords of 6/8/12 from asc
  const targetSigns: SignId[] = maleficHouses.map(h => ((asc + h - 2) % 12) + 1 as SignId);
  
  for (const sign of targetSigns) {
    const lord = LORDS[sign];
    const pl = find(d1, lord);
    if (pl && maleficHouses.includes(pl.house)) {
      const houseFromAsc = houseOf(asc, sign);
      out.push({ 
        house: houseFromAsc, 
        lord, 
        placedIn: pl.house, 
        sign: signLabel(pl.signId, lang) 
      });
    }
  }
  
  if (out.length > 0) {
    const lines = out.map(x => {
      const houseName = lang === "ne" ? 
        `H${x.house}${x.house === 1 ? 'ल' : x.house === 4 ? 'च' : x.house === 7 ? 'स' : 'द'}` :
        `H${x.house}${x.house === 1 ? 'st' : x.house === 2 ? 'nd' : x.house === 3 ? 'rd' : 'th'}`;
      const placedName = lang === "ne" ? 
        `H${x.placedIn}${x.placedIn === 1 ? 'ल' : x.placedIn === 4 ? 'च' : x.placedIn === 7 ? 'स' : 'द'}` :
        `H${x.placedIn}${x.placedIn === 1 ? 'st' : x.placedIn === 2 ? 'nd' : x.placedIn === 3 ? 'rd' : 'th'}`;
      return `${x.lord} (lord of ${houseName}) placed in ${placedName}`;
    }).join("; ");
    
    return { 
      key: "vipareeta-rajyoga", 
      label: "Vipareeta Rajyoga", 
      why: lines,
      group: "Rajyoga"
    };
  }
  
  return null;
}

// 4) Budha-Aditya Yoga (Mercury and Sun in same sign)
export function detectBudhaAditya(d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection | null {
  const M = find(d1, "Mercury");
  const S = find(d1, "Sun");
  
  if (!M || !S) return null;
  
  if (M.signId === S.signId) {
    const sign = signLabel(M.signId, lang);
    return {
      key: "budha-aditya",
      label: "Budha-Aditya Yoga",
      why: `Mercury and Sun both in ${sign}.`,
      group: "General"
    };
  }
  
  return null;
}

// 5) Hamsa Yoga (Jupiter in Kendra, own/exaltation)
function isOwnOrExalted_Jupiter(sign: SignId): boolean {
  return [9, 5, 1].includes(sign); // Sagittarius (own), Leo (exalted), Aries (exalted)
}

export function detectHamsa(asc: SignId, d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection | null {
  const J = find(d1, "Jupiter");
  if (!J) return null;
  
  const inKendra = [1, 4, 7, 10].includes(J.house);
  const isOwnExalt = isOwnOrExalted_Jupiter(J.signId as SignId);
  
  if (inKendra && isOwnExalt) {
    const jupSign = signLabel(J.signId, lang);
    const houseName = lang === "ne" ? 
      `H${J.house}${J.house === 1 ? 'ल' : J.house === 4 ? 'च' : J.house === 7 ? 'स' : 'द'}` :
      `H${J.house}${J.house === 1 ? 'st' : J.house === 2 ? 'nd' : J.house === 3 ? 'rd' : 'th'}`;
    
    const status = J.signId === 9 ? "own sign" : "exalted";
    const statusNepali = J.signId === 9 ? "स्वराशि" : "उच्च";
    
    return {
      key: "hamsa",
      label: "Hamsa (Pancha Mahapurusha)",
      why: `Jupiter in ${jupSign} (${lang === "ne" ? statusNepali : status}) in Kendra H${houseName} from Lagna.`,
      group: "Pancha-Mahapurusha"
    };
  }
  
  return null;
}

// 6) Registry + Exported API
export function detectAll(asc: SignId, d1: {planet: string, signId: number, house: number}[], lang: "ne" | "en" = "en"): YogaDetection[] {
  const items = [
    detectGajakesari(d1, lang),
    detectShasha(asc, d1, lang),
    detectVipareetaRajyoga(asc, d1, lang),
    detectBudhaAditya(d1, lang),
    detectHamsa(asc, d1, lang)
  ].filter(Boolean) as YogaDetection[];
  
  return items;
}

// Helper function to deduplicate yogas by key
export function dedupByKey(yogas: YogaDetection[]): YogaDetection[] {
  const seen = new Set<string>();
  return yogas.filter(yoga => {
    if (seen.has(yoga.key)) {
      return false;
    }
    seen.add(yoga.key);
    return true;
  });
}
