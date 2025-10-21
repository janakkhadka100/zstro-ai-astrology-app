// lib/astro/gocharService.ts
// Transit (Gochar) service for fetching planetary positions

import { buildTransitPayload, validatePayload } from "./payload";
import { getUserById } from "@/lib/db/queries";
import { DateTime } from "luxon";
import { cacheTransitData, getCachedTransitData } from "@/lib/cache/transit";
import { 
  fetchTransitPositions, 
  calculateWholeSignHouse, 
  isBeneficPlanet,
  calculateTransitAspects 
} from "@/lib/prokerala/transit";

export interface TransitPlanet {
  planet: string;
  sign: string;
  degree: number;
  speed: number; // degrees per day
  houseWS: number; // Whole-Sign house (1-12)
  aspects: TransitAspect[];
  isPeriodRuler?: boolean; // Mahadasha/Antar ruler
  isBenefic?: boolean;
}

export interface TransitAspect {
  natalPlanet: string;
  aspect: string; // conjunction, opposition, trine, square, sextile
  orb: number; // degrees
  strength: 'strong' | 'medium' | 'weak';
}

export interface TransitData {
  date: string;
  planets: TransitPlanet[];
  ascendant: {
    sign: string;
    degree: number;
  };
  metadata: {
    location: string;
    timezone: string;
    calculationTime: string;
  };
}

/**
 * Fetch transit positions for a specific date
 * @param userId - User ID
 * @param isoDate - Date in ISO format (YYYY-MM-DD), defaults to today
 * @returns Normalized transit data
 */
export async function fetchTransitsForDate(userId: string, isoDate?: string): Promise<TransitData> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.place?.lat || !user.place?.lon || !user.place?.iana_tz) {
    throw new Error("Missing birth place data");
  }

  // Use provided date or today in user's timezone
  const date = isoDate ?? DateTime.now().setZone(user.place.iana_tz).toISODate();
  if (!date) {
    throw new Error("Invalid date");
  }

  // Check cache first
  const cachedData = await getCachedTransitData(userId, date);
  if (cachedData) {
    return cachedData;
  }

  // Build Prokerala payload
  const payload = buildTransitPayload({
    localDate: date,
    iana: user.place.iana_tz,
    lat: user.place.lat,
    lon: user.place.lon
  });

  // Validate payload
  const validation = validatePayload(payload);
  if (!validation.valid) {
    throw new Error(`Invalid payload: ${validation.error}`);
  }

  try {
    // Call Prokerala API for real transit positions
    const transitParams = {
      datetime: payload.datetime_utc,
      coordinates: `${payload.lat},${payload.lon}`,
      timezone: payload.tz_name,
      place: user.place.place || 'Kathmandu, Nepal'
    };

    const transitData = await fetchTransitPositions(transitParams);
    
    // Normalize the transit data
    const normalizedData = normalizeTransit(transitData, user.place.iana_tz, date);
    
    // Cache the result
    await cacheTransitData(userId, date, normalizedData);
    
    return normalizedData;

  } catch (error) {
    console.error('Error fetching transits:', error);
    throw new Error(`Failed to fetch transit data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize raw Prokerala transit data to our format
 * @param raw - Raw Prokerala response
 * @param timezone - User's timezone
 * @param date - Calculation date
 * @returns Normalized transit data
 */
function normalizeTransit(raw: any, timezone: string, date: string): TransitData {
  const planets: TransitPlanet[] = [];
  const ascendant = raw.ascendant || { longitude: 0 };
  
  // Calculate ascendant sign from longitude
  const ascSignId = Math.floor(ascendant.longitude / 30) + 1;
  const ascSignLabel = getSignLabel(ascSignId);
  
  // Extract planetary positions
  const transitPlanets = raw.planets || [];
  
  for (const planet of transitPlanets) {
    const houseWS = calculateWholeSignHouse(planet.longitude, ascendant.longitude);
    
    const normalized: TransitPlanet = {
      planet: planet.planet || 'Unknown',
      sign: planet.rasiName || 'Unknown',
      degree: planet.longitude || 0,
      speed: planet.speed || 0,
      houseWS,
      aspects: [], // Will be calculated separately
      isBenefic: isBeneficPlanet(planet.planet)
    };
    
    planets.push(normalized);
  }

  return {
    date,
    planets,
    ascendant: {
      sign: ascSignLabel,
      degree: ascendant.longitude || 0
    },
    metadata: {
      location: raw.location || 'Unknown',
      timezone,
      calculationTime: new Date().toISOString()
    }
  };
}


/**
 * Get sign label from sign ID
 * @param signId - Sign ID (1-12)
 * @returns Sign label
 */
function getSignLabel(signId: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signId - 1] || 'Unknown';
}
