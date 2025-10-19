import { Shadbala, PlanetName } from './schemas';

/**
 * Normalize Shadbala data by validating subscores, computing totals, and rounding
 */
export function normalizeShadbala(
  shadbala: Partial<Shadbala> | null | undefined,
  planet: PlanetName
): Shadbala | null {
  if (!shadbala) return null;

  // Extract subscores with defaults
  const sthana = Math.max(0, shadbala.sthana ?? 0);
  const dig = Math.max(0, shadbala.dig ?? 0);
  const kala = Math.max(0, shadbala.kala ?? 0);
  const chestha = Math.max(0, shadbala.chestha ?? 0);
  const naisargika = Math.max(0, shadbala.naisargika ?? 0);

  // Compute total if missing or invalid
  const providedTotal = shadbala.total;
  const computedTotal = sthana + dig + kala + chestha + naisargika;
  const total = (providedTotal !== undefined) 
    ? providedTotal 
    : computedTotal;

  // Round all values to 2 decimal places
  const round = (value: number) => Math.round(value * 100) / 100;

  return {
    total: round(Math.max(0, total)),
    sthana: round(sthana),
    dig: round(dig),
    kala: round(kala),
    chestha: round(chestha),
    naisargika: round(naisargika)
  };
}

/**
 * Process Shadbala data for all planets
 */
export function processShadbalaData(
  planets: Array<{ planet: PlanetName; shadbala?: Partial<Shadbala> | null }>,
  shadbalaRecord?: Record<PlanetName, Partial<Shadbala>>
): Array<{ planet: PlanetName; shadbala: Shadbala | null }> {
  return planets.map(planetData => {
    // Try embedded shadbala first, then fallback to record
    const shadbalaSource = planetData.shadbala ?? 
      (shadbalaRecord?.[planetData.planet] ?? null);
    
    const normalizedShadbala = normalizeShadbala(shadbalaSource, planetData.planet);
    
    return {
      planet: planetData.planet,
      shadbala: normalizedShadbala
    };
  });
}

/**
 * Create Shadbala table rows for display
 */
export function createShadbalaTable(
  planets: Array<{ planet: PlanetName; shadbala: Shadbala | null }>
): Array<{
  planet: PlanetName;
  total: number;
  sthana: number;
  dig: number;
  kala: number;
  chestha: number;
  naisargika: number;
}> {
  return planets
    .filter(p => p.shadbala !== null)
    .map(p => ({
      planet: p.planet,
      total: p.shadbala!.total,
      sthana: p.shadbala!.sthana,
      dig: p.shadbala!.dig,
      kala: p.shadbala!.kala,
      chestha: p.shadbala!.chestha,
      naisargika: p.shadbala!.naisargika
    }));
}

/**
 * Test cases for Shadbala normalization
 */
export const SHADBALA_TESTS = {
  // Test rounding to 2 decimals
  rounding: () => {
    const input = {
      total: 150.256789,
      sthana: 45.123456,
      dig: 30.987654,
      kala: 25.111111,
      chestha: 20.999999,
      naisargika: 28.000001
    };
    const result = normalizeShadbala(input, "Sun");
    return result?.total === 150.26 && 
           result?.sthana === 45.12 && 
           result?.dig === 30.99;
  },

  // Test negative clamping
  negativeClamping: () => {
    const input = {
      total: -10,
      sthana: -5,
      dig: 30,
      kala: 25,
      chestha: 20,
      naisargika: 28
    };
    const result = normalizeShadbala(input, "Sun");
    return result?.total === 0 && 
           result?.sthana === 0 && 
           result?.dig === 30;
  },

  // Test total computation when missing
  totalComputation: () => {
    const input = {
      sthana: 45,
      dig: 30,
      kala: 25,
      chestha: 20,
      naisargika: 28
    };
    const result = normalizeShadbala(input, "Sun");
    return result?.total === 148; // Sum of subscores
  }
};
