// lib/prokerala/transit.ts
// Prokerala API service for transit (current planetary positions)

import { PlanetName, SignId } from '@/lib/astrology/types';

// Prokerala API response types for transit data
interface ProkeralaTransitResponse {
  data: {
    planets: Array<{
      name: string;
      longitude: number;
      latitude: number;
      is_retrograde: boolean;
      house: number;
      rasi: {
        id: number;
        name: string;
      };
      speed: number; // degrees per day
    }>;
    ascendant: {
      longitude: number;
      latitude: number;
    };
  };
}

interface ProkeralaTransitParams {
  datetime: string; // ISO datetime string
  coordinates: string; // "lat,lon" format
  timezone: string; // IANA timezone
  place?: string; // Optional place name
}

// Planet name mapping
const PLANET_MAP: Record<string, PlanetName> = {
  'Sun': 'Sun',
  'Moon': 'Moon',
  'Mars': 'Mars',
  'Mercury': 'Mercury',
  'Jupiter': 'Jupiter',
  'Venus': 'Venus',
  'Saturn': 'Saturn',
  'Rahu': 'Rahu',
  'Ketu': 'Ketu',
};

// Rasi to SignId mapping
const RASI_MAP: Record<number, SignId> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
  7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12
};

// Get Prokerala API base URL
function getProkeralaBaseUrl(): string {
  return process.env.PROKERALA_BASE_URL || 'https://api.prokerala.com/v2/astrology';
}

// Get Prokerala API key
function getProkeralaApiKey(): string {
  const apiKey = process.env.PROKERALA_API_KEY;
  if (!apiKey) {
    console.warn('PROKERALA_API_KEY not configured, using mock data');
    return 'mock'; // Return mock key to trigger fallback
  }
  return apiKey;
}

