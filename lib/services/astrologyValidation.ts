// lib/services/astrologyValidation.ts
// Enhanced validation service for astrology calculations

import { PlanetPosition, DignityItem, AspectItem } from '../prokerala/types';
import { logger } from './logger';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ChartValidation {
  planetaryPositions: ValidationResult;
  houseCalculations: ValidationResult;
  dignities: ValidationResult;
  aspects: ValidationResult;
  overall: ValidationResult;
}

class AstrologyValidationService {
  private readonly PLANET_NAMES = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  private readonly CLASSICAL_PLANETS = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
  ];

  private readonly SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  /**
   * Validate planetary positions
   */
  validatePlanetaryPositions(planets: PlanetPosition[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for required planets
    const presentPlanets = planets.map(p => p.planet);
    const missingPlanets = this.CLASSICAL_PLANETS.filter(p => !presentPlanets.includes(p));
    
    if (missingPlanets.length > 0) {
      errors.push(`Missing classical planets: ${missingPlanets.join(', ')}`);
    }

    // Validate each planet
    for (const planet of planets) {
      // Check planet name
      if (!this.PLANET_NAMES.includes(planet.planet)) {
        errors.push(`Invalid planet name: ${planet.planet}`);
      }

      // Check house number
      if (planet.house < 1 || planet.house > 12) {
        errors.push(`Invalid house number for ${planet.planet}: ${planet.house}`);
      }

      // Check sign
      if (planet.sign && !this.SIGN_NAMES.includes(planet.sign)) {
        warnings.push(`Unrecognized sign for ${planet.planet}: ${planet.sign}`);
      }

      // Check rasi ID
      if (planet.rasiId && (planet.rasiId < 1 || planet.rasiId > 12)) {
        errors.push(`Invalid rasi ID for ${planet.planet}: ${planet.rasiId}`);
      }

      // Check retrograde flag
      if (typeof planet.isRetrograde !== 'boolean') {
        warnings.push(`Missing retrograde information for ${planet.planet}`);
      }
    }

    // Check for duplicate planets
    const planetCounts = new Map<string, number>();
    for (const planet of planets) {
      planetCounts.set(planet.planet, (planetCounts.get(planet.planet) || 0) + 1);
    }

    for (const [planet, count] of planetCounts) {
      if (count > 1) {
        errors.push(`Duplicate planet found: ${planet} (${count} times)`);
      }
    }

    // Check for planets in same house (conjunctions)
    const houseCounts = new Map<number, string[]>();
    for (const planet of planets) {
      if (!houseCounts.has(planet.house)) {
        houseCounts.set(planet.house, []);
      }
      houseCounts.get(planet.house)!.push(planet.planet);
    }

    for (const [house, planetList] of houseCounts) {
      if (planetList.length > 1) {
        suggestions.push(`Conjunction in house ${house}: ${planetList.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate house calculations
   */
  validateHouseCalculations(planets: PlanetPosition[], ascendantSign?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if all houses 1-12 are represented
    const houses = new Set(planets.map(p => p.house));
    const missingHouses = [];
    for (let i = 1; i <= 12; i++) {
      if (!houses.has(i)) {
        missingHouses.push(i);
      }
    }

    if (missingHouses.length > 0) {
      warnings.push(`Empty houses: ${missingHouses.join(', ')}`);
    }

    // Check for ascendant sign consistency
    if (ascendantSign) {
      const ascendantPlanets = planets.filter(p => p.house === 1);
      if (ascendantPlanets.length > 0) {
        const ascendantSigns = ascendantPlanets.map(p => p.sign).filter(Boolean);
        const uniqueSigns = new Set(ascendantSigns);
        
        if (uniqueSigns.size > 1) {
          errors.push(`Inconsistent ascendant signs: ${Array.from(uniqueSigns).join(', ')}`);
        }
      }
    }

    // Check for planets in extreme positions
    const extremeHouses = [1, 4, 7, 10]; // Kendra houses
    const trikonaHouses = [1, 5, 9]; // Trikona houses
    const dusthanaHouses = [6, 8, 12]; // Dusthana houses

    const kendraPlanets = planets.filter(p => extremeHouses.includes(p.house));
    const trikonaPlanets = planets.filter(p => trikonaHouses.includes(p.house));
    const dusthanaPlanets = planets.filter(p => dusthanaHouses.includes(p.house));

    if (kendraPlanets.length > 4) {
      suggestions.push(`Many planets in Kendra houses: ${kendraPlanets.map(p => p.planet).join(', ')}`);
    }

    if (dusthanaPlanets.length > 3) {
      warnings.push(`Many planets in Dusthana houses: ${dusthanaPlanets.map(p => p.planet).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate dignities
   */
  validateDignities(dignities: DignityItem[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const validStatuses = ['exalted', 'own', 'mooltrikona', 'neutral', 'debilitated'];
    const planetCounts = new Map<string, number>();

    for (const dignity of dignities) {
      // Check planet name
      if (!this.PLANET_NAMES.includes(dignity.planet)) {
        errors.push(`Invalid planet in dignities: ${dignity.planet}`);
      }

      // Check status
      if (dignity.status && !validStatuses.includes(dignity.status.toLowerCase())) {
        warnings.push(`Unrecognized dignity status for ${dignity.planet}: ${dignity.status}`);
      }

      // Count planets
      planetCounts.set(dignity.planet, (planetCounts.get(dignity.planet) || 0) + 1);
    }

    // Check for duplicate planets
    for (const [planet, count] of planetCounts) {
      if (count > 1) {
        errors.push(`Duplicate dignity entry for planet: ${planet}`);
      }
    }

    // Check for missing classical planets
    const presentPlanets = Array.from(planetCounts.keys());
    const missingPlanets = this.CLASSICAL_PLANETS.filter(p => !presentPlanets.includes(p));
    
    if (missingPlanets.length > 0) {
      warnings.push(`Missing dignity information for: ${missingPlanets.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate aspects
   */
  validateAspects(aspects: AspectItem[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const validAspectTypes = ['seventh', 'special', 'trine', 'square', 'opposition'];
    const aspectCounts = new Map<string, number>();

    for (const aspect of aspects) {
      // Check from planet
      if (!this.PLANET_NAMES.includes(aspect.fromPlanet)) {
        errors.push(`Invalid from planet in aspect: ${aspect.fromPlanet}`);
      }

      // Check aspect type
      if (aspect.type && !validAspectTypes.includes(aspect.type.toLowerCase())) {
        warnings.push(`Unrecognized aspect type: ${aspect.type}`);
      }

      // Count aspects
      const key = `${aspect.fromPlanet}-${aspect.toPlanetOrHouse}`;
      aspectCounts.set(key, (aspectCounts.get(key) || 0) + 1);
    }

    // Check for duplicate aspects
    for (const [key, count] of aspectCounts) {
      if (count > 1) {
        warnings.push(`Duplicate aspect: ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate complete chart
   */
  validateChart(
    planets: PlanetPosition[],
    dignities: DignityItem[],
    aspects: AspectItem[],
    ascendantSign?: string
  ): ChartValidation {
    const planetaryPositions = this.validatePlanetaryPositions(planets);
    const houseCalculations = this.validateHouseCalculations(planets, ascendantSign);
    const dignitiesValidation = this.validateDignities(dignities);
    const aspectsValidation = this.validateAspects(aspects);

    // Overall validation
    const allErrors = [
      ...planetaryPositions.errors,
      ...houseCalculations.errors,
      ...dignitiesValidation.errors,
      ...aspectsValidation.errors,
    ];

    const allWarnings = [
      ...planetaryPositions.warnings,
      ...houseCalculations.warnings,
      ...dignitiesValidation.warnings,
      ...aspectsValidation.warnings,
    ];

    const allSuggestions = [
      ...planetaryPositions.suggestions,
      ...houseCalculations.suggestions,
      ...dignitiesValidation.suggestions,
      ...aspectsValidation.suggestions,
    ];

    const overall = {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
    };

    // Log validation results
    if (allErrors.length > 0) {
      logger.warn('Chart validation errors found', {
        errors: allErrors,
        planetCount: planets.length,
      });
    }

    if (allWarnings.length > 0) {
      logger.info('Chart validation warnings', {
        warnings: allWarnings,
      });
    }

    return {
      planetaryPositions,
      houseCalculations,
      dignities: dignitiesValidation,
      aspects: aspectsValidation,
      overall,
    };
  }

  /**
   * Validate birth data input
   */
  validateBirthData(birthDate: string, birthTime: string, birthPlace: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate birth date
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid birth date format');
    } else {
      const now = new Date();
      const minDate = new Date(1900, 0, 1);
      const maxDate = new Date(now.getFullYear() - 1, 11, 31);

      if (date < minDate) {
        errors.push('Birth date too far in the past');
      } else if (date > maxDate) {
        errors.push('Birth date must be at least 1 year ago');
      }
    }

    // Validate birth time
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(birthTime)) {
      errors.push('Invalid birth time format. Use HH:MM or HH:MM:SS');
    }

    // Validate birth place
    if (!birthPlace || birthPlace.trim().length < 2) {
      errors.push('Birth place is required and must be at least 2 characters');
    }

    // Check for common issues
    if (birthTime === '00:00:00' || birthTime === '12:00:00') {
      warnings.push('Birth time appears to be approximate (midnight or noon)');
    }

    if (birthPlace.toLowerCase().includes('unknown') || birthPlace.toLowerCase().includes('unknown')) {
      warnings.push('Birth place may not be accurate');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Get validation summary
   */
  getValidationSummary(validation: ChartValidation): {
    status: 'valid' | 'warning' | 'error';
    message: string;
    details: string[];
  } {
    if (validation.overall.valid) {
      return {
        status: 'valid',
        message: 'Chart validation passed',
        details: validation.overall.suggestions,
      };
    } else if (validation.overall.errors.length > 0) {
      return {
        status: 'error',
        message: `Chart validation failed with ${validation.overall.errors.length} errors`,
        details: validation.overall.errors,
      };
    } else {
      return {
        status: 'warning',
        message: `Chart validation passed with ${validation.overall.warnings.length} warnings`,
        details: validation.overall.warnings,
      };
    }
  }
}

export const astrologyValidationService = new AstrologyValidationService();
export default astrologyValidationService;
