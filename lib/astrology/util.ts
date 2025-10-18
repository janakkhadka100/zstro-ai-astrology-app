// lib/astrology/util.ts
// Astrological utility functions for yoga detection

export type SignId = 1|2|3|4|5|6|7|8|9|10|11|12;

export const SIGN_LABEL = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const SIGN_LABEL_NEPALI = [
  "मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

export function signLabel(id: number, lang: "ne" | "en" = "en"): string {
  const labels = lang === "ne" ? SIGN_LABEL_NEPALI : SIGN_LABEL;
  return labels[(id - 1 + 12) % 12] || "Unknown";
}

export function relHouse(from: SignId, to: SignId): 1|2|3|4|5|6|7|8|9|10|11|12 {
  return (((to - from) + 12) % 12) + 1 as any;
}

export const LORDS: Record<SignId, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
  7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

export function houseOf(asc: SignId, sign: SignId): 1|2|3|4|5|6|7|8|9|10|11|12 {
  return relHouse(asc, sign);
}

export function find(d1: {planet: string, signId: number, house: number}[], name: string) {
  return d1.find(p => p.planet === name);
}

export function houseLordOf(signId: SignId, asc: SignId): {house: number, lord: string} {
  return { house: houseOf(asc, signId), lord: LORDS[signId] };
}

// Existing utility functions (keeping for compatibility)
export function toPlanet(pl: any): string {
  const name = String(pl?.name ?? pl?.planet ?? pl?.p ?? "").toLowerCase();
  const planetMap: { [key: string]: string } = {
    "sun": "Sun", "moon": "Moon", "mars": "Mars", "mercury": "Mercury",
    "jupiter": "Jupiter", "venus": "Venus", "saturn": "Saturn",
    "rahu": "Rahu", "ketu": "Ketu", "asc": "Ascendant"
  };
  return planetMap[name] || "Unknown";
}

export function signIdFrom(pl: any): number {
  return Number(pl?.rasiId ?? pl?.signId ?? pl?.sign ?? 1);
}

export function wholeSignHouse(ascSignId: number, planetSignId: number): number {
  return relHouse(ascSignId as SignId, planetSignId as SignId);
}

export function getSignLabel(signId: number, lang: "ne" | "en" = "en"): string {
  return signLabel(signId, lang);
}

export function isRetrograde(pl: any): boolean {
  return Boolean(pl?.is_retrograde ?? pl?.retrograde ?? pl?.retro ?? false);
}

export function validateSignId(signId: number): boolean {
  return signId >= 1 && signId <= 12;
}

export function validateHouseNumber(house: number): boolean {
  return house >= 1 && house <= 12;
}