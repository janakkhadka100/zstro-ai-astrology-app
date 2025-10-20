// lib/astro/gocharService.ts
// Transit (Gochar) service for fetching planetary positions

import { buildTransitPayload, validatePayload } from "./payload";
import { getUserById } from "@/lib/db/queries";
import { DateTime } from "luxon";
import { cacheTransitData, getCachedTransitData } from "@/lib/cache/transit";

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
    // Call Prokerala API for transit positions
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: date,
        location: user.place.place || 'Kathmandu, Nepal',
        includeTransits: true,
        includeDasha: false // We'll get dasha separately
      })
    });

    if (!response.ok) {
      throw new Error(`Prokerala API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize the transit data
    const normalizedData = normalizeTransit(data, user.place.iana_tz, date);
    
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
  const ascendant = raw.ascendant || { sign: 'Unknown', degree: 0 };
  
  // Extract planetary positions
  const transitPlanets = raw.transits || raw.planets || [];
  
  for (const planet of transitPlanets) {
    const normalized: TransitPlanet = {
      planet: planet.planet || planet.name || 'Unknown',
      sign: planet.sign || planet.rasi?.name || 'Unknown',
      degree: planet.degree || planet.deg || 0,
      speed: planet.speed || 0,
      houseWS: calculateWholeSignHouse(planet.degree || 0, ascendant.degree || 0),
      aspects: [], // Will be calculated separately
      isBenefic: isBeneficPlanet(planet.planet || planet.name)
    };
    
    planets.push(normalized);
  }

  return {
    date,
    planets,
    ascendant: {
      sign: ascendant.sign || 'Unknown',
      degree: ascendant.degree || 0
    },
    metadata: {
      location: raw.location || 'Unknown',
      timezone,
      calculationTime: new Date().toISOString()
    }
  };
}

/**
 * Calculate Whole-Sign house from planet degree and ascendant degree
 * @param planetDegree - Planet's degree (0-360)
 * @param ascDegree - Ascendant's degree (0-360)
 * @returns House number (1-12)
 */
function calculateWholeSignHouse(planetDegree: number, ascDegree: number): number {
  const diff = (planetDegree - ascDegree + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

/**
 * Check if planet is benefic
 * @param planetName - Planet name
 * @returns True if benefic
 */
function isBeneficPlanet(planetName: string): boolean {
  const beneficPlanets = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  return beneficPlanets.includes(planetName);
}

/**
 * Calculate aspects between transit planets and natal planets
 * @param transitPlanets - Current transit planets
 * @param natalPlanets - User's natal planets
 * @returns Array of aspects
 */
export function calculateTransitAspects(
  transitPlanets: TransitPlanet[],
  natalPlanets: any[]
): TransitAspect[] {
  const aspects: TransitAspect[] = [];
  
  for (const transit of transitPlanets) {
    for (const natal of natalPlanets) {
      const orb = Math.abs(transit.degree - natal.degree);
      const aspect = getAspectType(orb);
      
      if (aspect && orb <= getMaxOrb(aspect)) {
        aspects.push({
          natalPlanet: natal.planet || natal.name,
          aspect,
          orb,
          strength: getAspectStrength(orb, aspect)
        });
      }
    }
  }
  
  return aspects;
}

/**
 * Determine aspect type from orb
 * @param orb - Orb in degrees
 * @returns Aspect type or null
 */
function getAspectType(orb: number): string | null {
  const normalizedOrb = orb % 360;
  
  if (normalizedOrb <= 8) return 'conjunction';
  if (Math.abs(normalizedOrb - 180) <= 8) return 'opposition';
  if (Math.abs(normalizedOrb - 120) <= 8) return 'trine';
  if (Math.abs(normalizedOrb - 90) <= 8) return 'square';
  if (Math.abs(normalizedOrb - 60) <= 8) return 'sextile';
  
  return null;
}

/**
 * Get maximum orb for aspect type
 * @param aspect - Aspect type
 * @returns Maximum orb in degrees
 */
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

/**
 * Determine aspect strength from orb
 * @param orb - Orb in degrees
 * @param aspect - Aspect type
 * @returns Strength level
 */
function getAspectStrength(orb: number, aspect: string): 'strong' | 'medium' | 'weak' {
  const maxOrb = getMaxOrb(aspect);
  const ratio = orb / maxOrb;
  
  if (ratio <= 0.5) return 'strong';
  if (ratio <= 0.8) return 'medium';
  return 'weak';
}
