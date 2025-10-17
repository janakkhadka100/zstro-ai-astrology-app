// lib/astrology/util.ts
// Astrology utility functions

import { PlanetName } from './types';

export const SIGNS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const SIGNS_NE = [
  "मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

export function toPlanet(planetInput: any): PlanetName {
  const name = planetInput?.name ?? planetInput?.planet ?? planetInput;
  const normalized = String(name).trim();
  
  switch (normalized) {
    case "Sun": return "Sun";
    case "Moon": return "Moon";
    case "Mars": return "Mars";
    case "Mercury": return "Mercury";
    case "Jupiter": return "Jupiter";
    case "Venus": return "Venus";
    case "Saturn": return "Saturn";
    case "Rahu": return "Rahu";
    case "Ketu": return "Ketu";
    default:
      console.warn(`Unknown planet: ${normalized}, defaulting to Sun`);
      return "Sun";
  }
}

export function signIdFrom(planetData: any): number {
  // Try different possible field names for sign ID
  if (planetData?.rasiId) return Number(planetData.rasiId);
  if (planetData?.rasi_id) return Number(planetData.rasi_id);
  if (planetData?.signId) return Number(planetData.signId);
  if (planetData?.sign_id) return Number(planetData.sign_id);
  
  // Calculate from longitude if available
  if (typeof planetData?.longitude === "number") {
    return Math.floor(planetData.longitude / 30) + 1;
  }
  
  // Default to Aries if no valid data
  console.warn(`Could not determine sign ID for planet data:`, planetData);
  return 1;
}

export function wholeSignHouse(ascSignId: number, planetSignId: number): number {
  // House numbering: asc sign == H1; then circular
  // Formula: ((planetSignId - ascSignId + 12) % 12) + 1
  const diff = ((planetSignId - ascSignId) + 12) % 12;
  return diff + 1; // 1..12
}

export function getSignLabel(signId: number, lang: "ne" | "en" = "en"): string {
  const index = (signId - 1 + 12) % 12;
  return lang === "ne" ? SIGNS_NE[index] : SIGNS_EN[index];
}

export function validateSignId(signId: number): boolean {
  return Number.isInteger(signId) && signId >= 1 && signId <= 12;
}

export function validateHouseNumber(house: number): boolean {
  return Number.isInteger(house) && house >= 1 && house <= 12;
}

export function normalizePlanetName(planet: any): PlanetName {
  return toPlanet(planet);
}

export function isRetrograde(planetData: any): boolean {
  return Boolean(
    planetData?.is_retrograde ?? 
    planetData?.isRetrograde ?? 
    planetData?.retro ?? 
    planetData?.isRetro
  );
}

export function formatPlanetRow(planet: PlanetName, signLabel: string, house: number, retro: boolean): string {
  return `${planet}|${signLabel}|H${house}${retro ? "|R" : ""}`;
}

export function parsePlanetRow(row: string): { planet: PlanetName; signLabel: string; house: number; retro: boolean } | null {
  const parts = row.split('|');
  if (parts.length < 3) return null;
  
  const planet = toPlanet(parts[0]);
  const signLabel = parts[1];
  const house = parseInt(parts[2].replace('H', ''));
  const retro = parts[3] === 'R';
  
  return { planet, signLabel, house, retro };
}
