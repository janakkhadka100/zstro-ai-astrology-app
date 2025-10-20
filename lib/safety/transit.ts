// lib/safety/transit.ts
// Safety rails and determinism for transit system

export interface TransitSafetyConfig {
  maxFutureDays: number;
  maxPastDays: number;
  requireBirthData: boolean;
  requireLocationData: boolean;
  validateCoordinates: boolean;
  maxCacheAge: number; // in hours
}

const DEFAULT_SAFETY_CONFIG: TransitSafetyConfig = {
  maxFutureDays: 365, // 1 year
  maxPastDays: 100 * 365, // 100 years
  requireBirthData: true,
  requireLocationData: true,
  validateCoordinates: true,
  maxCacheAge: 24 // 24 hours
};

/**
 * Validate date for transit calculations
 * @param date - Date string in YYYY-MM-DD format
 * @param config - Safety configuration
 * @returns Validation result
 */
export function validateTransitDate(
  date: string, 
  config: TransitSafetyConfig = DEFAULT_SAFETY_CONFIG
): { valid: boolean; error?: string } {
  try {
    // Check format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return { valid: false, error: "Invalid date format. Use YYYY-MM-DD" };
    }

    const inputDate = new Date(date);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(inputDate.getTime())) {
      return { valid: false, error: "Invalid date" };
    }

    // Check future limit
    const maxFutureDate = new Date(today.getTime() + (config.maxFutureDays * 24 * 60 * 60 * 1000));
    if (inputDate > maxFutureDate) {
      return { valid: false, error: `Date cannot be more than ${config.maxFutureDays} days in the future` };
    }

    // Check past limit
    const maxPastDate = new Date(today.getTime() - (config.maxPastDays * 24 * 60 * 60 * 1000));
    if (inputDate < maxPastDate) {
      return { valid: false, error: `Date cannot be more than ${config.maxPastDays} days in the past` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Date validation error" };
  }
}

/**
 * Validate user data for transit calculations
 * @param user - User object
 * @param config - Safety configuration
 * @returns Validation result
 */
export function validateUserData(
  user: any, 
  config: TransitSafetyConfig = DEFAULT_SAFETY_CONFIG
): { valid: boolean; error?: string } {
  if (!user) {
    return { valid: false, error: "User not found" };
  }

  if (config.requireBirthData) {
    if (!user.birthDate) {
      return { valid: false, error: "Birth date is required" };
    }

    // Validate birth date format
    const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthDateRegex.test(user.birthDate)) {
      return { valid: false, error: "Invalid birth date format" };
    }

    // Check if birth date is reasonable
    const birthDate = new Date(user.birthDate);
    const today = new Date();
    
    if (birthDate > today) {
      return { valid: false, error: "Birth date cannot be in the future" };
    }

    const ageInYears = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (ageInYears > 150) {
      return { valid: false, error: "Birth date seems unrealistic" };
    }
  }

  if (config.requireLocationData) {
    if (!user.place) {
      return { valid: false, error: "Birth location is required" };
    }

    if (config.validateCoordinates) {
      if (typeof user.place.lat !== 'number' || typeof user.place.lon !== 'number') {
        return { valid: false, error: "Invalid coordinates" };
      }

      if (user.place.lat < -90 || user.place.lat > 90) {
        return { valid: false, error: "Invalid latitude" };
      }

      if (user.place.lon < -180 || user.place.lon > 180) {
        return { valid: false, error: "Invalid longitude" };
      }
    }

    if (!user.place.iana_tz) {
      return { valid: false, error: "Timezone is required" };
    }
  }

  return { valid: true };
}

/**
 * Sanitize transit data to prevent data leakage
 * @param data - Raw transit data
 * @returns Sanitized data
 */
export function sanitizeTransitData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  // Remove any potential PII
  if (sanitized.metadata) {
    sanitized.metadata = {
      ...sanitized.metadata,
      userId: '***', // Mask user ID
      location: sanitized.metadata.location ? 
        sanitized.metadata.location.split(',')[0] : 'Unknown' // Only city
    };
  }

  // Ensure planet names are safe
  if (sanitized.planets && Array.isArray(sanitized.planets)) {
    sanitized.planets = sanitized.planets.map((planet: any) => ({
      ...planet,
      planet: sanitizePlanetName(planet.planet)
    }));
  }

  return sanitized;
}

/**
 * Sanitize planet name to prevent injection
 * @param planetName - Planet name
 * @returns Sanitized planet name
 */
function sanitizePlanetName(planetName: string): string {
  const validPlanets = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];
  
  if (validPlanets.includes(planetName)) {
    return planetName;
  }
  
  return 'Unknown';
}

/**
 * Validate transit calculation results
 * @param result - Transit calculation result
 * @returns Validation result
 */
export function validateTransitResult(result: any): { valid: boolean; error?: string } {
  if (!result) {
    return { valid: false, error: "No transit data returned" };
  }

  if (!result.date || !result.planets) {
    return { valid: false, error: "Invalid transit data structure" };
  }

  if (!Array.isArray(result.planets)) {
    return { valid: false, error: "Planets data must be an array" };
  }

  // Validate each planet
  for (const planet of result.planets) {
    if (!planet.planet || !planet.sign || typeof planet.houseWS !== 'number') {
      return { valid: false, error: "Invalid planet data structure" };
    }

    if (planet.houseWS < 1 || planet.houseWS > 12) {
      return { valid: false, error: "Invalid house number" };
    }
  }

  return { valid: true };
}

/**
 * Get default safety configuration
 * @returns Default safety configuration
 */
export function getDefaultSafetyConfig(): TransitSafetyConfig {
  return { ...DEFAULT_SAFETY_CONFIG };
}

/**
 * Create custom safety configuration
 * @param overrides - Configuration overrides
 * @returns Custom safety configuration
 */
export function createSafetyConfig(overrides: Partial<TransitSafetyConfig>): TransitSafetyConfig {
  return { ...DEFAULT_SAFETY_CONFIG, ...overrides };
}
