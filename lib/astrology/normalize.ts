import { PlanetName, SignId, D1PlanetRow, DivisionalBlock, DashaItem, YoginiItem, ShadbalaItem } from './types';

// Normalize D1 planets from Prokerala response
export function normalizeD1(
  ascSignId: SignId,
  planets: Array<{
    planet: PlanetName;
    longitude: number;
    latitude: number;
    isRetrograde: boolean;
    house: number;
    rasiId: number;
    rasiName: string;
  }>
): D1PlanetRow[] {
  return planets.map(planet => {
    // Use rasiId if available, otherwise calculate from longitude
    const signId = planet.rasiId ? (planet.rasiId as SignId) : 
      (Math.floor(planet.longitude / 30) + 1 as SignId);
    
    // Use provided house or calculate whole-sign house from ascendant
    const house = planet.house || wholeSignHouse(ascSignId, signId);
    
    return {
      planet: planet.planet,
      signId,
      signLabel: planet.rasiName || getSignLabel(signId),
      house: house as 1|2|3|4|5|6|7|8|9|10|11|12,
      retro: planet.isRetrograde,
    };
  });
}

// Normalize dashas from Prokerala response
export function normalizeDashas(
  dashas: Array<{
    id: number;
    name: string;
    start: string;
    end: string;
    level: 'maha' | 'antar' | 'pratyantar' | 'current';
  }>
): DashaItem[] {
  return dashas.map(dasha => ({
    system: 'Vimshottari' as const,
    level: dasha.level,
    planet: dasha.name as PlanetName,
    from: dasha.start,
    to: dasha.end,
  }));
}

// Normalize Yogini dashas from Prokerala response
export function normalizeYogini(
  yogini: Array<{
    id: number;
    name: string;
    start: string;
    end: string;
    level: 'current' | 'maha';
  }>
): YoginiItem[] {
  return yogini.map(y => ({
    level: y.level,
    planet: y.name as PlanetName,
    from: y.start,
    to: y.end,
  }));
}

// Normalize Shadbala from Prokerala response
export function normalizeShadbala(
  shadbala: Array<{
    planet: PlanetName;
    total: number;
    components: {
      sthana: number;
      dig: number;
      kala: number;
      cheshta: number;
      naisargika: number;
      drik: number;
    };
  }>
): ShadbalaItem[] {
  return shadbala.map(s => ({
    planet: s.planet,
    value: s.total,
    unit: 'points',
    components: s.components,
  }));
}

// Helper function to calculate whole-sign house from ascendant
function wholeSignHouse(ascSignId: SignId, planetSignId: SignId): number {
  const house = ((planetSignId - ascSignId + 12) % 12) + 1;
  return house as 1|2|3|4|5|6|7|8|9|10|11|12;
}

// Helper function to get sign label
function getSignLabel(signId: SignId): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signId - 1] || 'Unknown';
}

