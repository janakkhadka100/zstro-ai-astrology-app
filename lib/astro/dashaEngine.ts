// lib/astro/dashaEngine.ts
// Multi-Level Vimshottari Dasha System Engine

import { getUserById } from '@/lib/db/queries';

// Vimshottari Dasha periods (in years)
const VIMSHOTTARI_PERIODS = {
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17,
  'Ketu': 7,
  'Venus': 20
} as const;

// Dasha level names
const DASHA_LEVELS = {
  1: 'Maha',
  2: 'Antar', 
  3: 'Pratyantar',
  4: 'Sookshma',
  5: 'Pran'
} as const;

export interface DashaPeriod {
  level: number;
  planet: string;
  start: Date;
  end: Date;
  duration_days: number;
  level_name: string;
  is_active: boolean;
  parent?: string;
}

export interface DashaHierarchy {
  date: string;
  active_chain: DashaPeriod[];
  all_periods: DashaPeriod[];
  summary: {
    maha: string;
    antar: string;
    pratyantar: string;
    sookshma: string;
    pran: string;
  };
}

/**
 * Calculate sub-dasha periods based on Vimshottari ratios
 */
function calculateSubDashas(
  parentPeriod: DashaPeriod,
  level: number,
  planetaryOrder: string[]
): DashaPeriod[] {
  const subDashas: DashaPeriod[] = [];
  const totalDays = parentPeriod.duration_days;
  let currentStart = parentPeriod.start;

  for (const planet of planetaryOrder) {
    const planetYears = VIMSHOTTARI_PERIODS[planet as keyof typeof VIMSHOTTARI_PERIODS];
    const planetDays = Math.floor((totalDays * planetYears) / 120); // 120 is total Vimshottari years
    
    const subDasha: DashaPeriod = {
      level,
      planet,
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + planetDays * 24 * 60 * 60 * 1000),
      duration_days: planetDays,
      level_name: DASHA_LEVELS[level as keyof typeof DASHA_LEVELS],
      is_active: false,
      parent: parentPeriod.planet
    };
    
    subDashas.push(subDasha);
    currentStart = subDasha.end;
  }

  return subDashas;
}

/**
 * Expand dasha periods to all 5 levels
 */
function expandToAllLevels(baseDashas: any[]): DashaPeriod[] {
  const allDashas: DashaPeriod[] = [];
  
  // Planetary order for sub-dashas (starting from the ruling planet)
  const planetaryOrder = Object.keys(VIMSHOTTARI_PERIODS);
  
  // Convert base dashas to our format
  const mahaDashas: DashaPeriod[] = baseDashas.map((dasha: any) => ({
    level: 1,
    planet: dasha.name || dasha.planet,
    start: new Date(dasha.start),
    end: new Date(dasha.end),
    duration_days: Math.floor((new Date(dasha.end).getTime() - new Date(dasha.start).getTime()) / (24 * 60 * 60 * 1000)),
    level_name: 'Maha',
    is_active: false
  }));

  allDashas.push(...mahaDashas);

  // Generate sub-levels
  for (const mahaDasha of mahaDashas) {
    // Level 2: Antar Dashas
    const antarDashas = calculateSubDashas(mahaDasha, 2, planetaryOrder);
    allDashas.push(...antarDashas);

    // Level 3: Pratyantar Dashas
    for (const antarDasha of antarDashas) {
      const pratyantarDashas = calculateSubDashas(antarDasha, 3, planetaryOrder);
      allDashas.push(...pratyantarDashas);

      // Level 4: Sookshma Dashas
      for (const pratyantarDasha of pratyantarDashas) {
        const sookshmaDashas = calculateSubDashas(pratyantarDasha, 4, planetaryOrder);
        allDashas.push(...sookshmaDashas);

        // Level 5: Pran Dashas
        for (const sookshmaDasha of sookshmaDashas) {
          const pranDashas = calculateSubDashas(sookshmaDasha, 5, planetaryOrder);
          allDashas.push(...pranDashas);
        }
      }
    }
  }

  return allDashas;
}

/**
 * Find active dasha chain for a specific date
 */
