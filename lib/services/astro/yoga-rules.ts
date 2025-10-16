// lib/services/astro/yoga-rules.ts
// Yoga detection rules based strictly on Pokhrel data fields

import { logger } from '../logger';
import type { PlanetPosition, DignityItem, AspectItem } from '@/lib/prokerala/types';

export interface YogaRule {
  key: string;
  name: string;
  description: string;
  requiredFields: string[];
  conditions: YogaCondition[];
  priority: number;
  category: 'rajayoga' | 'dhanayoga' | 'karmayoga' | 'mokshayoga' | 'special';
}

export interface YogaCondition {
  type: 'planet_in_house' | 'planet_in_sign' | 'planet_aspect' | 'dignity' | 'conjunction' | 'opposition';
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  description: string;
}

export interface DetectedYoga {
  key: string;
  name: string;
  description: string;
  factors: string[];
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  category: string;
  confidence: number; // 0-100
}

class YogaRulesService {
  private readonly yogaRules: YogaRule[] = [
    // Rajayoga rules
    {
      key: 'yoga.gajakesari',
      name: 'Gaja-Kesari Yoga',
      description: 'Jupiter and Moon in kendra (1st, 4th, 7th, 10th) houses',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'Jupiter.house',
          operator: 'in',
          value: [1, 4, 7, 10],
          description: 'Jupiter in kendra house'
        },
        {
          type: 'planet_in_house',
          field: 'Moon.house',
          operator: 'in',
          value: [1, 4, 7, 10],
          description: 'Moon in kendra house'
        }
      ],
      priority: 1,
      category: 'rajayoga'
    },
    {
      key: 'yoga.budha-aditya',
      name: 'Budha-Aditya Yoga',
      description: 'Mercury and Sun in the same sign',
      requiredFields: ['planetPositions'],
      conditions: [
        {
          type: 'conjunction',
          field: 'Mercury.sign',
          operator: 'equals',
          value: 'Sun.sign',
          description: 'Mercury and Sun in same sign'
        }
      ],
      priority: 2,
      category: 'rajayoga'
    },
    {
      key: 'yoga.raja-yoga',
      name: 'Raja Yoga',
      description: 'Lord of 9th house in 9th, 10th, or 11th house',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'ninth_lord.house',
          operator: 'in',
          value: [9, 10, 11],
          description: '9th lord in 9th, 10th, or 11th house'
        }
      ],
      priority: 1,
      category: 'rajayoga'
    },
    // Dhanayoga rules
    {
      key: 'yoga.dhana-yoga',
      name: 'Dhana Yoga',
      description: 'Lord of 2nd house in 2nd, 5th, 9th, or 11th house',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'second_lord.house',
          operator: 'in',
          value: [2, 5, 9, 11],
          description: '2nd lord in 2nd, 5th, 9th, or 11th house'
        }
      ],
      priority: 2,
      category: 'dhanayoga'
    },
    {
      key: 'yoga.lakshmi-yoga',
      name: 'Lakshmi Yoga',
      description: 'Venus in own sign or exaltation',
      requiredFields: ['dignities'],
      conditions: [
        {
          type: 'dignity',
          field: 'Venus.status',
          operator: 'in',
          value: ['Own', 'Exalted'],
          description: 'Venus in own sign or exaltation'
        }
      ],
      priority: 3,
      category: 'dhanayoga'
    },
    // Karmayoga rules
    {
      key: 'yoga.karma-yoga',
      name: 'Karma Yoga',
      description: 'Lord of 10th house in 10th house',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'tenth_lord.house',
          operator: 'equals',
          value: 10,
          description: '10th lord in 10th house'
        }
      ],
      priority: 2,
      category: 'karmayoga'
    },
    {
      key: 'yoga.budha-aditya-karma',
      name: 'Budha-Aditya Karma Yoga',
      description: 'Mercury and Sun in 10th house',
      requiredFields: ['planetPositions'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'Mercury.house',
          operator: 'equals',
          value: 10,
          description: 'Mercury in 10th house'
        },
        {
          type: 'planet_in_house',
          field: 'Sun.house',
          operator: 'equals',
          value: 10,
          description: 'Sun in 10th house'
        }
      ],
      priority: 3,
      category: 'karmayoga'
    },
    // Mokshayoga rules
    {
      key: 'yoga.moksha-yoga',
      name: 'Moksha Yoga',
      description: 'Lord of 12th house in 12th house',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'twelfth_lord.house',
          operator: 'equals',
          value: 12,
          description: '12th lord in 12th house'
        }
      ],
      priority: 2,
      category: 'mokshayoga'
    },
    // Special yogas
    {
      key: 'yoga.panch-mahapurush',
      name: 'Panch Mahapurush Yoga',
      description: 'Any of the five planets (Sun, Moon, Mars, Mercury, Jupiter) in own sign or exaltation',
      requiredFields: ['dignities'],
      conditions: [
        {
          type: 'dignity',
          field: 'planets.status',
          operator: 'in',
          value: ['Own', 'Exalted'],
          description: 'Planet in own sign or exaltation'
        }
      ],
      priority: 1,
      category: 'special'
    },
    {
      key: 'yoga.vipreet-rajayoga',
      name: 'Vipreet Rajayoga',
      description: 'Lord of 6th, 8th, or 12th house in 6th, 8th, or 12th house',
      requiredFields: ['planetPositions', 'dignities'],
      conditions: [
        {
          type: 'planet_in_house',
          field: 'dusthana_lord.house',
          operator: 'in',
          value: [6, 8, 12],
          description: 'Dusthana lord in dusthana house'
        }
      ],
      priority: 2,
      category: 'special'
    }
  ];

  detectYogas(
    planetPositions: PlanetPosition[],
    dignities: DignityItem[],
    aspects: AspectItem[]
  ): DetectedYoga[] {
    const detectedYogas: DetectedYoga[] = [];
    
    try {
      // Create lookup maps for efficient access
      const planetMap = this.createPlanetMap(planetPositions);
      const dignityMap = this.createDignityMap(dignities);
      const aspectMap = this.createAspectMap(aspects);
      
      // Check each yoga rule
      for (const rule of this.yogaRules) {
        try {
          const yoga = this.checkYogaRule(rule, planetMap, dignityMap, aspectMap);
          if (yoga) {
            detectedYogas.push(yoga);
          }
        } catch (error) {
          logger.warn(`Error checking yoga rule ${rule.key}:`, error);
        }
      }
      
      // Sort by priority and strength
      detectedYogas.sort((a, b) => {
        const ruleA = this.yogaRules.find(r => r.key === a.key);
        const ruleB = this.yogaRules.find(r => r.key === b.key);
        
        if (ruleA && ruleB) {
          if (ruleA.priority !== ruleB.priority) {
            return ruleA.priority - ruleB.priority;
          }
        }
        
        return b.confidence - a.confidence;
      });
      
      logger.info(`Detected ${detectedYogas.length} yogas`, {
        yogas: detectedYogas.map(y => y.key),
        totalRules: this.yogaRules.length
      });
      
    } catch (error) {
      logger.error('Error detecting yogas:', error);
    }
    
    return detectedYogas;
  }

  private createPlanetMap(planetPositions: PlanetPosition[]): Map<string, PlanetPosition> {
    const map = new Map<string, PlanetPosition>();
    
    for (const planet of planetPositions) {
      map.set(planet.planet, planet);
    }
    
    return map;
  }

  private createDignityMap(dignities: DignityItem[]): Map<string, DignityItem> {
    const map = new Map<string, DignityItem>();
    
    for (const dignity of dignities) {
      map.set(dignity.planet, dignity);
    }
    
    return map;
  }

  private createAspectMap(aspects: AspectItem[]): Map<string, AspectItem[]> {
    const map = new Map<string, AspectItem[]>();
    
    for (const aspect of aspects) {
      if (!map.has(aspect.fromPlanet)) {
        map.set(aspect.fromPlanet, []);
      }
      map.get(aspect.fromPlanet)!.push(aspect);
    }
    
    return map;
  }

  private checkYogaRule(
    rule: YogaRule,
    planetMap: Map<string, PlanetPosition>,
    dignityMap: Map<string, DignityItem>,
    aspectMap: Map<string, AspectItem[]>
  ): DetectedYoga | null {
    const factors: string[] = [];
    let matchedConditions = 0;
    let totalConditions = rule.conditions.length;
    
    // Check each condition
    for (const condition of rule.conditions) {
      const conditionResult = this.checkCondition(condition, planetMap, dignityMap, aspectMap);
      
      if (conditionResult.matched) {
        matchedConditions++;
        factors.push(conditionResult.description);
      } else if (conditionResult.required) {
        // Required condition not met
        return null;
      }
    }
    
    // Calculate confidence based on matched conditions
    const confidence = Math.round((matchedConditions / totalConditions) * 100);
    
    if (confidence < 50) {
      return null; // Not confident enough
    }
    
    // Determine strength based on confidence and factors
    let strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
    if (confidence >= 90) {
      strength = 'very_strong';
    } else if (confidence >= 75) {
      strength = 'strong';
    } else if (confidence >= 60) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }
    
    return {
      key: rule.key,
      name: rule.name,
      description: rule.description,
      factors,
      strength,
      category: rule.category,
      confidence
    };
  }

  private checkCondition(
    condition: YogaCondition,
    planetMap: Map<string, PlanetPosition>,
    dignityMap: Map<string, DignityItem>,
    aspectMap: Map<string, AspectItem[]>
  ): { matched: boolean; required: boolean; description: string } {
    try {
      switch (condition.type) {
        case 'planet_in_house':
          return this.checkPlanetInHouse(condition, planetMap);
        
        case 'planet_in_sign':
          return this.checkPlanetInSign(condition, planetMap);
        
        case 'planet_aspect':
          return this.checkPlanetAspect(condition, aspectMap);
        
        case 'dignity':
          return this.checkDignity(condition, dignityMap);
        
        case 'conjunction':
          return this.checkConjunction(condition, planetMap);
        
        case 'opposition':
          return this.checkOpposition(condition, planetMap);
        
        default:
          logger.warn(`Unknown condition type: ${condition.type}`);
          return { matched: false, required: false, description: condition.description };
      }
    } catch (error) {
      logger.warn(`Error checking condition ${condition.type}:`, error);
      return { matched: false, required: false, description: condition.description };
    }
  }

  private checkPlanetInHouse(
    condition: YogaCondition,
    planetMap: Map<string, PlanetPosition>
  ): { matched: boolean; required: boolean; description: string } {
    const [planetName, field] = condition.field.split('.');
    const planet = planetMap.get(planetName);
    
    if (!planet) {
      return { matched: false, required: true, description: condition.description };
    }
    
    const value = planet[field as keyof PlanetPosition];
    const matched = this.compareValues(value, condition.operator, condition.value);
    
    return {
      matched,
      required: true,
      description: `${planetName} in house ${value}`
    };
  }

  private checkPlanetInSign(
    condition: YogaCondition,
    planetMap: Map<string, PlanetPosition>
  ): { matched: boolean; required: boolean; description: string } {
    const [planetName, field] = condition.field.split('.');
    const planet = planetMap.get(planetName);
    
    if (!planet) {
      return { matched: false, required: true, description: condition.description };
    }
    
    const value = planet[field as keyof PlanetPosition];
    const matched = this.compareValues(value, condition.operator, condition.value);
    
    return {
      matched,
      required: true,
      description: `${planetName} in ${value}`
    };
  }

  private checkPlanetAspect(
    condition: YogaCondition,
    aspectMap: Map<string, AspectItem[]>
  ): { matched: boolean; required: boolean; description: string } {
    const [planetName] = condition.field.split('.');
    const aspects = aspectMap.get(planetName) || [];
    
    if (aspects.length === 0) {
      return { matched: false, required: false, description: condition.description };
    }
    
    // Check if any aspect matches the condition
    const matched = aspects.some(aspect => 
      this.compareValues(aspect.type, condition.operator, condition.value)
    );
    
    return {
      matched,
      required: false,
      description: `${planetName} aspects found`
    };
  }

  private checkDignity(
    condition: YogaCondition,
    dignityMap: Map<string, DignityItem>
  ): { matched: boolean; required: boolean; description: string } {
    const [planetName, field] = condition.field.split('.');
    const dignity = dignityMap.get(planetName);
    
    if (!dignity) {
      return { matched: false, required: false, description: condition.description };
    }
    
    const value = dignity[field as keyof DignityItem];
    const matched = this.compareValues(value, condition.operator, condition.value);
    
    return {
      matched,
      required: false,
      description: `${planetName} dignity: ${value}`
    };
  }

  private checkConjunction(
    condition: YogaCondition,
    planetMap: Map<string, PlanetPosition>
  ): { matched: boolean; required: boolean; description: string } {
    const [planet1, field1] = condition.field.split('.');
    const [planet2, field2] = condition.value.split('.');
    
    const p1 = planetMap.get(planet1);
    const p2 = planetMap.get(planet2);
    
    if (!p1 || !p2) {
      return { matched: false, required: true, description: condition.description };
    }
    
    const value1 = p1[field1 as keyof PlanetPosition];
    const value2 = p2[field2 as keyof PlanetPosition];
    
    const matched = value1 === value2;
    
    return {
      matched,
      required: true,
      description: `${planet1} and ${planet2} in same ${field1}`
    };
  }

  private checkOpposition(
    condition: YogaCondition,
    planetMap: Map<string, PlanetPosition>
  ): { matched: boolean; required: boolean; description: string } {
    const [planet1, field1] = condition.field.split('.');
    const [planet2, field2] = condition.value.split('.');
    
    const p1 = planetMap.get(planet1);
    const p2 = planetMap.get(planet2);
    
    if (!p1 || !p2) {
      return { matched: false, required: true, description: condition.description };
    }
    
    const value1 = p1[field1 as keyof PlanetPosition];
    const value2 = p2[field2 as keyof PlanetPosition];
    
    // Check for opposition (180 degrees apart)
    const matched = this.isOpposition(value1, value2);
    
    return {
      matched,
      required: true,
      description: `${planet1} and ${planet2} in opposition`
    };
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'exists':
        return actual !== undefined && actual !== null;
      case 'not_exists':
        return actual === undefined || actual === null;
      default:
        return false;
    }
  }

  private isOpposition(value1: any, value2: any): boolean {
    // This is a simplified opposition check
    // In a real implementation, you'd need to calculate the actual degrees
    // and check if they're approximately 180 degrees apart
    return false; // Placeholder
  }

  // Public method to get all available yoga rules
  getAvailableYogaRules(): YogaRule[] {
    return [...this.yogaRules];
  }

  // Public method to get yoga rules by category
  getYogaRulesByCategory(category: string): YogaRule[] {
    return this.yogaRules.filter(rule => rule.category === category);
  }

  // Public method to validate yoga rule configuration
  validateYogaRule(rule: YogaRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!rule.key || rule.key.trim() === '') {
      errors.push('Yoga key is required');
    }
    
    if (!rule.name || rule.name.trim() === '') {
      errors.push('Yoga name is required');
    }
    
    if (!rule.description || rule.description.trim() === '') {
      errors.push('Yoga description is required');
    }
    
    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('At least one condition is required');
    }
    
    if (!rule.requiredFields || rule.requiredFields.length === 0) {
      errors.push('Required fields must be specified');
    }
    
    if (rule.priority < 1 || rule.priority > 10) {
      errors.push('Priority must be between 1 and 10');
    }
    
    if (!['rajayoga', 'dhanayoga', 'karmayoga', 'mokshayoga', 'special'].includes(rule.category)) {
      errors.push('Invalid category');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const yogaRulesService = new YogaRulesService();
export default yogaRulesService;
