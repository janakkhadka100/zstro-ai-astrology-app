import { PlanetName, SignId } from '@/lib/astrology/types';

// Prokerala API response types
interface ProkeralaBirthResponse {
  data: {
    ascendant: {
      longitude: number;
      latitude: number;
      timezone: string;
    };
    birth_details: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };
  };
}

interface ProkeralaD1Response {
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
    }>;
  };
}

interface ProkeralaDashaResponse {
  data: {
    vimshottari: Array<{
      id: number;
      name: string;
      start: string;
      end: string;
      level: string;
    }>;
  };
}

interface ProkeralaYoginiResponse {
  data: {
    yogini: Array<{
      id: number;
      name: string;
      start: string;
      end: string;
      level: string;
    }>;
  };
}

interface ProkeralaShadbalaResponse {
  data: {
    shadbala: Array<{
      planet: string;
      total: number;
      components: {
        sthana: number;
        dig: number;
        kala: number;
        cheshta: number;
        naisargika: number;
        drik: number;
      };
    }>;
  };
}

interface ProkeralaParams {
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM:SS
  lat: number;
  lon: number;
  tz: string;
  pob?: string;
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

// Dasha level mapping
const DASHA_LEVEL_MAP: Record<string, 'maha' | 'antar' | 'pratyantar' | 'current'> = {
  'maha': 'maha',
  'antar': 'antar',
  'pratyantar': 'pratyantar',
  'current': 'current'
};

// Yogini level mapping
const YOGINI_LEVEL_MAP: Record<string, 'current' | 'maha'> = {
  'current': 'current',
  'maha': 'maha'
};

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

// Get Prokerala API base URL
function getProkeralaBaseUrl(): string {
  return process.env.PROKERALA_BASE_URL || 'https://api.prokerala.com/v2/astrology';
}

// Get Prokerala API key
function getProkeralaApiKey(): string {
  const apiKey = process.env.PROKERALA_API_KEY;
  if (!apiKey) {
    throw new Error('PROKERALA_API_KEY environment variable is required');
  }
  return apiKey;
}

// Build query parameters
function buildQueryParams(params: ProkeralaParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('datetime', `${params.dob}T${params.tob}`);
  searchParams.set('coordinates', `${params.lat},${params.lon}`);
  searchParams.set('timezone', params.tz);
  if (params.pob) {
    searchParams.set('place', params.pob);
  }
  return searchParams;
}

// Fetch birth details and ascendant
export async function fetchBirth(params: ProkeralaParams): Promise<{
  ascSignId: SignId;
  ascSignLabel: string;
  birthDetails: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}> {
  const baseUrl = getProkeralaBaseUrl();
  const apiKey = getProkeralaApiKey();
  const queryParams = buildQueryParams(params);
  
  const url = `${baseUrl}/birth-details?${queryParams}&api_key=${apiKey}`;
  
  const response = await fetchWithRetry<ProkeralaBirthResponse>(url);
  
  const ascendant = response.data.ascendant;
  const birthDetails = response.data.birth_details;
  
  // Calculate ascendant sign from longitude
  const ascSignId = Math.floor(ascendant.longitude / 30) + 1 as SignId;
  const ascSignLabel = getSignLabel(ascSignId);
  
  return {
    ascSignId,
    ascSignLabel,
    birthDetails
  };
}

// Fetch D1 planets
export async function fetchD1(params: ProkeralaParams): Promise<Array<{
  planet: PlanetName;
  longitude: number;
  latitude: number;
  isRetrograde: boolean;
  house: number;
  rasiId: number;
  rasiName: string;
}>> {
  const baseUrl = getProkeralaBaseUrl();
  const apiKey = getProkeralaApiKey();
  const queryParams = buildQueryParams(params);
  
  const url = `${baseUrl}/planets?${queryParams}&api_key=${apiKey}`;
  
  const response = await fetchWithRetry<ProkeralaD1Response>(url);
  
  return response.data.planets
    .filter(p => PLANET_MAP[p.name])
    .map(planet => ({
      planet: PLANET_MAP[planet.name],
      longitude: planet.longitude,
      latitude: planet.latitude,
      isRetrograde: planet.is_retrograde,
      house: planet.house,
      rasiId: planet.rasi.id,
      rasiName: planet.rasi.name,
    }));
}

// Fetch Vimshottari dashas
export async function fetchDashas(params: ProkeralaParams): Promise<Array<{
  id: number;
  name: string;
  start: string;
  end: string;
  level: 'maha' | 'antar' | 'pratyantar' | 'current';
}>> {
  const baseUrl = getProkeralaBaseUrl();
  const apiKey = getProkeralaApiKey();
  const queryParams = buildQueryParams(params);
  
  const url = `${baseUrl}/dasha?${queryParams}&api_key=${apiKey}`;
  
  const response = await fetchWithRetry<ProkeralaDashaResponse>(url);
  
  return response.data.vimshottari.map(dasha => ({
    id: dasha.id,
    name: dasha.name,
    start: dasha.start,
    end: dasha.end,
    level: DASHA_LEVEL_MAP[dasha.level] || 'current',
  }));
}

// Fetch Yogini dashas
export async function fetchYogini(params: ProkeralaParams): Promise<Array<{
  id: number;
  name: string;
  start: string;
  end: string;
  level: 'current' | 'maha';
}>> {
  const baseUrl = getProkeralaBaseUrl();
  const apiKey = getProkeralaApiKey();
  const queryParams = buildQueryParams(params);
  
  const url = `${baseUrl}/yogini?${queryParams}&api_key=${apiKey}`;
  
  const response = await fetchWithRetry<ProkeralaYoginiResponse>(url);
  
  return response.data.yogini.map(yogini => ({
    id: yogini.id,
    name: yogini.name,
    start: yogini.start,
    end: yogini.end,
    level: YOGINI_LEVEL_MAP[yogini.level] || 'current',
  }));
}

// Fetch Shadbala
export async function fetchShadbala(params: ProkeralaParams): Promise<Array<{
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
}>> {
  const baseUrl = getProkeralaBaseUrl();
  const apiKey = getProkeralaApiKey();
  const queryParams = buildQueryParams(params);
  
  const url = `${baseUrl}/shadbala?${queryParams}&api_key=${apiKey}`;
  
  const response = await fetchWithRetry<ProkeralaShadbalaResponse>(url);
  
  return response.data.shadbala
    .filter(s => PLANET_MAP[s.planet])
    .map(shadbala => ({
      planet: PLANET_MAP[shadbala.planet],
      total: shadbala.total,
      components: shadbala.components,
    }));
}

// Helper function to get sign label
function getSignLabel(signId: SignId): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signId - 1] || 'Unknown';
}