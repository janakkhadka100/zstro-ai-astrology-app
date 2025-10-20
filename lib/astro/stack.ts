// lib/astro/stack.ts
// Active context stack merging dasha and transit data

import { getFullDashaHierarchy } from "./dashaEngine";
import { fetchTransitsForDate, TransitPlanet, calculateTransitAspects } from "./gocharService";
import { computeAge, AgeResult } from "../time/age";
import { getUserById } from "@/lib/db/queries";

export interface ActiveContextStack {
  date: string;
  age: AgeResult;
  dashaChain: {
    maha: string;
    antar: string;
    pratyantar: string;
    sookshma: string;
    pran: string;
  };
  transits: TransitPlanet[];
  periodRulers: string[]; // Mahadasha and Antar lords
  metadata: {
    userId: string;
    location: string;
    timezone: string;
    calculationTime: string;
  };
}

/**
 * Get complete active context stack for a user and date
 * @param userId - User ID
 * @param isoDate - Date in ISO format (YYYY-MM-DD), defaults to today
 * @returns Complete context stack with age, dasha, and transits
 */
export async function activeContextStack(userId: string, isoDate?: string): Promise<ActiveContextStack> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.birthDate || !user.place?.iana_tz) {
    throw new Error("Missing birth data or timezone");
  }

  const date = isoDate || new Date().toISOString().split('T')[0];
  
  // Calculate age
  const age = computeAge(user.birthDate, user.place.iana_tz, new Date(date));
  
  // Get dasha hierarchy
  const dashaHierarchy = await getFullDashaHierarchy(date, userId);
  if (!dashaHierarchy) {
    throw new Error("Failed to calculate dasha hierarchy");
  }
  
  // Get transit data
  const transitData = await fetchTransitsForDate(userId, date);
  
  // Extract period rulers (Maha and Antar lords)
  const periodRulers = [
    dashaHierarchy.summary.maha,
    dashaHierarchy.summary.antar
  ].filter(ruler => ruler && ruler !== 'Unknown');
  
  // Mark transit planets that are period rulers
  const enhancedTransits = transitData.planets.map(transit => ({
    ...transit,
    isPeriodRuler: periodRulers.includes(transit.planet)
  }));
  
  // Calculate aspects to natal planets (if available)
  // This would require natal chart data - for now we'll skip
  // const natalPlanets = await getNatalPlanets(userId);
  // const aspects = calculateTransitAspects(enhancedTransits, natalPlanets);
  
  return {
    date,
    age,
    dashaChain: dashaHierarchy.summary,
    transits: enhancedTransits,
    periodRulers,
    metadata: {
      userId,
      location: user.place.place || 'Unknown',
      timezone: user.place.iana_tz,
      calculationTime: new Date().toISOString()
    }
  };
}

/**
 * Get today's context stack for a user
 * @param userId - User ID
 * @returns Today's context stack
 */
export async function getTodayContextStack(userId: string): Promise<ActiveContextStack> {
  return activeContextStack(userId);
}

/**
 * Get context stack for a specific date
 * @param userId - User ID
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @returns Context stack for the specified date
 */
export async function getDateContextStack(userId: string, date: string): Promise<ActiveContextStack> {
  return activeContextStack(userId, date);
}

/**
 * Get upcoming significant transit dates
 * @param userId - User ID
 * @param days - Number of days to look ahead (default 30)
 * @returns Array of significant transit dates
 */
export async function getUpcomingSignificantTransits(
  userId: string, 
  days: number = 30
): Promise<Array<{ date: string; significance: string; planets: string[] }>> {
  const significantDates: Array<{ date: string; significance: string; planets: string[] }> = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    try {
      const context = await activeContextStack(userId, dateStr);
      
      // Check for significant transits
      const significantTransits = context.transits.filter(transit => 
        transit.isPeriodRuler || 
        transit.houseWS === 1 || // Ascendant
        transit.houseWS === 10 || // Midheaven
        transit.aspects.length > 0
      );
      
      if (significantTransits.length > 0) {
        significantDates.push({
          date: dateStr,
          significance: getSignificanceLevel(significantTransits),
          planets: significantTransits.map(t => t.planet)
        });
      }
    } catch (error) {
      // Skip dates that fail calculation
      continue;
    }
  }
  
  return significantDates;
}

/**
 * Determine significance level of transits
 * @param transits - Array of significant transits
 * @returns Significance description
 */
function getSignificanceLevel(transits: TransitPlanet[]): string {
  const periodRulers = transits.filter(t => t.isPeriodRuler).length;
  const angularHouses = transits.filter(t => [1, 4, 7, 10].includes(t.houseWS)).length;
  
  if (periodRulers > 0 && angularHouses > 0) {
    return "Very Significant";
  } else if (periodRulers > 0 || angularHouses > 0) {
    return "Significant";
  } else {
    return "Moderate";
  }
}

/**
 * Get transit summary for AI prompt
 * @param context - Active context stack
 * @returns Formatted summary for AI
 */
export function getTransitSummaryForAI(context: ActiveContextStack): string {
  const { date, age, dashaChain, transits, periodRulers } = context;
  
  const ageStr = `${age.years}y ${age.months}m`;
  const periodRulersStr = periodRulers.join(', ');
  
  let summary = `📍Transits (${date}, age ${ageStr})\n`;
  summary += `Period Rulers: ${periodRulersStr}\n`;
  summary += `Dasha: ${dashaChain.maha} → ${dashaChain.antar} → ${dashaChain.pratyantar}\n\n`;
  
  // Add key transits
  const keyTransits = transits.slice(0, 8); // Top 8 transits
  summary += "Key Transits:\n";
  
  for (const transit of keyTransits) {
    const rulerFlag = transit.isPeriodRuler ? " • period ruler" : "";
    const beneficFlag = transit.isBenefic ? " (benefic)" : "";
    summary += `• ${transit.planet} in ${transit.sign} (WS House ${transit.houseWS})${rulerFlag}${beneficFlag}\n`;
  }
  
  return summary;
}
