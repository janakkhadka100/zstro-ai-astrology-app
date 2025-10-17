// lib/source/prokerala.ts
// Scoped Prokerala API fetchers for on-demand data

import { FetchPlan, AstroPatch, DashaItem, DivisionalBlock, ShadbalaRow, YogaItem, DoshaItem } from '@/lib/astrology/types';
import { getSignLabel } from '@/lib/astrology/util';

export async function fetchScopedData(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  plans: FetchPlan[],
  lang: "ne" | "en" = "ne"
): Promise<AstroPatch> {
  const patch: AstroPatch = {
    set: {},
    provenance: { prokerala: [] }
  };

  for (const plan of plans) {
    try {
      switch (plan.kind) {
        case "vimshottari":
          const vimshottariData = await fetchVimshottari(profile, plan.levels || [], lang);
          if (vimshottariData.length > 0) {
            patch.set!.dashas = [...(patch.set!.dashas || []), ...vimshottariData];
            patch.provenance!.prokerala.push(`dashas.vimshottari.${plan.levels?.join(',') || 'all'}`);
          }
          break;
          
        case "yogini":
          const yoginiData = await fetchYogini(profile, plan.levels || [], lang);
          if (yoginiData.length > 0) {
            patch.set!.dashas = [...(patch.set!.dashas || []), ...yoginiData];
            patch.provenance!.prokerala.push(`dashas.yogini.${plan.levels?.join(',') || 'all'}`);
          }
          break;
          
        case "divisionals":
          const divisionalData = await fetchDivisionals(profile, plan.list || [], lang);
          if (divisionalData.length > 0) {
            patch.set!.divisionals = [...(patch.set!.divisionals || []), ...divisionalData];
            patch.provenance!.prokerala.push(`divisionals.${plan.list?.join(',') || 'all'}`);
          }
          break;
          
        case "shadbala":
          const shadbalaData = await fetchShadbalaDetail(profile, lang);
          if (shadbalaData.length > 0) {
            patch.set!.shadbala = shadbalaData;
            patch.provenance!.prokerala.push("shadbala.detail");
          }
          break;
          
        case "yogas":
          const yogaData = await fetchYogasDetail(profile, lang);
          if (yogaData.length > 0) {
            patch.set!.yogas = [...(patch.set!.yogas || []), ...yogaData];
            patch.provenance!.prokerala.push("yogas.detail");
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${plan.kind}:`, error);
      // Continue with other plans even if one fails
    }
  }

  return patch;
}

async function fetchVimshottari(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  levels: ("maha" | "antar" | "pratyantar" | "current")[],
  lang: "ne" | "en"
): Promise<DashaItem[]> {
  // Mock implementation - in real app, this would call Prokerala API
  console.log(`Fetching Vimshottari dasha for levels: ${levels.join(', ')}`);
  
  const dashas: DashaItem[] = [];
  
  if (levels.includes("maha")) {
    dashas.push({
      system: "Vimshottari",
      level: "maha",
      planet: "Jupiter",
      from: "2023-01-01T00:00:00.000Z",
      to: "2039-01-01T00:00:00.000Z"
    });
  }
  
  if (levels.includes("antar")) {
    dashas.push({
      system: "Vimshottari",
      level: "antar",
      planet: "Saturn",
      from: "2024-01-01T00:00:00.000Z",
      to: "2027-01-01T00:00:00.000Z"
    });
  }
  
  if (levels.includes("pratyantar")) {
    dashas.push({
      system: "Vimshottari",
      level: "pratyantar",
      planet: "Mercury",
      from: "2024-06-01T00:00:00.000Z",
      to: "2025-06-01T00:00:00.000Z"
    });
  }
  
  return dashas;
}

async function fetchYogini(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  levels: ("maha" | "antar" | "pratyantar" | "current")[],
  lang: "ne" | "en"
): Promise<DashaItem[]> {
  // Mock implementation - in real app, this would call Prokerala API
  console.log(`Fetching Yogini dasha for levels: ${levels.join(', ')}`);
  
  const dashas: DashaItem[] = [];
  
  if (levels.includes("maha")) {
    dashas.push({
      system: "Yogini",
      level: "maha",
      planet: "Sun",
      from: "2024-01-01T00:00:00.000Z",
      to: "2025-01-01T00:00:00.000Z"
    });
  }
  
  if (levels.includes("current")) {
    dashas.push({
      system: "Yogini",
      level: "current",
      planet: "Sun",
      from: "2024-01-01T00:00:00.000Z",
      to: "2025-01-01T00:00:00.000Z"
    });
  }
  
  return dashas;
}

async function fetchDivisionals(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  charts: ("D2" | "D7" | "D9" | "D10")[],
  lang: "ne" | "en"
): Promise<DivisionalBlock[]> {
  // Mock implementation - in real app, this would call Prokerala API
  console.log(`Fetching divisional charts: ${charts.join(', ')}`);
  
  const blocks: DivisionalBlock[] = [];
  
  for (const chart of charts) {
    blocks.push({
      type: chart,
      planets: [
        { planet: "Sun", signId: 1, signLabel: getSignLabel(1, lang), house: 1 },
        { planet: "Moon", signId: 2, signLabel: getSignLabel(2, lang), house: 2 },
        { planet: "Mars", signId: 3, signLabel: getSignLabel(3, lang), house: 3 },
        { planet: "Mercury", signId: 4, signLabel: getSignLabel(4, lang), house: 4 },
        { planet: "Jupiter", signId: 5, signLabel: getSignLabel(5, lang), house: 5 },
        { planet: "Venus", signId: 6, signLabel: getSignLabel(6, lang), house: 6 },
        { planet: "Saturn", signId: 7, signLabel: getSignLabel(7, lang), house: 7 },
        { planet: "Rahu", signId: 8, signLabel: getSignLabel(8, lang), house: 8 },
        { planet: "Ketu", signId: 9, signLabel: getSignLabel(9, lang), house: 9 },
      ]
    });
  }
  
  return blocks;
}

async function fetchShadbalaDetail(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  lang: "ne" | "en"
): Promise<ShadbalaRow[]> {
  // Mock implementation - in real app, this would call Prokerala API
  console.log("Fetching detailed Shadbala data");
  
  return [
    {
      planet: "Sun",
      value: 1.2,
      unit: "rupa",
      components: [
        { name: "Sthana Bala", value: 0.8 },
        { name: "Dig Bala", value: 0.2 },
        { name: "Kala Bala", value: 0.1 },
        { name: "Chesta Bala", value: 0.1 }
      ]
    },
    {
      planet: "Moon",
      value: 0.9,
      unit: "rupa",
      components: [
        { name: "Sthana Bala", value: 0.6 },
        { name: "Dig Bala", value: 0.1 },
        { name: "Kala Bala", value: 0.1 },
        { name: "Chesta Bala", value: 0.1 }
      ]
    },
    {
      planet: "Mars",
      value: 1.5,
      unit: "rupa",
      components: [
        { name: "Sthana Bala", value: 1.0 },
        { name: "Dig Bala", value: 0.3 },
        { name: "Kala Bala", value: 0.1 },
        { name: "Chesta Bala", value: 0.1 }
      ]
    }
  ];
}

async function fetchYogasDetail(
  profile: { birthDate?: string; birthTime?: string; tz?: string; lat?: number; lon?: number },
  lang: "ne" | "en"
): Promise<YogaItem[]> {
  // Mock implementation - in real app, this would call Prokerala API
  console.log("Fetching detailed Yogas data");
  
  return [
    { key: "gajakesari", label: "Gajakesari Yoga", factors: ["Jupiter", "Moon"] },
    { key: "rajyoga", label: "Raj Yoga", factors: ["Sun", "Moon"] },
    { key: "panchmahapurush", label: "Panch Mahapurush Yoga", factors: ["Sun", "Moon", "Mars", "Mercury", "Jupiter"] },
    { key: "vipareeta", label: "Vipareeta Rajyoga", factors: ["Saturn", "Mars"] }
  ];
}

// Cache management
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(profile: any, scope: string): string {
  const profileHash = JSON.stringify({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    tz: profile.tz,
    lat: profile.lat,
    lon: profile.lon
  });
  return `${profileHash}:${scope}`;
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchWithCache<T>(
  profile: any,
  scope: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = getCacheKey(profile, scope);
  const cached = getCachedData(key);
  
  if (cached) {
    console.log(`Cache hit for ${scope}`);
    return cached;
  }
  
  console.log(`Cache miss for ${scope}, fetching...`);
  const data = await fetcher();
  setCachedData(key, data);
  return data;
}
