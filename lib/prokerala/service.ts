// lib/prokerala/service.ts
// Prokerala API service with data normalization

import axios from "axios";
import { 
  AstroData, 
  D1PlanetRow, 
  DivisionalBlock, 
  PlanetName, 
  ShadbalaRow, 
  DashaItem,
  AstroDataRequest 
} from "@/lib/astrology/types";
import { 
  toPlanet, 
  signIdFrom, 
  wholeSignHouse, 
  getSignLabel, 
  isRetrograde,
  validateSignId,
  validateHouseNumber 
} from "@/lib/astrology/util";

// Mock data for development - replace with real Prokerala API calls in production
const MOCK_ASTRO_DATA = {
  asc: { signId: 1, signLabel: "Aries" },
  d1: {
    planets: [
      { name: "Sun", rasiId: 5, longitude: 120.5, is_retrograde: false, house: 5 },
      { name: "Moon", rasiId: 4, longitude: 90.2, is_retrograde: false, house: 4 },
      { name: "Mars", rasiId: 1, longitude: 15.8, is_retrograde: false, house: 1 },
      { name: "Mercury", rasiId: 6, longitude: 150.3, is_retrograde: true, house: 6 },
      { name: "Jupiter", rasiId: 9, longitude: 250.7, is_retrograde: false, house: 9 },
      { name: "Venus", rasiId: 7, longitude: 200.1, is_retrograde: false, house: 7 },
      { name: "Saturn", rasiId: 10, longitude: 280.9, is_retrograde: false, house: 10 },
      { name: "Rahu", rasiId: 12, longitude: 350.4, is_retrograde: true, house: 12 },
      { name: "Ketu", rasiId: 6, longitude: 170.4, is_retrograde: true, house: 6 }
    ]
  },
  divisionals: [
    {
      type: "D9",
      planets: [
        { name: "Sun", rasiId: 1, house: 1 },
        { name: "Moon", rasiId: 2, house: 2 },
        { name: "Mars", rasiId: 3, house: 3 },
        { name: "Mercury", rasiId: 4, house: 4 },
        { name: "Jupiter", rasiId: 5, house: 5 },
        { name: "Venus", rasiId: 6, house: 6 },
        { name: "Saturn", rasiId: 7, house: 7 },
        { name: "Rahu", rasiId: 8, house: 8 },
        { name: "Ketu", rasiId: 9, house: 9 }
      ]
    },
    {
      type: "D10",
      planets: [
        { name: "Sun", rasiId: 2, house: 2 },
        { name: "Moon", rasiId: 3, house: 3 },
        { name: "Mars", rasiId: 4, house: 4 },
        { name: "Mercury", rasiId: 5, house: 5 },
        { name: "Jupiter", rasiId: 6, house: 6 },
        { name: "Venus", rasiId: 7, house: 7 },
        { name: "Saturn", rasiId: 8, house: 8 },
        { name: "Rahu", rasiId: 9, house: 9 },
        { name: "Ketu", rasiId: 10, house: 10 }
      ]
    }
  ],
  yogas: [
    { key: "gajakesari", label: "Gajakesari Yoga", factors: ["Jupiter", "Moon"] },
    { key: "budha_aditya", label: "Budha-Aditya Yoga", factors: ["Mercury", "Sun"] },
    { key: "raja_yoga", label: "Raja Yoga", factors: ["Jupiter", "Venus"] }
  ],
  doshas: [
    { key: "mangal_dosha", label: "Mangal Dosha", factors: ["Mars"] },
    { key: "kaal_sarp", label: "Kaal Sarp Dosha", factors: ["Rahu", "Ketu"] }
  ],
  shadbala: [
    { planet: "Sun", value: 1.2, unit: "rupa", components: [
      { name: "Sthana Bala", value: 0.8 },
      { name: "Dik Bala", value: 0.4 }
    ]},
    { planet: "Moon", value: 0.9, unit: "rupa", components: [
      { name: "Sthana Bala", value: 0.6 },
      { name: "Dik Bala", value: 0.3 }
    ]},
    { planet: "Mars", value: 1.1, unit: "rupa" },
    { planet: "Mercury", value: 1.3, unit: "rupa" },
    { planet: "Jupiter", value: 1.4, unit: "rupa" },
    { planet: "Venus", value: 1.0, unit: "rupa" },
    { planet: "Saturn", value: 0.8, unit: "rupa" },
    { planet: "Rahu", value: 0.7, unit: "rupa" },
    { planet: "Ketu", value: 0.7, unit: "rupa" }
  ],
  dasha: {
    vimshottari: {
      current: { planet: "Jupiter", from: "2023-01-01", to: "2039-01-01" },
      maha: [
        { planet: "Jupiter", from: "2023-01-01", to: "2039-01-01" },
        { planet: "Saturn", from: "2039-01-01", to: "2058-01-01" }
      ],
      antar: [
        { planet: "Jupiter", from: "2023-01-01", to: "2025-01-01" },
        { planet: "Saturn", from: "2025-01-01", to: "2027-01-01" }
      ]
    },
    yogini: {
      current: { planet: "Sankata", from: "2023-01-01", to: "2024-01-01" },
      timeline: [
        { planet: "Sankata", from: "2023-01-01", to: "2024-01-01" },
        { planet: "Pingala", from: "2024-01-01", to: "2025-01-01" }
      ]
    }
  }
};

