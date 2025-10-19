import { SignId, House, PlanetName, Mismatch } from './schemas';

/**
 * Compute house number from ascendant and planet's sign
 * Formula: ((signId - ascSignId + 12) % 12) + 1
 * This ensures we never have sign == house
 */
export function computeHouseFromAsc(signId: SignId, ascSignId: SignId): House {
  return (((signId - ascSignId + 12) % 12) + 1) as House;
}

/**
 * Validate if a house number is valid (1-12)
 */
export function isValidHouse(house: number | null | undefined): house is House {
  return house !== null && house !== undefined && house >= 1 && house <= 12;
}

/**
 * Process planets to derive safeHouse and track mismatches
 */
export function processPlanetHouses(
  planets: Array<{
    planet: PlanetName;
    signId: SignId;
    house?: number | null;
  }>,
  ascSignId: SignId
): {
  processedPlanets: Array<{
    planet: PlanetName;
    signId: SignId;
    house: number | null;
    safeHouse: House;
  }>;
  mismatches: Mismatch[];
} {
  const processedPlanets: Array<{
    planet: PlanetName;
    signId: SignId;
    house: number | null;
    safeHouse: House;
  }> = [];
  const mismatches: Mismatch[] = [];

  for (const planet of planets) {
    const apiHouseValid = isValidHouse(planet.house) ? planet.house : null;
    const derivedHouse = computeHouseFromAsc(planet.signId, ascSignId);
    const safeHouse = apiHouseValid ?? derivedHouse;

    // Track mismatch if API house differs from derived
    if (apiHouseValid !== null && apiHouseValid !== derivedHouse) {
      mismatches.push({
        planet: planet.planet,
        apiHouse: apiHouseValid,
        derivedHouse: derivedHouse
      });
    }

    processedPlanets.push({
      planet: planet.planet,
      signId: planet.signId,
      house: planet.house ?? null,
      safeHouse
    });
  }

  return { processedPlanets, mismatches };
}

/**
 * Test cases for house derivation
 */
export const HOUSE_DERIVATION_TESTS = {
  // Taurus asc (2), Sun/Mars in Sagittarius (9) -> house 8
  taurusAscSagittarius: () => {
    const ascSignId = 2; // Taurus
    const sagittariusSignId = 9; // Sagittarius
    const expectedHouse = 8;
    const actualHouse = computeHouseFromAsc(sagittariusSignId, ascSignId);
    return actualHouse === expectedHouse;
  },

  // Taurus asc (2), Saturn in Aquarius (11) -> house 10
  taurusAscAquarius: () => {
    const ascSignId = 2; // Taurus
    const aquariusSignId = 11; // Aquarius
    const expectedHouse = 10;
    const actualHouse = computeHouseFromAsc(aquariusSignId, ascSignId);
    return actualHouse === expectedHouse;
  },

  // Aries asc (1), all signs should map to houses 1-12
  ariesAscAllSigns: () => {
    const ascSignId = 1; // Aries
    const results = [];
    for (let signId = 1; signId <= 12; signId++) {
      const house = computeHouseFromAsc(signId as SignId, ascSignId);
      results.push({ signId, house, expected: signId });
    }
    return results.every(r => r.house === r.expected);
  }
};
