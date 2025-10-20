// lib/ai/planetaryContext.ts
import { getUserById } from '@/lib/db/queries';
import { kv } from '@vercel/kv';

export interface PlanetaryContext {
  date: string;
  planets: {
    name: string;
    sign: string;
    house: number;
    degree: number;
    nakshatra?: string;
    nakshatraLord?: string;
  }[];
  dasha: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha?: string;
  };
  transits: {
    planet: string;
    sign: string;
    house: number;
    degree: number;
    aspecting: number[];
  }[];
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
}

/**
 * Get planetary context for a specific date
 */
export async function getPlanetaryContext(
  userId: string, 
  eventDate: string, 
  eventLocation?: string
): Promise<PlanetaryContext | null> {
  try {
    // KV cache (30 days)
    const cacheKey = `planetary:${userId}:${eventDate}`;
    const cached = await kv.get<PlanetaryContext>(cacheKey);
    if (cached) return cached;

    const user = await getUserById(userId);
    if (!user) return null;

    // Use user's birth place or provided location
    const location = eventLocation || user.place || 'Kathmandu, Nepal';
    
    // Parse event date
    const date = new Date(eventDate);
    if (isNaN(date.getTime())) return null;

    // Call Prokerala API for planetary positions
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: eventDate,
        location: location,
        includeTransits: true,
        includeDasha: true
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    // Extract planetary positions
    const planets = (data.planets || []).map((p: any) => ({
      name: p.planet || p.name,
      sign: p.signLabel || p.rasi?.name || p.sign,
      house: p.house || p.house?.num || 0,
      degree: p.degree || p.deg || 0,
      nakshatra: p.nakshatra?.name,
      nakshatraLord: p.nakshatra?.lord
    }));

    // Extract dasha information
    const dasha = {
      mahadasha: data.currentDasha?.mahadasha || 'Unknown',
      antardasha: data.currentDasha?.antardasha || 'Unknown',
      pratyantardasha: data.currentDasha?.pratyantardasha
    };

    // Extract transits
    const transits = (data.transits || []).map((t: any) => ({
      planet: t.planet || t.name,
      sign: t.sign || t.rasi?.name,
      house: t.house || 0,
      degree: t.degree || 0,
      aspecting: t.aspecting || []
    }));

    // Extract panchanga
    const panchanga = data.panchanga || {};
    
    const ctx: PlanetaryContext = {
      date: eventDate,
      planets,
      dasha,
      transits,
      tithi: panchanga.tithi?.name,
      nakshatra: panchanga.nakshatra?.name,
      yoga: panchanga.yoga?.name,
      karana: panchanga.karana?.name
    };

    await kv.set(cacheKey, ctx, { ex: 60 * 60 * 24 * 30 }); // 30 days
    return ctx;

  } catch (error) {
    console.error('Error getting planetary context:', error);
    return null;
  }
}

/**
 * Get planetary context for multiple dates
 */
export async function getPlanetaryContexts(
  userId: string, 
  dates: string[]
): Promise<Record<string, PlanetaryContext | null>> {
  const contexts: Record<string, PlanetaryContext | null> = {};
  
  for (const date of dates) {
    contexts[date] = await getPlanetaryContext(userId, date);
  }
  
  return contexts;
}

/**
 * Analyze planetary patterns in events
 */
export function analyzePlanetaryPatterns(
  events: Array<{ event: any; context: PlanetaryContext | null }>
): {
  commonPlanets: string[];
  commonHouses: number[];
  commonSigns: string[];
  dashaPatterns: string[];
  transitPatterns: string[];
} {
  const planetCounts = new Map<string, number>();
  const houseCounts = new Map<number, number>();
  const signCounts = new Map<string, number>();
  const dashaCounts = new Map<string, number>();
  const transitCounts = new Map<string, number>();

  events.forEach(({ event, context }) => {
    if (!context) return;

    // Count planets in specific houses
    context.planets.forEach(planet => {
      const key = `${planet.name}-${planet.house}`;
      planetCounts.set(key, (planetCounts.get(key) || 0) + 1);
      houseCounts.set(planet.house, (houseCounts.get(planet.house) || 0) + 1);
      signCounts.set(planet.sign, (signCounts.get(planet.sign) || 0) + 1);
    });

    // Count dasha patterns
    const dashaKey = `${context.dasha.mahadasha}-${context.dasha.antardasha}`;
    dashaCounts.set(dashaKey, (dashaCounts.get(dashaKey) || 0) + 1);

    // Count transit patterns
    context.transits.forEach(transit => {
      const key = `${transit.planet}-${transit.house}`;
      transitCounts.set(key, (transitCounts.get(key) || 0) + 1);
    });
  });

  // Get most common patterns
  const commonPlanets = Array.from(planetCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  const commonHouses = Array.from(houseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([house]) => house);

  const commonSigns = Array.from(signCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sign]) => sign);

  const dashaPatterns = Array.from(dashaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pattern]) => pattern);

  const transitPatterns = Array.from(transitCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern]) => pattern);

  return {
    commonPlanets,
    commonHouses,
    commonSigns,
    dashaPatterns,
    transitPatterns
  };
}

/**
 * Find similar planetary configurations
 */
export function findSimilarConfigurations(
  targetContext: PlanetaryContext,
  historicalContexts: PlanetaryContext[],
  threshold: number = 0.7
): Array<{ context: PlanetaryContext; similarity: number }> {
  const similarities: Array<{ context: PlanetaryContext; similarity: number }> = [];

  historicalContexts.forEach(context => {
    const similarity = calculatePlanetarySimilarity(targetContext, context);
    if (similarity >= threshold) {
      similarities.push({ context, similarity });
    }
  });

  return similarities.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate similarity between two planetary contexts
 */
function calculatePlanetarySimilarity(
  context1: PlanetaryContext,
  context2: PlanetaryContext
): number {
  let score = 0;
  let total = 0;

  // Compare planets in houses
  const planets1 = new Map(context1.planets.map(p => [`${p.name}-${p.house}`, p]));
  const planets2 = new Map(context2.planets.map(p => [`${p.name}-${p.house}`, p]));

  const allKeys = new Set([...planets1.keys(), ...planets2.keys()]);
  
  allKeys.forEach(key => {
    total++;
    if (planets1.has(key) && planets2.has(key)) {
      score += 1;
    } else if (planets1.has(key) || planets2.has(key)) {
      score += 0.3; // Partial match
    }
  });

  // Compare dasha
  if (context1.dasha.mahadasha === context2.dasha.mahadasha) {
    score += 2;
    total += 2;
  }

  if (context1.dasha.antardasha === context2.dasha.antardasha) {
    score += 1;
    total += 1;
  }

  return total > 0 ? score / total : 0;
}

/**
 * Get upcoming similar configurations
 */
export async function getUpcomingSimilarConfigurations(
  userId: string,
  targetContext: PlanetaryContext,
  days: number = 90
): Promise<Array<{ date: string; context: PlanetaryContext; similarity: number }>> {
  try {
    const upcomingDates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      upcomingDates.push(date.toISOString().split('T')[0]);
    }

    const upcomingContexts = await getPlanetaryContexts(userId, upcomingDates);
    const similarities: Array<{ date: string; context: PlanetaryContext; similarity: number }> = [];

    Object.entries(upcomingContexts).forEach(([date, context]) => {
      if (context) {
        const similarity = calculatePlanetarySimilarity(targetContext, context);
        if (similarity >= 0.6) {
          similarities.push({ date, context, similarity });
        }
      }
    });

    return similarities.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Error getting upcoming similar configurations:', error);
    return [];
  }
}
