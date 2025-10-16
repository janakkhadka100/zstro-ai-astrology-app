// lib/services/astro/validate.ts
// Astrology validation service ensuring Pokhrel data accuracy

import { logger } from '../logger';
import type { PlanetPosition, DignityItem, AspectItem, VimshottariDasha } from '@/lib/prokerala/types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 validation score
}

export interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  suggestion?: string;
}

export interface ChartValidationContext {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  coordinates: { lat: number; lon: number };
  timezone: string;
}

class AstrologyValidationService {
  private readonly SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  private readonly PLANET_NAMES = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
    'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'
  ];

  private readonly HOUSE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

  private readonly DEGREES_PER_SIGN = 30;
  private readonly DEGREES_PER_HOUSE = 30;

  validateBirthData(
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    coordinates?: { lat: number; lon: number }
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Date validation
    const dateValidation = this.validateDate(birthDate);
    if (!dateValidation.valid) {
      errors.push(...dateValidation.errors);
    }

    // Time validation
    const timeValidation = this.validateTime(birthTime);
    if (!timeValidation.valid) {
      errors.push(...timeValidation.errors);
    }

    // Place validation
    const placeValidation = this.validatePlace(birthPlace, coordinates);
    if (!placeValidation.valid) {
      errors.push(...placeValidation.errors);
    }

    // Combined validation
    const combinedValidation = this.validateBirthDataCombination(birthDate, birthTime, birthPlace);
    if (!combinedValidation.valid) {
      errors.push(...combinedValidation.errors);
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  validateChart(
    planetPositions: PlanetPosition[],
    dignities: DignityItem[],
    aspects: AspectItem[],
    vimshottari: VimshottariDasha | null,
    context: ChartValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate planet positions
    const planetValidation = this.validatePlanetPositions(planetPositions, context);
    errors.push(...planetValidation.errors);
    warnings.push(...planetValidation.warnings);

    // Validate dignities
    const dignityValidation = this.validateDignities(dignities, planetPositions);
    errors.push(...dignityValidation.errors);
    warnings.push(...dignityValidation.warnings);

    // Validate aspects
    const aspectValidation = this.validateAspects(aspects, planetPositions);
    errors.push(...aspectValidation.errors);
    warnings.push(...aspectValidation.warnings);

    // Validate Vimshottari Dasha
    if (vimshottari) {
      const dashaValidation = this.validateVimshottariDasha(vimshottari, context);
      errors.push(...dashaValidation.errors);
      warnings.push(...dashaValidation.warnings);
    }

    // Cross-validation checks
    const crossValidation = this.validateChartConsistency(planetPositions, dignities, aspects, vimshottari);
    errors.push(...crossValidation.errors);
    warnings.push(...crossValidation.warnings);

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  private validateDate(date: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push({
        code: 'INVALID_DATE_FORMAT',
        message: 'Date must be in YYYY-MM-DD format',
        field: 'birthDate',
        severity: 'error',
        suggestion: 'Use format: YYYY-MM-DD (e.g., 1990-01-15)',
      });
      return { valid: false, errors, warnings, score: 0 };
    }

    // Parse and validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        code: 'INVALID_DATE_VALUE',
        message: 'Invalid date value',
        field: 'birthDate',
        severity: 'error',
        suggestion: 'Enter a valid date',
      });
      return { valid: false, errors, warnings, score: 0 };
    }

    // Range validation
    const year = parsedDate.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year < 1900) {
      errors.push({
        code: 'DATE_TOO_OLD',
        message: 'Birth year cannot be before 1900',
        field: 'birthDate',
        severity: 'error',
        suggestion: 'Enter a birth year from 1900 onwards',
      });
    } else if (year > currentYear) {
      errors.push({
        code: 'FUTURE_DATE',
        message: 'Birth date cannot be in the future',
        field: 'birthDate',
        severity: 'error',
        suggestion: 'Enter a valid past date',
      });
    } else if (year < 1950) {
      warnings.push({
        code: 'OLD_BIRTH_YEAR',
        message: 'Birth year is quite old, some calculations may be less accurate',
        field: 'birthDate',
        suggestion: 'Verify the birth year is correct',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateTime(time: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Format validation
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      errors.push({
        code: 'INVALID_TIME_FORMAT',
        message: 'Time must be in HH:MM or HH:MM:SS format',
        field: 'birthTime',
        severity: 'error',
        suggestion: 'Use format: HH:MM (e.g., 14:30) or HH:MM:SS (e.g., 14:30:45)',
      });
      return { valid: false, errors, warnings, score: 0 };
    }

    // Parse and validate time
    const [hours, minutes, seconds] = time.split(':').map(Number);
    
    if (hours < 0 || hours > 23) {
      errors.push({
        code: 'INVALID_HOUR',
        message: 'Hour must be between 00 and 23',
        field: 'birthTime',
        severity: 'error',
        suggestion: 'Enter hour in 24-hour format (00-23)',
      });
    }

    if (minutes < 0 || minutes > 59) {
      errors.push({
        code: 'INVALID_MINUTE',
        message: 'Minutes must be between 00 and 59',
        field: 'birthTime',
        severity: 'error',
        suggestion: 'Enter minutes (00-59)',
      });
    }

    if (seconds !== undefined && (seconds < 0 || seconds > 59)) {
      errors.push({
        code: 'INVALID_SECOND',
        message: 'Seconds must be between 00 and 59',
        field: 'birthTime',
        severity: 'error',
        suggestion: 'Enter seconds (00-59) or omit seconds',
      });
    }

    // Time accuracy warnings
    if (seconds === undefined) {
      warnings.push({
        code: 'NO_SECONDS',
        message: 'Birth time without seconds may reduce accuracy',
        field: 'birthTime',
        suggestion: 'If available, include seconds for better accuracy',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validatePlace(place: string, coordinates?: { lat: number; lon: number }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!place || place.trim().length === 0) {
      errors.push({
        code: 'MISSING_PLACE',
        message: 'Birth place is required',
        field: 'birthPlace',
        severity: 'error',
        suggestion: 'Enter the city and country of birth',
      });
      return { valid: false, errors, warnings, score: 0 };
    }

    if (place.trim().length < 3) {
      errors.push({
        code: 'PLACE_TOO_SHORT',
        message: 'Birth place must be at least 3 characters',
        field: 'birthPlace',
        severity: 'error',
        suggestion: 'Enter a more specific location (e.g., "Kathmandu, Nepal")',
      });
    }

    // Coordinate validation if provided
    if (coordinates) {
      if (coordinates.lat < -90 || coordinates.lat > 90) {
        errors.push({
          code: 'INVALID_LATITUDE',
          message: 'Latitude must be between -90 and 90',
          field: 'coordinates.lat',
          severity: 'error',
          suggestion: 'Enter a valid latitude coordinate',
        });
      }

      if (coordinates.lon < -180 || coordinates.lon > 180) {
        errors.push({
          code: 'INVALID_LONGITUDE',
          message: 'Longitude must be between -180 and 180',
          field: 'coordinates.lon',
          severity: 'error',
          suggestion: 'Enter a valid longitude coordinate',
        });
      }
    } else {
      warnings.push({
        code: 'NO_COORDINATES',
        message: 'No coordinates provided, using geocoding which may be less accurate',
        field: 'birthPlace',
        suggestion: 'Provide exact coordinates for better accuracy',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateBirthDataCombination(
    birthDate: string,
    birthTime: string,
    birthPlace: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for reasonable birth data combination
    const birthDateTime = new Date(`${birthDate}T${birthTime}`);
    const now = new Date();

    if (birthDateTime > now) {
      errors.push({
        code: 'FUTURE_BIRTH_DATETIME',
        message: 'Birth date and time cannot be in the future',
        field: 'birthDateTime',
        severity: 'error',
        suggestion: 'Enter a valid past date and time',
      });
    }

    // Check for very recent birth (less than 1 hour ago)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (birthDateTime > oneHourAgo) {
      warnings.push({
        code: 'VERY_RECENT_BIRTH',
        message: 'Birth time is very recent, some calculations may not be accurate',
        field: 'birthDateTime',
        suggestion: 'Verify the birth time is correct',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validatePlanetPositions(
    planetPositions: PlanetPosition[],
    context: ChartValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!planetPositions || planetPositions.length === 0) {
      errors.push({
        code: 'NO_PLANET_POSITIONS',
        message: 'No planet positions found in chart data',
        field: 'planetPositions',
        severity: 'error',
        suggestion: 'Check if astrology calculation was successful',
      });
      return { valid: false, errors, warnings, score: 0 };
    }

    // Check for required planets
    const requiredPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const foundPlanets = planetPositions.map(p => p.planet);
    const missingPlanets = requiredPlanets.filter(p => !foundPlanets.includes(p));

    if (missingPlanets.length > 0) {
      errors.push({
        code: 'MISSING_REQUIRED_PLANETS',
        message: `Missing required planets: ${missingPlanets.join(', ')}`,
        field: 'planetPositions',
        severity: 'error',
        suggestion: 'Ensure all required planets are calculated',
      });
    }

    // Validate each planet position
    for (const planet of planetPositions) {
      const planetValidation = this.validateSinglePlanetPosition(planet, context);
      errors.push(...planetValidation.errors);
      warnings.push(...planetValidation.warnings);
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateSinglePlanetPosition(
    planet: PlanetPosition,
    context: ChartValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate planet name
    if (!this.PLANET_NAMES.includes(planet.planet)) {
      errors.push({
        code: 'INVALID_PLANET_NAME',
        message: `Invalid planet name: ${planet.planet}`,
        field: `planetPositions.${planet.planet}`,
        severity: 'error',
        suggestion: 'Use standard planet names',
      });
    }

    // Validate sign
    if (!planet.sign || !this.SIGN_NAMES.includes(planet.sign)) {
      errors.push({
        code: 'INVALID_SIGN',
        message: `Invalid or missing sign for ${planet.planet}: ${planet.sign}`,
        field: `planetPositions.${planet.planet}.sign`,
        severity: 'error',
        suggestion: 'Ensure sign is one of the 12 zodiac signs',
      });
    }

    // Validate house
    if (!planet.house || !this.HOUSE_NUMBERS.includes(planet.house)) {
      errors.push({
        code: 'INVALID_HOUSE',
        message: `Invalid or missing house for ${planet.planet}: ${planet.house}`,
        field: `planetPositions.${planet.planet}.house`,
        severity: 'error',
        suggestion: 'Ensure house is between 1 and 12',
      });
    }

    // Validate Rasi ID
    if (planet.rasiId && (planet.rasiId < 1 || planet.rasiId > 12)) {
      errors.push({
        code: 'INVALID_RASI_ID',
        message: `Invalid Rasi ID for ${planet.planet}: ${planet.rasiId}`,
        field: `planetPositions.${planet.planet}.rasiId`,
        severity: 'error',
        suggestion: 'Rasi ID must be between 1 and 12',
      });
    }

    // Validate retrograde flag
    if (typeof planet.isRetrograde !== 'boolean') {
      warnings.push({
        code: 'MISSING_RETROGRADE_FLAG',
        message: `Retrograde status not specified for ${planet.planet}`,
        field: `planetPositions.${planet.planet}.isRetrograde`,
        suggestion: 'Specify if planet is retrograde',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateDignities(
    dignities: DignityItem[],
    planetPositions: PlanetPosition[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!dignities || dignities.length === 0) {
      warnings.push({
        code: 'NO_DIGNITIES',
        message: 'No planetary dignities found',
        field: 'dignities',
        suggestion: 'Calculate planetary dignities for better accuracy',
      });
      return { valid: true, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
    }

    // Validate each dignity
    for (const dignity of dignities) {
      const dignityValidation = this.validateSingleDignity(dignity, planetPositions);
      errors.push(...dignityValidation.errors);
      warnings.push(...dignityValidation.warnings);
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateSingleDignity(
    dignity: DignityItem,
    planetPositions: PlanetPosition[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate planet name
    if (!this.PLANET_NAMES.includes(dignity.planet)) {
      errors.push({
        code: 'INVALID_DIGNITY_PLANET',
        message: `Invalid planet name in dignity: ${dignity.planet}`,
        field: `dignities.${dignity.planet}`,
        severity: 'error',
        suggestion: 'Use standard planet names',
      });
    }

    // Validate dignity status
    const validStatuses = ['Exalted', 'Own', 'Friendly', 'Neutral', 'Enemy', 'Debilitated'];
    if (dignity.status && !validStatuses.includes(dignity.status)) {
      errors.push({
        code: 'INVALID_DIGNITY_STATUS',
        message: `Invalid dignity status for ${dignity.planet}: ${dignity.status}`,
        field: `dignities.${dignity.planet}.status`,
        severity: 'error',
        suggestion: 'Use valid dignity statuses',
      });
    }

    // Check if planet exists in positions
    const planetExists = planetPositions.some(p => p.planet === dignity.planet);
    if (!planetExists) {
      warnings.push({
        code: 'DIGNITY_WITHOUT_PLANET',
        message: `Dignity found for ${dignity.planet} but planet not in positions`,
        field: `dignities.${dignity.planet}`,
        suggestion: 'Ensure planet positions are calculated',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateAspects(
    aspects: AspectItem[],
    planetPositions: PlanetPosition[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!aspects || aspects.length === 0) {
      warnings.push({
        code: 'NO_ASPECTS',
        message: 'No planetary aspects found',
        field: 'aspects',
        suggestion: 'Calculate planetary aspects for better accuracy',
      });
      return { valid: true, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
    }

    // Validate each aspect
    for (const aspect of aspects) {
      const aspectValidation = this.validateSingleAspect(aspect, planetPositions);
      errors.push(...aspectValidation.errors);
      warnings.push(...aspectValidation.warnings);
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateSingleAspect(
    aspect: AspectItem,
    planetPositions: PlanetPosition[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate from planet
    if (!this.PLANET_NAMES.includes(aspect.fromPlanet)) {
      errors.push({
        code: 'INVALID_ASPECT_FROM_PLANET',
        message: `Invalid from planet in aspect: ${aspect.fromPlanet}`,
        field: `aspects.${aspect.fromPlanet}`,
        severity: 'error',
        suggestion: 'Use standard planet names',
      });
    }

    // Validate to planet or house
    const isValidToTarget = this.PLANET_NAMES.includes(aspect.toPlanetOrHouse) ||
                           this.HOUSE_NUMBERS.includes(Number(aspect.toPlanetOrHouse));
    
    if (!isValidToTarget) {
      errors.push({
        code: 'INVALID_ASPECT_TO_TARGET',
        message: `Invalid aspect target: ${aspect.toPlanetOrHouse}`,
        field: `aspects.${aspect.fromPlanet}.toPlanetOrHouse`,
        severity: 'error',
        suggestion: 'Target must be a planet or house number (1-12)',
      });
    }

    // Validate aspect type
    const validAspectTypes = ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile', 'Quincunx'];
    if (aspect.type && !validAspectTypes.includes(aspect.type)) {
      warnings.push({
        code: 'UNKNOWN_ASPECT_TYPE',
        message: `Unknown aspect type: ${aspect.type}`,
        field: `aspects.${aspect.fromPlanet}.type`,
        suggestion: 'Use standard aspect types',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateVimshottariDasha(
    vimshottari: VimshottariDasha,
    context: ChartValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate current dasha
    if (vimshottari.current) {
      const currentValidation = this.validateDashaPeriod(vimshottari.current, 'current');
      errors.push(...currentValidation.errors);
      warnings.push(...currentValidation.warnings);
    } else {
      warnings.push({
        code: 'NO_CURRENT_DASHA',
        message: 'No current dasha period found',
        field: 'vimshottari.current',
        suggestion: 'Calculate current dasha period',
      });
    }

    // Validate timeline
    if (vimshottari.timelineMaha && vimshottari.timelineMaha.length > 0) {
      for (const dasha of vimshottari.timelineMaha) {
        const dashaValidation = this.validateDashaPeriod(dasha, 'timeline');
        errors.push(...dashaValidation.errors);
        warnings.push(...dashaValidation.warnings);
      }
    } else {
      warnings.push({
        code: 'NO_DASHA_TIMELINE',
        message: 'No dasha timeline found',
        field: 'vimshottari.timelineMaha',
        suggestion: 'Calculate dasha timeline',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateDashaPeriod(
    dasha: { planet: string; start: string; end: string },
    type: 'current' | 'timeline'
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate planet name
    if (!this.PLANET_NAMES.includes(dasha.planet)) {
      errors.push({
        code: 'INVALID_DASHA_PLANET',
        message: `Invalid planet in ${type} dasha: ${dasha.planet}`,
        field: `vimshottari.${type}.planet`,
        severity: 'error',
        suggestion: 'Use standard planet names',
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dasha.start)) {
      errors.push({
        code: 'INVALID_DASHA_START_DATE',
        message: `Invalid start date format: ${dasha.start}`,
        field: `vimshottari.${type}.start`,
        severity: 'error',
        suggestion: 'Use YYYY-MM-DD format',
      });
    }

    if (!dateRegex.test(dasha.end)) {
      errors.push({
        code: 'INVALID_DASHA_END_DATE',
        message: `Invalid end date format: ${dasha.end}`,
        field: `vimshottari.${type}.end`,
        severity: 'error',
        suggestion: 'Use YYYY-MM-DD format',
      });
    }

    // Validate date order
    if (dateRegex.test(dasha.start) && dateRegex.test(dasha.end)) {
      const startDate = new Date(dasha.start);
      const endDate = new Date(dasha.end);
      
      if (startDate >= endDate) {
        errors.push({
          code: 'INVALID_DASHA_DATE_ORDER',
          message: 'Dasha start date must be before end date',
          field: `vimshottari.${type}`,
          severity: 'error',
          suggestion: 'Check date order',
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private validateChartConsistency(
    planetPositions: PlanetPosition[],
    dignities: DignityItem[],
    aspects: AspectItem[],
    vimshottari: VimshottariDasha | null
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for consistency between planet positions and dignities
    const dignityPlanets = dignities.map(d => d.planet);
    const positionPlanets = planetPositions.map(p => p.planet);
    
    const missingDignities = positionPlanets.filter(p => !dignityPlanets.includes(p));
    if (missingDignities.length > 0) {
      warnings.push({
        code: 'MISSING_DIGNITIES_FOR_PLANETS',
        message: `Dignities missing for planets: ${missingDignities.join(', ')}`,
        field: 'dignities',
        suggestion: 'Calculate dignities for all planets',
      });
    }

    // Check for consistency between planet positions and aspects
    const aspectPlanets = new Set([
      ...aspects.map(a => a.fromPlanet),
      ...aspects.map(a => a.toPlanetOrHouse).filter(p => this.PLANET_NAMES.includes(p))
    ]);
    
    const missingAspects = positionPlanets.filter(p => !aspectPlanets.has(p));
    if (missingAspects.length > 0) {
      warnings.push({
        code: 'MISSING_ASPECTS_FOR_PLANETS',
        message: `Aspects missing for planets: ${missingAspects.join(', ')}`,
        field: 'aspects',
        suggestion: 'Calculate aspects for all planets',
      });
    }

    return { valid: errors.length === 0, errors, warnings, score: this.calculateValidationScore(errors, warnings) };
  }

  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    const errorWeight = 10;
    const warningWeight = 2;
    
    const errorScore = errors.length * errorWeight;
    const warningScore = warnings.length * warningWeight;
    
    const totalScore = Math.max(0, 100 - errorScore - warningScore);
    return Math.round(totalScore);
  }

  // Public method to get validation summary
  getValidationSummary(result: ValidationResult): {
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
    message: string;
    recommendations: string[];
  } {
    if (!result.valid) {
      return {
        status: 'invalid',
        message: 'Chart validation failed. Please check the errors and try again.',
        recommendations: result.errors.map(e => e.suggestion).filter(Boolean),
      };
    }

    if (result.score >= 90) {
      return {
        status: 'excellent',
        message: 'Chart validation passed with excellent quality.',
        recommendations: [],
      };
    } else if (result.score >= 75) {
      return {
        status: 'good',
        message: 'Chart validation passed with good quality.',
        recommendations: result.warnings.map(w => w.suggestion).filter(Boolean),
      };
    } else if (result.score >= 60) {
      return {
        status: 'fair',
        message: 'Chart validation passed with fair quality. Some improvements recommended.',
        recommendations: result.warnings.map(w => w.suggestion).filter(Boolean),
      };
    } else {
      return {
        status: 'poor',
        message: 'Chart validation passed but with poor quality. Significant improvements recommended.',
        recommendations: result.warnings.map(w => w.suggestion).filter(Boolean),
      };
    }
  }
}

export const astrologyValidationService = new AstrologyValidationService();
export default astrologyValidationService;