// Utility function for API calls with timeout and retry
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = 2,
  timeout: number = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && (error as Error).name !== 'AbortError') {
      console.warn(`API call failed, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry<T>(url, options, retries - 1, timeout);
    }
    
    throw error;
  }
}

// Build query parameters for transit API
function buildTransitQueryParams(params: ProkeralaTransitParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('datetime', params.datetime);
  searchParams.set('coordinates', params.coordinates);
  searchParams.set('timezone', params.timezone);
  if (params.place) {
    searchParams.set('place', params.place);
  }
  return searchParams;
}

// Fetch current planetary positions (transits)
export async function fetchTransitPositions(params: ProkeralaTransitParams): Promise<{
  planets: Array<{
    planet: PlanetName;
    longitude: number;
    latitude: number;
    isRetrograde: boolean;
    house: number;
    rasiId: number;
    rasiName: string;
    speed: number;
  }>;
  ascendant: {
    longitude: number;
    latitude: number;
  };
}> {
  const apiKey = getProkeralaApiKey();
  
  // If no API key, return mock data
  if (apiKey === 'mock') {
    return getMockTransitData(params);
  }

  const baseUrl = getProkeralaBaseUrl();
  const queryParams = buildTransitQueryParams(params);
  
  const url = `${baseUrl}/planets?${queryParams}&api_key=${apiKey}`;
  
  try {
    const response = await fetchWithRetry<ProkeralaTransitResponse>(url);
    
    return {
      planets: response.data.planets
        .filter(p => PLANET_MAP[p.name])
        .map(planet => ({
          planet: PLANET_MAP[planet.name],
          longitude: planet.longitude,
          latitude: planet.latitude,
          isRetrograde: planet.is_retrograde,
          house: planet.house,
          rasiId: planet.rasi.id,
          rasiName: planet.rasi.name,
          speed: planet.speed || 0,
        })),
      ascendant: response.data.ascendant,
    };
  } catch (error) {
    console.error('Prokerala API error, falling back to mock data:', error);
    return getMockTransitData(params);
  }
}

// Mock transit data for when API is not available
function getMockTransitData(params: ProkeralaTransitParams): {
  planets: Array<{
    planet: PlanetName;
    longitude: number;
    latitude: number;
    isRetrograde: boolean;
    house: number;
    rasiId: number;
    rasiName: string;
    speed: number;
  }>;
  ascendant: {
    longitude: number;
    latitude: number;
  };
} {
  // Generate realistic mock data based on current date
  const now = new Date(params.datetime);
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    planets: [
      { planet: 'Sun', longitude: (dayOfYear * 0.9856) % 360, latitude: 0, isRetrograde: false, house: 1, rasiId: 1, rasiName: 'Aries', speed: 0.9856 },
      { planet: 'Moon', longitude: (dayOfYear * 13.18) % 360, latitude: 0, isRetrograde: false, house: 4, rasiId: 4, rasiName: 'Cancer', speed: 13.18 },
      { planet: 'Mars', longitude: (dayOfYear * 0.524) % 360, latitude: 0, isRetrograde: false, house: 3, rasiId: 3, rasiName: 'Gemini', speed: 0.524 },
      { planet: 'Mercury', longitude: (dayOfYear * 1.38) % 360, latitude: 0, isRetrograde: false, house: 12, rasiId: 12, rasiName: 'Pisces', speed: 1.38 },
      { planet: 'Jupiter', longitude: (dayOfYear * 0.083) % 360, latitude: 0, isRetrograde: false, house: 9, rasiId: 9, rasiName: 'Sagittarius', speed: 0.083 },
      { planet: 'Venus', longitude: (dayOfYear * 1.2) % 360, latitude: 0, isRetrograde: false, house: 2, rasiId: 2, rasiName: 'Taurus', speed: 1.2 },
      { planet: 'Saturn', longitude: (dayOfYear * 0.033) % 360, latitude: 0, isRetrograde: false, house: 11, rasiId: 11, rasiName: 'Aquarius', speed: 0.033 },
      { planet: 'Rahu', longitude: (dayOfYear * -0.053) % 360, latitude: 0, isRetrograde: true, house: 8, rasiId: 8, rasiName: 'Scorpio', speed: -0.053 },
      { planet: 'Ketu', longitude: ((dayOfYear * -0.053) + 180) % 360, latitude: 0, isRetrograde: true, house: 2, rasiId: 2, rasiName: 'Taurus', speed: -0.053 }
    ],
    ascendant: {
      longitude: 150.0, // Leo ascendant
      latitude: 0
    }
  };
}

// Helper function to get sign label
function getSignLabel(signId: SignId): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signId - 1] || 'Unknown';
}

// Calculate Whole-Sign house from planet longitude and ascendant longitude
export function calculateWholeSignHouse(planetLongitude: number, ascendantLongitude: number): number {
  const diff = (planetLongitude - ascendantLongitude + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

// Check if planet is benefic
export function isBeneficPlanet(planet: PlanetName): boolean {
  const beneficPlanets: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  return beneficPlanets.includes(planet);
}

// Calculate aspects between transit planets and natal planets
export function calculateTransitAspects(
  transitPlanets: Array<{ planet: PlanetName; longitude: number }>,
  natalPlanets: Array<{ planet: PlanetName; longitude: number }>
): Array<{
  transitPlanet: PlanetName;
  natalPlanet: PlanetName;
  aspect: string;
  orb: number;
  strength: 'strong' | 'medium' | 'weak';
}> {
  const aspects: Array<{
    transitPlanet: PlanetName;
    natalPlanet: PlanetName;
    aspect: string;
    orb: number;
    strength: 'strong' | 'medium' | 'weak';
  }> = [];
  
  for (const transit of transitPlanets) {
    for (const natal of natalPlanets) {
      const orb = Math.abs(transit.longitude - natal.longitude);
      const aspect = getAspectType(orb);
      
      if (aspect && orb <= getMaxOrb(aspect)) {
        aspects.push({
          transitPlanet: transit.planet,
          natalPlanet: natal.planet,
          aspect,
          orb,
          strength: getAspectStrength(orb, aspect)
        });
      }
    }
  }
  
  return aspects;
}

// Determine aspect type from orb
function getAspectType(orb: number): string | null {
  const normalizedOrb = orb % 360;
  
  if (normalizedOrb <= 8) return 'conjunction';
  if (Math.abs(normalizedOrb - 180) <= 8) return 'opposition';
  if (Math.abs(normalizedOrb - 120) <= 8) return 'trine';
  if (Math.abs(normalizedOrb - 90) <= 8) return 'square';
  if (Math.abs(normalizedOrb - 60) <= 8) return 'sextile';
  
  return null;
}

// Get maximum orb for aspect type
function getMaxOrb(aspect: string): number {
  switch (aspect) {
    case 'conjunction':
    case 'opposition':
      return 8;
    case 'trine':
    case 'square':
      return 6;
    case 'sextile':
      return 4;
    default:
      return 2;
  }
}

// Determine aspect strength from orb
function getAspectStrength(orb: number, aspect: string): 'strong' | 'medium' | 'weak' {
  const maxOrb = getMaxOrb(aspect);
  const ratio = orb / maxOrb;
  
  if (ratio <= 0.5) return 'strong';
  if (ratio <= 0.8) return 'medium';
  return 'weak';
}
