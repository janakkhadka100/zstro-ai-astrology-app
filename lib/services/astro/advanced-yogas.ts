// lib/services/astro/advanced-yogas.ts
// Advanced yoga detection system for Vedic astrology

import { AdvancedPlanetPosition, YogaItem } from '@/lib/prokerala/types-advanced';

export class AdvancedYogaDetector {
  
  // Rajyoga Detection: Trikon-Kendra lords association
  detectRajyogas(planets: AdvancedPlanetPosition[]): YogaItem[] {
    const yogas: YogaItem[] = [];
    const trikonHouses = [1, 5, 9]; // Lagna, 5th, 9th
    const kendraHouses = [1, 4, 7, 10]; // Lagna, 4th, 7th, 10th
    
    // Get lords of trikon and kendra houses
    const trikonLords = new Set<string>();
    const kendraLords = new Set<string>();
    
    planets.forEach(planet => {
      if (trikonHouses.includes(planet.house)) {
        trikonLords.add(planet.lord);
      }
      if (kendraHouses.includes(planet.house)) {
        kendraLords.add(planet.lord);
      }
    });
    
    // Check for Rajyoga formation
    const commonLords = [...trikonLords].filter(lord => kendraLords.has(lord));
    
    if (commonLords.length > 0) {
      yogas.push({
        label: 'Rajyoga',
        type: 'Rajyoga',
        factors: commonLords,
        description: 'Trikon and Kendra lords are associated, indicating royal or high status',
        strength: commonLords.length >= 2 ? 'Strong' : 'Medium',
        effects: [
          'High social status and recognition',
          'Leadership qualities',
          'Wealth and prosperity',
          'Political or administrative success'
        ]
      });
    }
    
    return yogas;
  }
  
  // Panchmahapurush Yogas
  detectPanchmahapurushYogas(planets: AdvancedPlanetPosition[]): YogaItem[] {
    const yogas: YogaItem[] = [];
    const kendraHouses = [1, 4, 7, 10];
    
    const panchmahapurushPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    panchmahapurushPlanets.forEach(planetName => {
      const planet = planets.find(p => p.planet === planetName);
      if (!planet) return;
      
      const isInKendra = kendraHouses.includes(planet.house);
      const isOwnOrExalted = planet.dignity === 'Own' || planet.dignity === 'Exalted';
      
      if (isInKendra && isOwnOrExalted) {
        const yogaName = this.getPanchmahapurushYogaName(planetName);
        yogas.push({
          label: yogaName,
          type: 'Panchmahapurush',
          factors: [planetName],
          description: `${planetName} in own/exalted sign in Kendra house`,
          strength: 'Strong',
          effects: this.getPanchmahapurushEffects(planetName)
        });
      }
    });
    
    return yogas;
  }
  
  // Vipareeta Rajyoga
  detectVipareetaRajyogas(planets: AdvancedPlanetPosition[]): YogaItem[] {
    const yogas: YogaItem[] = [];
    const dusthanaHouses = [6, 8, 12]; // 6th, 8th, 12th houses
    
    // Check if dusthana lords are in dusthana houses
    const dusthanaLords = new Set<string>();
    planets.forEach(planet => {
      if (dusthanaHouses.includes(planet.house)) {
        dusthanaLords.add(planet.lord);
      }
    });
    
    const dusthanaLordsInDusthana = planets.filter(planet => 
      dusthanaHouses.includes(planet.house) && 
      dusthanaLords.has(planet.lord)
    );
    
    if (dusthanaLordsInDusthana.length > 0) {
      yogas.push({
        label: 'Vipareeta Rajyoga',
        type: 'Vipareeta',
        factors: dusthanaLordsInDusthana.map(p => p.planet),
        description: 'Dusthana lords placed in dusthana houses create reverse Rajyoga',
        strength: dusthanaLordsInDusthana.length >= 2 ? 'Strong' : 'Medium',
        effects: [
          'Success through adversity',
          'Wealth after struggles',
          'Recovery from difficult situations',
          'Hidden talents and abilities'
        ]
      });
    }
    
    return yogas;
  }
  
  // Gajakesari Yoga
  detectGajakesariYoga(planets: AdvancedPlanetPosition[]): YogaItem | null {
    const moon = planets.find(p => p.planet === 'Moon');
    const jupiter = planets.find(p => p.planet === 'Jupiter');
    
    if (!moon || !jupiter) return null;
    
    const kendraHouses = [1, 4, 7, 10];
    const isMoonInKendra = kendraHouses.includes(moon.house);
    const isJupiterInKendra = kendraHouses.includes(jupiter.house);
    
    if (isMoonInKendra && isJupiterInKendra) {
      return {
        label: 'Gajakesari Yoga',
        type: 'Special',
        factors: ['Moon', 'Jupiter'],
        description: 'Moon and Jupiter in Kendra houses from each other',
        strength: 'Strong',
        effects: [
          'High intelligence and wisdom',
          'Respect and recognition',
          'Spiritual inclination',
          'Good fortune and prosperity'
        ]
      };
    }
    
    return null;
  }
  
  // Budha-Aditya Yoga
  detectBudhaAdityaYoga(planets: AdvancedPlanetPosition[]): YogaItem | null {
    const sun = planets.find(p => p.planet === 'Sun');
    const mercury = planets.find(p => p.planet === 'Mercury');
    
    if (!sun || !mercury) return null;
    
    if (sun.house === mercury.house) {
      return {
        label: 'Budha-Aditya Yoga',
        type: 'Dhanayoga',
        factors: ['Sun', 'Mercury'],
        description: 'Sun and Mercury in the same house',
        strength: 'Medium',
        effects: [
          'Intelligence and communication skills',
          'Wealth through knowledge',
          'Good relationship with authorities',
          'Success in education and writing'
        ]
      };
    }
    
    return null;
  }
  
  // Main detection function
  detectAllYogas(planets: AdvancedPlanetPosition[]): YogaItem[] {
    const allYogas: YogaItem[] = [];
    
    // Detect different types of yogas
    allYogas.push(...this.detectRajyogas(planets));
    allYogas.push(...this.detectPanchmahapurushYogas(planets));
    allYogas.push(...this.detectVipareetaRajyogas(planets));
    
    const gajakesari = this.detectGajakesariYoga(planets);
    if (gajakesari) allYogas.push(gajakesari);
    
    const budhaAditya = this.detectBudhaAdityaYoga(planets);
    if (budhaAditya) allYogas.push(budhaAditya);
    
    return allYogas;
  }
  
  private getPanchmahapurushYogaName(planet: string): string {
    const names: { [key: string]: string } = {
      'Mars': 'Ruchaka Yoga',
      'Mercury': 'Bhadra Yoga',
      'Jupiter': 'Hamsa Yoga',
      'Venus': 'Malavya Yoga',
      'Saturn': 'Sasa Yoga'
    };
    return names[planet] || `${planet} Panchmahapurush Yoga`;
  }
  
  private getPanchmahapurushEffects(planet: string): string[] {
    const effects: { [key: string]: string[] } = {
      'Mars': ['Courage and leadership', 'Military or sports success', 'Strong willpower'],
      'Mercury': ['Intelligence and communication', 'Business success', 'Writing abilities'],
      'Jupiter': ['Wisdom and spirituality', 'Teaching abilities', 'High moral character'],
      'Venus': ['Artistic talents', 'Beauty and charm', 'Luxury and comfort'],
      'Saturn': ['Discipline and hard work', 'Long-term success', 'Spiritual wisdom']
    };
    return effects[planet] || ['Special abilities and recognition'];
  }
}

export const advancedYogaDetector = new AdvancedYogaDetector();
