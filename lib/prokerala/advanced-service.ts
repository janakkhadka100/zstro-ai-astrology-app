// lib/prokerala/advanced-service.ts
// Enhanced Pokhrel service with advanced Vedic astrology analysis

import { AdvancedAstrologyData, AdvancedPlanetPosition, YogaItem, DoshaItem } from '@/lib/prokerala/types-advanced';
import { advancedYogaDetector } from '@/lib/services/astro/advanced-yogas';
import { dashaAnalyzer } from '@/lib/services/astro/dasha-analysis';
import { logger } from '@/lib/services/logger';

export class AdvancedPokhrelService {
  
  // Transform basic Pokhrel data to advanced structure
  transformToAdvancedData(basicData: any): AdvancedAstrologyData {
    try {
      const planets = this.transformPlanets(basicData.planets || []);
      const yogas = this.detectAdvancedYogas(planets);
      const doshas = this.detectAdvancedDoshas(planets);
      const shadbala = this.calculateShadbala(planets);
      const divisionalCharts = this.buildDivisionalCharts(basicData);
      
      const birthDate = new Date(basicData.birthData?.date || new Date());
      const vimshottari = dashaAnalyzer.analyzeVimshottariDasha(planets, birthDate);
      const yogini = dashaAnalyzer.analyzeYoginiDasha(planets, birthDate);
      
      return {
        ascendant: {
          sign: basicData.ascendant?.sign || 'Unknown',
          degree: basicData.ascendant?.degree || 0,
          lord: basicData.ascendant?.lord || 'Unknown',
          nakshatra: basicData.ascendant?.nakshatra || 'Unknown',
          nakshatraLord: basicData.ascendant?.nakshatraLord || 'Unknown'
        },
        planets,
        yogas,
        doshas,
        dashas: {
          vimshottari,
          yogini
        },
        shadbala,
        divisionalCharts,
        birthData: {
          date: basicData.birthData?.date || '',
          time: basicData.birthData?.time || '',
          place: basicData.birthData?.place || '',
          latitude: basicData.birthData?.latitude || 0,
          longitude: basicData.birthData?.longitude || 0,
          timezone: basicData.birthData?.timezone || 'UTC'
        },
        analysis: {
          strengths: this.identifyStrengths(planets, yogas),
          weaknesses: this.identifyWeaknesses(planets, doshas),
          career: this.analyzeCareer(planets, divisionalCharts),
          marriage: this.analyzeMarriage(planets, divisionalCharts),
          health: this.analyzeHealth(planets),
          spirituality: this.analyzeSpirituality(planets, yogas),
          remedies: this.suggestRemedies(doshas, planets)
        }
      };
    } catch (error) {
      logger.error('Error transforming to advanced data', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to transform astrological data');
    }
  }
  
  // Transform basic planet data to advanced structure
  private transformPlanets(basicPlanets: any[]): AdvancedPlanetPosition[] {
    return basicPlanets.map(planet => ({
      planet: planet.planet || 'Unknown',
      sign: planet.sign || 'Unknown',
      house: planet.house || 0,
      lord: planet.lord || 'Unknown',
      isRetro: planet.isRetro || false,
      dignity: this.determineDignity(planet),
      degree: planet.degree || 0,
      nakshatra: planet.nakshatra || 'Unknown',
      nakshatraLord: planet.nakshatraLord || 'Unknown',
      shadbala: planet.shadbala || 0,
      aspects: planet.aspects || [],
      conjunctions: planet.conjunctions || []
    }));
  }
  
  // Determine planetary dignity
  private determineDignity(planet: any): 'Own' | 'Exalted' | 'Debilitated' | 'Neutral' | 'Enemy' | 'Friend' {
    if (planet.dignity) return planet.dignity;
    
    // Basic dignity determination based on sign
    const exaltedSigns: { [key: string]: string } = {
      'Sun': 'Aries',
      'Moon': 'Taurus',
      'Mars': 'Capricorn',
      'Mercury': 'Virgo',
      'Jupiter': 'Cancer',
      'Venus': 'Pisces',
      'Saturn': 'Libra'
    };
    
    const ownSigns: { [key: string]: string[] } = {
      'Sun': ['Leo'],
      'Moon': ['Cancer'],
      'Mars': ['Aries', 'Scorpio'],
      'Mercury': ['Gemini', 'Virgo'],
      'Jupiter': ['Sagittarius', 'Pisces'],
      'Venus': ['Taurus', 'Libra'],
      'Saturn': ['Capricorn', 'Aquarius']
    };
    
    const sign = planet.sign;
    const planetName = planet.planet;
    
    if (exaltedSigns[planetName] === sign) return 'Exalted';
    if (ownSigns[planetName]?.includes(sign)) return 'Own';
    
    return 'Neutral';
  }
  
  // Detect advanced yogas
  private detectAdvancedYogas(planets: AdvancedPlanetPosition[]): YogaItem[] {
    try {
      return advancedYogaDetector.detectAllYogas(planets);
    } catch (error) {
      logger.error('Error detecting yogas', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }
  
  // Detect advanced doshas
  private detectAdvancedDoshas(planets: AdvancedPlanetPosition[]): DoshaItem[] {
    const doshas: DoshaItem[] = [];
    
    // Kaal Sarp Dosha detection
    const rahu = planets.find(p => p.planet === 'Rahu');
    const ketu = planets.find(p => p.planet === 'Ketu');
    
    if (rahu && ketu) {
      const rahuHouse = rahu.house;
      const ketuHouse = ketu.house;
      
      // Check if all planets are between Rahu and Ketu
      const allPlanetsBetween = planets.every(planet => {
        if (planet.planet === 'Rahu' || planet.planet === 'Ketu') return true;
        return this.isBetweenHouses(planet.house, rahuHouse, ketuHouse);
      });
      
      if (allPlanetsBetween) {
        doshas.push({
          label: 'Kaal Sarp Dosha',
          type: 'Kaal Sarp',
          factors: ['Rahu', 'Ketu'],
          description: 'All planets are positioned between Rahu and Ketu',
          severity: 'High',
          remedies: [
            'Worship Lord Shiva',
            'Chant Maha Mrityunjaya Mantra',
            'Donate to snake temples',
            'Wear silver ornaments'
          ]
        });
      }
    }
    
    // Mangal Dosha detection
    const mars = planets.find(p => p.planet === 'Mars');
    if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) {
      doshas.push({
        label: 'Mangal Dosha',
        type: 'Mangal',
        factors: ['Mars'],
        description: 'Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house',
        severity: 'Medium',
        remedies: [
          'Worship Lord Hanuman',
          'Chant Hanuman Chalisa',
          'Donate red items on Tuesdays',
          'Wear red coral'
        ]
      });
    }
    
    return doshas;
  }
  
  // Check if a house is between two other houses
  private isBetweenHouses(house: number, house1: number, house2: number): boolean {
    const min = Math.min(house1, house2);
    const max = Math.max(house1, house2);
    return house >= min && house <= max;
  }
  
  // Calculate Shadbala (simplified)
  private calculateShadbala(planets: AdvancedPlanetPosition[]): any {
    const shadbala: any = {};
    
    planets.forEach(planet => {
      const baseStrength = this.getBasePlanetStrength(planet.planet);
      const dignityMultiplier = this.getDignityMultiplier(planet.dignity);
      const houseMultiplier = this.getHouseMultiplier(planet.house);
      const retrogradeMultiplier = planet.isRetro ? 0.8 : 1.0;
      
      const total = baseStrength * dignityMultiplier * houseMultiplier * retrogradeMultiplier;
      
      shadbala[planet.planet] = {
        total: total,
        sthana: baseStrength * houseMultiplier,
        kala: baseStrength * dignityMultiplier,
        cheshta: baseStrength * retrogradeMultiplier,
        naisargika: baseStrength,
        drik: baseStrength * 0.9,
        bhava: baseStrength * houseMultiplier,
        strength: total > 1.2 ? 'Strong' : total > 0.8 ? 'Medium' : 'Weak'
      };
    });
    
    return shadbala;
  }
  
  private getBasePlanetStrength(planet: string): number {
    const strengths: { [key: string]: number } = {
      'Sun': 1.0,
      'Moon': 1.0,
      'Mars': 0.8,
      'Mercury': 0.9,
      'Jupiter': 1.1,
      'Venus': 1.0,
      'Saturn': 0.7,
      'Rahu': 0.6,
      'Ketu': 0.6
    };
    return strengths[planet] || 0.5;
  }
  
  private getDignityMultiplier(dignity: string): number {
    const multipliers: { [key: string]: number } = {
      'Exalted': 1.5,
      'Own': 1.2,
      'Neutral': 1.0,
      'Friend': 0.9,
      'Enemy': 0.7,
      'Debilitated': 0.5
    };
    return multipliers[dignity] || 1.0;
  }
  
  private getHouseMultiplier(house: number): number {
    const multipliers: { [key: number]: number } = {
      1: 1.2, 5: 1.1, 9: 1.1, 10: 1.2,
      2: 1.0, 3: 0.9, 4: 1.0, 6: 0.8,
      7: 1.0, 8: 0.7, 11: 1.0, 12: 0.6
    };
    return multipliers[house] || 1.0;
  }
  
  // Build divisional charts (simplified)
  private buildDivisionalCharts(basicData: any): any {
    return {
      D1: {
        planets: basicData.planets || [],
        houses: this.buildHouses(basicData.planets || [])
      },
      D9: {
        planets: basicData.navamsha || [],
        houses: this.buildHouses(basicData.navamsha || [])
      },
      D10: {
        planets: basicData.dashamsha || [],
        houses: this.buildHouses(basicData.dashamsha || [])
      }
    };
  }
  
  private buildHouses(planets: any[]): any[] {
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const housePlanets = planets.filter(p => p.house === i);
      houses.push({
        number: i,
        sign: housePlanets[0]?.sign || 'Unknown',
        lord: housePlanets[0]?.lord || 'Unknown',
        planets: housePlanets.map(p => p.planet)
      });
    }
    return houses;
  }
  
  // Analysis methods
  private identifyStrengths(planets: AdvancedPlanetPosition[], yogas: YogaItem[]): string[] {
    const strengths = [];
    
    // Strong planets
    const strongPlanets = planets.filter(p => p.shadbala > 1.2);
    if (strongPlanets.length > 0) {
      strengths.push(`Strong planets: ${strongPlanets.map(p => p.planet).join(', ')}`);
    }
    
    // Rajyogas
    const rajyogas = yogas.filter(y => y.type === 'Rajyoga');
    if (rajyogas.length > 0) {
      strengths.push(`Rajyogas present: ${rajyogas.map(y => y.label).join(', ')}`);
    }
    
    return strengths;
  }
  
  private identifyWeaknesses(planets: AdvancedPlanetPosition[], doshas: DoshaItem[]): string[] {
    const weaknesses = [];
    
    // Weak planets
    const weakPlanets = planets.filter(p => p.shadbala < 0.8);
    if (weakPlanets.length > 0) {
      weaknesses.push(`Weak planets: ${weakPlanets.map(p => p.planet).join(', ')}`);
    }
    
    // Doshas
    if (doshas.length > 0) {
      weaknesses.push(`Doshas present: ${doshas.map(d => d.label).join(', ')}`);
    }
    
    return weaknesses;
  }
  
  private analyzeCareer(planets: AdvancedPlanetPosition[], divisionalCharts: any): string[] {
    const career = [];
    
    // 10th house analysis
    const tenthHouse = planets.filter(p => p.house === 10);
    if (tenthHouse.length > 0) {
      career.push(`10th house planets: ${tenthHouse.map(p => p.planet).join(', ')}`);
    }
    
    // Dashamsha analysis
    if (divisionalCharts.D10) {
      career.push('Dashamsha chart available for career analysis');
    }
    
    return career;
  }
  
  private analyzeMarriage(planets: AdvancedPlanetPosition[], divisionalCharts: any): string[] {
    const marriage = [];
    
    // 7th house analysis
    const seventhHouse = planets.filter(p => p.house === 7);
    if (seventhHouse.length > 0) {
      marriage.push(`7th house planets: ${seventhHouse.map(p => p.planet).join(', ')}`);
    }
    
    // Navamsha analysis
    if (divisionalCharts.D9) {
      marriage.push('Navamsha chart available for marriage analysis');
    }
    
    return marriage;
  }
  
  private analyzeHealth(planets: AdvancedPlanetPosition[]): string[] {
    const health = [];
    
    // 6th house analysis
    const sixthHouse = planets.filter(p => p.house === 6);
    if (sixthHouse.length > 0) {
      health.push(`6th house planets: ${sixthHouse.map(p => p.planet).join(', ')}`);
    }
    
    // 8th house analysis
    const eighthHouse = planets.filter(p => p.house === 8);
    if (eighthHouse.length > 0) {
      health.push(`8th house planets: ${eighthHouse.map(p => p.planet).join(', ')}`);
    }
    
    return health;
  }
  
  private analyzeSpirituality(planets: AdvancedPlanetPosition[], yogas: YogaItem[]): string[] {
    const spirituality = [];
    
    // 9th house analysis
    const ninthHouse = planets.filter(p => p.house === 9);
    if (ninthHouse.length > 0) {
      spirituality.push(`9th house planets: ${ninthHouse.map(p => p.planet).join(', ')}`);
    }
    
    // Spiritual yogas
    const spiritualYogas = yogas.filter(y => y.label.includes('Gajakesari') || y.label.includes('Hamsa'));
    if (spiritualYogas.length > 0) {
      spirituality.push(`Spiritual yogas: ${spiritualYogas.map(y => y.label).join(', ')}`);
    }
    
    return spirituality;
  }
  
  private suggestRemedies(doshas: DoshaItem[], planets: AdvancedPlanetPosition[]): string[] {
    const remedies = [];
    
    // Remedies from doshas
    doshas.forEach(dosha => {
      remedies.push(...dosha.remedies);
    });
    
    // General remedies for weak planets
    const weakPlanets = planets.filter(p => p.shadbala < 0.8);
    weakPlanets.forEach(planet => {
      remedies.push(`Strengthen ${planet.planet} through appropriate gemstones and mantras`);
    });
    
    return [...new Set(remedies)]; // Remove duplicates
  }
}

export const advancedPokhrelService = new AdvancedPokhrelService();