export async function fetchAstroRaw(params: AstroDataRequest): Promise<any> {
  // TODO: Replace with real Prokerala API calls
  // For now, return mock data for development
  
  console.log("Fetching astro data with params:", params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In production, this would be:
  // const response = await axios.post('https://api.prokerala.com/v2/astrology/birth-chart', {
  //   ayanamsa: 1,
  //   coordinates: `${params.latitude},${params.longitude}`,
  //   datetime: `${params.birthDate}T${params.birthTime}`,
  //   // ... other parameters
  // });
  // return response.data;
  
  return MOCK_ASTRO_DATA;
}

export function normalizeD1(ascSignId: number, planetsAny: any[], lang: "ne" | "en" = "en"): D1PlanetRow[] {
  const rows: D1PlanetRow[] = planetsAny.map((pl) => {
    const signId = signIdFrom(pl);
    const planet = toPlanet(pl);
    const retro = isRetrograde(pl);
    
    // Use provided house or calculate from sign
    const house = pl?.house ?? (validateSignId(signId) ? wholeSignHouse(ascSignId, signId) : 1);
    
    return {
      planet,
      signId: validateSignId(signId) ? signId : 1,
      signLabel: getSignLabel(validateSignId(signId) ? signId : 1, lang),
      house: validateHouseNumber(house) ? house : 1,
      retro,
    } as D1PlanetRow;
  }).filter(r => r.planet && validateSignId(r.signId) && validateHouseNumber(r.house));

  // De-dup preference: entries having both house & sign
  const key = (r: D1PlanetRow) => `${r.planet}-${r.signId}-${r.house}`;
  const map = new Map<string, D1PlanetRow>();
  for (const r of rows) {
    if (!map.has(key(r))) {
      map.set(key(r), r);
    }
  }
  
  return Array.from(map.values());
}

export function normalizeDivisionals(ascSignId: number, blocks: any[], lang: "ne" | "en" = "en"): DivisionalBlock[] {
  return (blocks ?? []).map((b) => {
    const type = String(b?.type ?? b?.chartType).toUpperCase();
    const planets = (b?.planets ?? b?.data ?? []).map((pl: any) => {
      const signId = signIdFrom(pl);
      return {
        planet: toPlanet(pl),
        signId: validateSignId(signId) ? signId : 1,
        signLabel: getSignLabel(validateSignId(signId) ? signId : 1, lang),
        house: pl?.house ?? (validateSignId(signId) ? wholeSignHouse(ascSignId, signId) : 1),
      };
    }).filter((r: any) => r.planet && validateSignId(r.signId) && validateHouseNumber(r.house));
    
    return { type, planets } as DivisionalBlock;
  }).filter(d => ["D2","D7","D9","D10"].includes(d.type));
}

export function normalizeShadbala(rows: any[]): ShadbalaRow[] {
  return (rows ?? []).map((r) => ({
    planet: toPlanet(r),
    value: Number(r?.value ?? r?.total ?? 0),
    unit: r?.unit ?? r?.u ?? "rupa",
    components: (r?.components ?? r?.parts ?? []).map((c: any) => ({
      name: c?.name ?? c?.k ?? "Unknown",
      value: Number(c?.value ?? c?.v ?? 0),
      unit: c?.unit,
    })),
  })).filter(r => r.planet);
}

export function normalizeDashas(v: any): DashaItem[] {
  const out: DashaItem[] = [];
  
  const push = (system: "Vimshottari"|"Yogini", level: DashaItem["level"], it: any) => {
    if (!it?.planet) return;
    
    out.push({
      system, 
      level,
      planet: toPlanet(it),
      from: new Date(it?.from ?? it?.start ?? Date.now()).toISOString(),
      to: new Date(it?.to ?? it?.end ?? Date.now()).toISOString(),
    });
  };
  
  // Vimshottari Dasha
  for (const m of v?.vimshottari?.maha ?? []) push("Vimshottari", "maha", m);
  for (const a of v?.vimshottari?.antar ?? []) push("Vimshottari", "antar", a);
  if (v?.vimshottari?.current) push("Vimshottari", "current", v.vimshottari.current);
  
  // Yogini Dasha
  for (const m of v?.yogini?.timeline ?? []) push("Yogini", "maha", m);
  if (v?.yogini?.current) push("Yogini", "current", v.yogini.current);
  
  return out;
}

export async function getAstroData(params: AstroDataRequest = {}): Promise<AstroData> {
  const { lang = "ne" } = params;
  
  const raw = await fetchAstroRaw(params);
  const ascSignId = Number(raw?.asc?.signId ?? raw?.asc_sign_id ?? 1);
  
  return {
    ascSignId,
    ascSignLabel: getSignLabel(ascSignId, lang),
    d1: normalizeD1(ascSignId, raw?.d1?.planets ?? raw?.planets ?? [], lang),
    divisionals: normalizeDivisionals(ascSignId, raw?.divisionals ?? [], lang),
    yogas: (raw?.yogas ?? []).map((y: any) => ({ 
      key: y?.key ?? y?.id ?? "unknown", 
      label: y?.label ?? y?.name ?? "Unknown Yoga", 
      factors: y?.factors ?? [] 
    })),
    doshas: (raw?.doshas ?? []).map((d: any) => ({ 
      key: d?.key ?? d?.id ?? "unknown", 
      label: d?.label ?? d?.name ?? "Unknown Dosha", 
      factors: d?.factors ?? [] 
    })),
    shadbala: normalizeShadbala(raw?.shadbala ?? []),
    dashas: normalizeDashas(raw?.dasha ?? {}),
    lang,
  };
}