function findActiveDashaChain(allDashas: DashaPeriod[], queryDate: Date): DashaPeriod[] {
  const activeChain: DashaPeriod[] = [];
  
  // Find active Maha Dasha
  const activeMaha = allDashas.find(d => 
    d.level === 1 && 
    queryDate >= d.start && 
    queryDate <= d.end
  );
  
  if (!activeMaha) return activeChain;
  
  activeChain.push({ ...activeMaha, is_active: true });
  
  // Find active Antar Dasha
  const activeAntar = allDashas.find(d => 
    d.level === 2 && 
    d.parent === activeMaha.planet &&
    queryDate >= d.start && 
    queryDate <= d.end
  );
  
  if (!activeAntar) return activeChain;
  
  activeChain.push({ ...activeAntar, is_active: true });
  
  // Find active Pratyantar Dasha
  const activePratyantar = allDashas.find(d => 
    d.level === 3 && 
    d.parent === activeAntar.planet &&
    queryDate >= d.start && 
    queryDate <= d.end
  );
  
  if (!activePratyantar) return activeChain;
  
  activeChain.push({ ...activePratyantar, is_active: true });
  
  // Find active Sookshma Dasha
  const activeSookshma = allDashas.find(d => 
    d.level === 4 && 
    d.parent === activePratyantar.planet &&
    queryDate >= d.start && 
    queryDate <= d.end
  );
  
  if (!activeSookshma) return activeChain;
  
  activeChain.push({ ...activeSookshma, is_active: true });
  
  // Find active Pran Dasha
  const activePran = allDashas.find(d => 
    d.level === 5 && 
    d.parent === activeSookshma.planet &&
    queryDate >= d.start && 
    queryDate <= d.end
  );
  
  if (activePran) {
    activeChain.push({ ...activePran, is_active: true });
  }
  
  return activeChain;
}

/**
 * Get full dasha hierarchy for a specific date
 */
export async function getFullDashaHierarchy(
  date: string, 
  userId: string
): Promise<DashaHierarchy | null> {
  try {
    const user = await getUserById(userId);
    if (!user) return null;

    // Fetch base dasha data from Prokerala
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: date,
        location: user.place || 'Kathmandu, Nepal',
        includeDasha: true,
        includeTransits: false
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const baseDashas = data.dashaPeriods || data.currentDasha || [];

    if (!Array.isArray(baseDashas) || baseDashas.length === 0) {
      return null;
    }

    // Expand to all 5 levels
    const allDashas = expandToAllLevels(baseDashas);
    
    // Find active chain for the query date
    const queryDate = new Date(date);
    const activeChain = findActiveDashaChain(allDashas, queryDate);

    // Create summary
    const summary = {
      maha: activeChain.find(d => d.level === 1)?.planet || 'Unknown',
      antar: activeChain.find(d => d.level === 2)?.planet || 'Unknown',
      pratyantar: activeChain.find(d => d.level === 3)?.planet || 'Unknown',
      sookshma: activeChain.find(d => d.level === 4)?.planet || 'Unknown',
      pran: activeChain.find(d => d.level === 5)?.planet || 'Unknown'
    };

    return {
      date,
      active_chain: activeChain,
      all_periods: allDashas,
      summary
    };

  } catch (error) {
    console.error('Error getting dasha hierarchy:', error);
    return null;
  }
}

/**
 * Get upcoming dasha changes
 */
export function getUpcomingDashaChanges(
  allDashas: DashaPeriod[],
  fromDate: Date,
  limit: number = 10
): DashaPeriod[] {
  const upcoming = allDashas
    .filter(d => d.start > fromDate)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit);

  return upcoming;
}

/**
 * Get dasha periods for a date range
 */
export function getDashaPeriodsForRange(
  allDashas: DashaPeriod[],
  startDate: Date,
  endDate: Date
): DashaPeriod[] {
  return allDashas.filter(d => 
    (d.start >= startDate && d.start <= endDate) ||
    (d.end >= startDate && d.end <= endDate) ||
    (d.start <= startDate && d.end >= endDate)
  );
}

/**
 * Calculate dasha strength based on planetary positions
 */
export function calculateDashaStrength(
  planet: string,
  userChart: any
): number {
  // This would integrate with shadbala calculations
  // For now, return a basic strength based on planet type
  const beneficPlanets = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const maleficPlanets = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
  
  if (beneficPlanets.includes(planet)) return 0.8;
  if (maleficPlanets.includes(planet)) return 0.4;
  return 0.6; // Neutral planets like Sun
}
