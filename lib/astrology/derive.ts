// lib/astrology/derive.ts
// Derivation engine for houses, aspects, relations, and strengths

import { D1PlanetRow, DerivedBundle, HouseRow, RelationEdge, StrengthRow, PlanetName, SignId } from "./types";
import { LORDS, DRISHTI, DIGNITY, getSignLabel, getHouseLord, isNaturalFriend, isNaturalEnemy, getDignity } from "./tables";

// Helper function to wrap house numbers
const wrap = (n: number): SignId => (((n - 1 + 12) % 12) + 1) as SignId;

export function buildHouses(asc: SignId, d1: D1PlanetRow[]): HouseRow[] {
  // Create 12 houses with their signs and lords
  const rows: HouseRow[] = Array.from({ length: 12 }, (_, i) => {
    const house = (i + 1) as HouseRow["house"];
    const signId = wrap(asc + i);
    const lord = LORDS[signId];
    const occupants = d1.filter(p => p.house === house).map(p => p.planet);
    
    return {
      house,
      signId,
      signLabel: getSignLabel(signId),
      lord,
      occupants,
      aspectsFrom: [],
      aspectPower: 0
    };
  });

  // Add aspects to houses (Vedic drishti)
  const addAspect = (
    from: D1PlanetRow, 
    targetHouse: number, 
    kind: HouseRow["aspectsFrom"][number]["kind"]
  ) => {
    const row = rows[targetHouse - 1];
    row.aspectsFrom.push({ planet: from.planet, kind });
    // Weight different aspects
    row.aspectPower += kind === "jupiter" ? 1.2 : kind === "saturn" ? 1.1 : kind === "mars" ? 1.1 : 1.0;
  };

  for (const p of d1) {
    const hs = p.house;
    
    // All planets aspect 7th house
    if (DRISHTI.all7(p.planet)) {
      addAspect(p, wrap(hs + 6), "7");
    }
    
    // Mars aspects 4th, 7th, 8th houses
    if (p.planet === "Mars") {
      [4, 7, 8].forEach(offset => {
        addAspect(p, wrap(hs + offset - 1), "mars");
      });
    }
    
    // Jupiter aspects 5th, 7th, 9th houses
    if (p.planet === "Jupiter") {
      [5, 7, 9].forEach(offset => {
        addAspect(p, wrap(hs + offset - 1), "jupiter");
      });
    }
    
    // Saturn aspects 3rd, 7th, 10th houses
    if (p.planet === "Saturn") {
      [3, 7, 10].forEach(offset => {
        addAspect(p, wrap(hs + offset - 1), "saturn");
      });
    }
  }

  return rows;
}

export function buildRelations(d1: D1PlanetRow[]): RelationEdge[] {
  const relations: RelationEdge[] = [];
  const planets = d1.map(p => p.planet);
  
  for (const a of planets) {
    for (const b of planets) {
      if (a !== b) {
        const natural = isNaturalFriend(a, b) ? "friend" : 
                       isNaturalEnemy(a, b) ? "enemy" : "neutral";
        
        relations.push({ a, b, natural });
      }
    }
  }
  
  return relations;
}

export function buildStrengths(
  d1: D1PlanetRow[], 
  shadbala?: { planet: PlanetName; value: number }[]
): StrengthRow[] {
  const shadbalaMap = new Map(shadbala?.map(s => [s.planet, s.value] as const) || []);
  
  return d1.map(p => {
    const dignity = getDignity(p.planet, p.signId);
    const rawShadbala = shadbalaMap.get(p.planet);
    
    // Simple normalization (0-100 scale)
    const normalized = rawShadbala != null ? 
      Math.min(100, Math.round((rawShadbala / (rawShadbala > 200 ? 2 : 1)))) : 
      undefined;
    
    return {
      planet: p.planet,
      shadbala: rawShadbala,
      normalized,
      dignity: dignity as any
    };
  });
}

export function deriveBundle(
  asc: SignId, 
  d1: D1PlanetRow[], 
  shadbala?: { planet: PlanetName; value: number }[]
): DerivedBundle {
  return {
    houses: buildHouses(asc, d1),
    relations: buildRelations(d1),
    strengths: buildStrengths(d1, shadbala),
  };
}

// Additional utility functions for house analysis
export function getHouseSignificance(house: number, lang: "ne" | "en" = "en"): string {
  const significance = {
    1: { ne: "आत्मा, शरीर, व्यक्तित्व", en: "Self, body, personality" },
    2: { ne: "धन, परिवार, वाणी", en: "Wealth, family, speech" },
    3: { ne: "भाइबहिनी, साहस, संचार", en: "Siblings, courage, communication" },
    4: { ne: "आमा, घर, शिक्षा", en: "Mother, home, education" },
    5: { ne: "सन्तान, बुद्धि, रचनात्मकता", en: "Children, intelligence, creativity" },
    6: { ne: "रोग, शत्रु, सेवा", en: "Diseases, enemies, service" },
    7: { ne: "जीवनसाथी, साझेदारी, विवाह", en: "Spouse, partnerships, marriage" },
    8: { ne: "आयु, परिवर्तन, गुप्त विद्या", en: "Longevity, transformation, occult" },
    9: { ne: "भाग्य, बुबा, उच्च शिक्षा", en: "Fortune, father, higher learning" },
    10: { ne: "कर्म, प्रतिष्ठा, अधिकार", en: "Career, reputation, authority" },
    11: { ne: "लाभ, मित्र, जेठो भाइ", en: "Gains, friends, elder siblings" },
    12: { ne: "हानि, खर्च, विदेश", en: "Losses, expenses, foreign lands" }
  };
  
  return significance[house as keyof typeof significance]?.[lang] || "";
}

export function isKendra(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

export function isKona(house: number): boolean {
  return [1, 5, 9].includes(house);
}

export function isTrik(house: number): boolean {
  return [6, 8, 12].includes(house);
}

export function isUpachaya(house: number): boolean {
  return [3, 6, 10, 11].includes(house);
}
