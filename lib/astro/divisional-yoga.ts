// lib/astro/divisional-yoga.ts
// ------------------------------------------------------------
//  Divisional Chart Analysis Module
//  → Compares divisional charts (D9, D10, D7, D2) with D1 chart
//  → Detects reinforced or cancelled Yogas
//  → Calculates secondary strength and maturity period
// ------------------------------------------------------------

import { PlanetPosition, DignityItem, YogaItem } from '../prokerala/types';
import { signName } from '../ai/astroCalculations';

/** Helper: find planet in specific divisional chart */
function getPlanet(chart: PlanetPosition[], planet: string): PlanetPosition | null {
  return chart.find((p) => p.planet === planet) || null;
}

/** Check if same planet retains dignity or Kendra/Trikona strength */
function compareStrength(
  main: PlanetPosition | null,
  div: PlanetPosition | null,
  dignitiesMain: DignityItem[],
  dignitiesDiv: DignityItem[],
): string {
  if (!main || !div) return 'unknown';
  const mainStat = dignitiesMain.find((d) => d.planet === main.planet)?.status;
  const divStat = dignitiesDiv.find((d) => d.planet === div.planet)?.status;
  const sameHouse = main.house === div.house;
  if (mainStat && divStat && mainStat === divStat && sameHouse) return 'reinforced';
  if (divStat && ['uccha', 'swagriha', 'moolatrikona'].includes(divStat))
    return 'stronger';
  if (divStat === 'nicha') return 'weakened';
  return 'neutral';
}

/** Divisional support report for major yogas */
export function evaluateDivisionalSupport(
  mainYogas: YogaItem[] = [],
  mainChart: PlanetPosition[] = [],
  divisionalCharts: Record<string, PlanetPosition[]> = {},
  dignitiesMain: DignityItem[] = [],
  dignitiesDivs: Record<string, DignityItem[]> = {}
): YogaItem[] {
  const results: YogaItem[] = [];

  for (const yoga of mainYogas) {
    const relatedPlanets = yoga.factors
      .join(' ')
      .match(/(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)/gi);
    const uniquePlanets = Array.from(new Set(relatedPlanets || []));
    const details: string[] = [];
    let supportCount = 0;
    let weakenCount = 0;

    for (const [chartName, chart] of Object.entries(divisionalCharts)) {
      const divDign = dignitiesDivs[chartName] || [];
      let reinforced = 0,
        weakened = 0;

      for (const pl of uniquePlanets) {
        const mainPl = getPlanet(mainChart, pl);
        const divPl = getPlanet(chart, pl);
        const cmp = compareStrength(mainPl, divPl, dignitiesMain, divDign);

        if (cmp === 'reinforced' || cmp === 'stronger') reinforced++;
        else if (cmp === 'weakened') weakened++;
      }

      if (reinforced > 0)
        details.push(`In ${chartName}: ${reinforced} planet(s) reinforced (${uniquePlanets.join(', ')})`);
      if (weakened > 0)
        details.push(`In ${chartName}: ${weakened} planet(s) weakened`);

      supportCount += reinforced;
      weakenCount += weakened;
    }

  let strengthHint = yoga.strengthHint;
if (supportCount > weakenCount) strengthHint = 'strong';
else if (weakenCount > supportCount) strengthHint = 'weak';
else if (supportCount === weakenCount && supportCount > 0) strengthHint = 'moderate';


    results.push({
      ...yoga,
      key: yoga.key + '.divSupport',
      label: yoga.label + ' (Divisional Check)',
      factors: yoga.factors.concat(details),
      strengthHint,
    });
  }

  return results;
}

/** Evaluate planetary reinforcement summary (for UI visualization) */
export function getDivisionalSummary(
  mainChart: PlanetPosition[],
  divisionalCharts: Record<string, PlanetPosition[]>,
  dignitiesMain: DignityItem[],
  dignitiesDivs: Record<string, DignityItem[]>
): Record<string, { stronger: number; weakened: number }> {
  const result: Record<string, { stronger: number; weakened: number }> = {};
  const planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  for (const [chartName, chart] of Object.entries(divisionalCharts)) {
    const divDign = dignitiesDivs[chartName] || [];
    let stronger = 0, weakened = 0;

    for (const pl of planets) {
      const mainPl = getPlanet(mainChart, pl);
      const divPl = getPlanet(chart, pl);
      const cmp = compareStrength(mainPl, divPl, dignitiesMain, divDign);
      if (cmp === 'stronger' || cmp === 'reinforced') stronger++;
      if (cmp === 'weakened') weakened++;
    }
    result[chartName] = { stronger, weakened };
  }

  return result;
}

/** Example usage:
 *
 * const divisionalSupport = evaluateDivisionalSupport(
 *   yogasFromD1,
 *   chartD1,
 *   { D9: chartD9, D10: chartD10, D7: chartD7, D2: chartD2 },
 *   dignitiesD1,
 *   { D9: dignitiesD9, D10: dignitiesD10, D7: dignitiesD7, D2: dignitiesD2 }
 * );
 *
 * const summary = getDivisionalSummary(chartD1, { D9: chartD9, D10: chartD10 }, dignitiesD1, { D9: dignitiesD9, D10: dignitiesD10 });
 */
