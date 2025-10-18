// lib/astrology/tables.ts
// Deterministic rule tables for classical Vedic astrology

import { PlanetName, SignId } from "./types";

// Sign lords (deterministic)
export const LORDS: Record<SignId, PlanetName> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
  7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// Natural friendship (classical rules)
export const NATURAL_FRIENDSHIP: Record<PlanetName, PlanetName[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
  Rahu: ["Venus", "Saturn", "Mercury"],
  Ketu: ["Mars", "Jupiter", "Venus"]
};

// Derive enemies (others not in friend/self)
export function getNaturalEnemies(planet: PlanetName): PlanetName[] {
  const friends = NATURAL_FRIENDSHIP[planet] || [];
  const allPlanets: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  return allPlanets.filter(p => p !== planet && !friends.includes(p));
}

// Vedic drishti (aspect) rules
export const DRISHTI = {
  // All planets aspect 7th house
  all7: (p: PlanetName) => !["Mars", "Jupiter", "Saturn"].includes(p),
  // Mars aspects 4th, 7th, 8th houses
  mars: [4, 7, 8],
  // Jupiter aspects 5th, 7th, 9th houses  
  jupiter: [5, 7, 9],
  // Saturn aspects 3rd, 7th, 10th houses
  saturn: [3, 7, 10]
};

// Dignity rules (exaltation/debilitation)
export const DIGNITY = {
  exalt: { 
    Sun: 1, Moon: 2, Mars: 10, Mercury: 6, 
    Jupiter: 4, Venus: 12, Saturn: 7 
  } as Record<PlanetName, SignId>,
  debil: { 
    Sun: 7, Moon: 8, Mars: 4, Mercury: 12, 
    Jupiter: 10, Venus: 6, Saturn: 1 
  } as Record<PlanetName, SignId>,
  own: {
    Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6],
    Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11]
  } as Record<PlanetName, SignId[]>
};

// Sign labels (English)
export const SIGN_LABELS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Sign labels (Nepali)
export const SIGN_LABELS_NE = [
  "मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

// House significance (karakas)
export const HOUSE_SIGNIFICANCE = {
  1: { karaka: "Atmakaraka", meaning: "Self, body, personality" },
  2: { karaka: "Dhanakaraka", meaning: "Wealth, family, speech" },
  3: { karaka: "Sahajakaraka", meaning: "Siblings, courage, communication" },
  4: { karaka: "Matrukaraka", meaning: "Mother, home, education" },
  5: { karaka: "Putrakaraka", meaning: "Children, intelligence, creativity" },
  6: { karaka: "Ari", meaning: "Diseases, enemies, service" },
  7: { karaka: "Kalatrakaraka", meaning: "Spouse, partnerships, marriage" },
  8: { karaka: "Ayu", meaning: "Longevity, transformation, occult" },
  9: { karaka: "Bhagya", meaning: "Fortune, father, higher learning" },
  10: { karaka: "Karma", meaning: "Career, reputation, authority" },
  11: { karaka: "Labha", meaning: "Gains, friends, elder siblings" },
  12: { karaka: "Vyaya", meaning: "Losses, expenses, foreign lands" }
};

// Maraka houses (death-inflicting)
export const MARAKA_HOUSES = [2, 7];

// Upachaya houses (growth)
export const UPACHAYA_HOUSES = [3, 6, 10, 11];

// Trik houses (malefic)
export const TRIK_HOUSES = [6, 8, 12];

// Kendra houses (angular)
export const KENDRA_HOUSES = [1, 4, 7, 10];

// Kona houses (trine)
export const KONA_HOUSES = [1, 5, 9];

// Utility functions
export function getSignLabel(signId: SignId, lang: "ne" | "en" = "en"): string {
  const labels = lang === "ne" ? SIGN_LABELS_NE : SIGN_LABELS_EN;
  return labels[(signId - 1 + 12) % 12] || "Unknown";
}

export function getHouseLord(house: number, asc: SignId): PlanetName {
  const signInHouse = (((asc + house - 2) % 12) + 1) as SignId;
  return LORDS[signInHouse];
}

export function isNaturalFriend(planet1: PlanetName, planet2: PlanetName): boolean {
  return (NATURAL_FRIENDSHIP[planet1] || []).includes(planet2);
}

export function isNaturalEnemy(planet1: PlanetName, planet2: PlanetName): boolean {
  return getNaturalEnemies(planet1).includes(planet2);
}

export function getDignity(planet: PlanetName, signId: SignId): "exalt" | "own" | "debil" | "neutral" {
  if (DIGNITY.exalt[planet] === signId) return "exalt";
  if (DIGNITY.debil[planet] === signId) return "debil";
  if ((DIGNITY.own[planet] || []).includes(signId)) return "own";
  return "neutral";
}
