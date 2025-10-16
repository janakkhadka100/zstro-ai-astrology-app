// lib/services/astro/dasha-analysis.ts
// Advanced dasha analysis system for Vedic astrology

import { AdvancedPlanetPosition, DashaPeriod, VimshottariDasha, YoginiDasha } from '@/lib/prokerala/types-advanced';

export class DashaAnalyzer {
  
  // Vimshottari Dasha periods (120 years total)
  private vimshottariPeriods = {
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17,
    'Ketu': 7,
    'Venus': 20
  };
  
  // Yogini Dasha periods (36 years total)
  private yoginiPeriods = {
    'Mangala': 1,
    'Pingala': 2,
    'Dhanya': 3,
    'Bhramari': 4,
    'Bhadrika': 5,
    'Ulka': 6,
    'Siddha': 7,
    'Sankata': 8
  };
  
  // Analyze Vimshottari Dasha
  analyzeVimshottariDasha(
    planets: AdvancedPlanetPosition[],
    birthDate: Date,
    currentDate: Date = new Date()
  ): VimshottariDasha {
    const ageInYears = this.calculateAge(birthDate, currentDate);
    const totalYears = 120;
    const currentAge = ageInYears % totalYears;
    
    let accumulatedYears = 0;
    const dashaSequence = Object.keys(this.vimshottariPeriods);
    const currentDasha = this.findCurrentDasha(currentAge, dashaSequence);
    
    const timeline = this.generateDashaTimeline(dashaSequence, birthDate);
    const current = this.getCurrentDashaPeriod(timeline, currentDate);
    
    return {
      current,
      timeline,
      major: timeline.filter(d => d.mahadasha === current.mahadasha),
      sub: timeline.filter(d => d.antardasha === current.antardasha),
      subSub: timeline.filter(d => d.pratyantar === current.pratyantar)
    };
  }
  
  // Analyze Yogini Dasha
  analyzeYoginiDasha(
    planets: AdvancedPlanetPosition[],
    birthDate: Date,
    currentDate: Date = new Date()
  ): YoginiDasha {
    const ageInYears = this.calculateAge(birthDate, currentDate);
    const totalYears = 36;
    const currentAge = ageInYears % totalYears;
    
    const yoginiSequence = Object.keys(this.yoginiPeriods);
    const currentYogini = this.findCurrentYogini(currentAge, yoginiSequence);
    
    const timeline = this.generateYoginiTimeline(yoginiSequence, birthDate);
    const current = this.getCurrentYoginiPeriod(timeline, currentDate);
    
    return {
      current,
      timeline
    };
  }
  
  // Get dasha effects based on planet positions
  getDashaEffects(
    dashaPlanet: string,
    planets: AdvancedPlanetPosition[],
    house: number
  ): string[] {
    const planet = planets.find(p => p.planet === dashaPlanet);
    if (!planet) return ['Planet data not available'];
    
    const effects: string[] = [];
    
    // Basic planet effects
    effects.push(...this.getPlanetBasicEffects(dashaPlanet));
    
    // House effects
    effects.push(...this.getHouseEffects(house));
    
    // Sign effects
    effects.push(...this.getSignEffects(planet.sign));
    
    // Dignity effects
    if (planet.dignity === 'Exalted') {
      effects.push('Enhanced positive effects due to exaltation');
    } else if (planet.dignity === 'Debilitated') {
      effects.push('Challenges and obstacles due to debilitation');
    }
    
    // Retrograde effects
    if (planet.isRetro) {
      effects.push('Internal reflection and introspection period');
    }
    
    return effects;
  }
  
  private calculateAge(birthDate: Date, currentDate: Date): number {
    const diffTime = Math.abs(currentDate.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays / 365.25;
  }
  
  private findCurrentDasha(age: number, sequence: string[]): string {
    let accumulated = 0;
    for (const planet of sequence) {
      accumulated += this.vimshottariPeriods[planet as keyof typeof this.vimshottariPeriods];
      if (age <= accumulated) {
        return planet;
      }
    }
    return sequence[0]; // Fallback
  }
  
  private findCurrentYogini(age: number, sequence: string[]): string {
    let accumulated = 0;
    for (const yogini of sequence) {
      accumulated += this.yoginiPeriods[yogini as keyof typeof this.yoginiPeriods];
      if (age <= accumulated) {
        return yogini;
      }
    }
    return sequence[0]; // Fallback
  }
  
  private generateDashaTimeline(sequence: string[], birthDate: Date): DashaPeriod[] {
    const timeline: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);
    
    for (const planet of sequence) {
      const years = this.vimshottariPeriods[planet as keyof typeof this.vimshottariPeriods];
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + years);
      
      timeline.push({
        mahadasha: planet,
        antardasha: planet, // Simplified for now
        pratyantar: planet,
        start: currentDate.toISOString(),
        end: endDate.toISOString(),
        duration: `${years} years`,
        planetHouse: 1, // Simplified
        planetLord: planet,
        effects: this.getDashaEffects(planet, [], 1)
      });
      
      currentDate = endDate;
    }
    
    return timeline;
  }
  
  private generateYoginiTimeline(sequence: string[], birthDate: Date): any[] {
    const timeline: any[] = [];
    let currentDate = new Date(birthDate);
    
    for (const yogini of sequence) {
      const years = this.yoginiPeriods[yogini as keyof typeof this.yoginiPeriods];
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + years);
      
      timeline.push({
        yogini,
        planet: this.getYoginiPlanet(yogini),
        start: currentDate.toISOString(),
        end: endDate.toISOString(),
        effects: this.getYoginiEffects(yogini)
      });
      
      currentDate = endDate;
    }
    
    return timeline;
  }
  
  private getCurrentDashaPeriod(timeline: DashaPeriod[], currentDate: Date): DashaPeriod {
    const current = timeline.find(d => 
      new Date(d.start) <= currentDate && new Date(d.end) >= currentDate
    );
    return current || timeline[0];
  }
  
  private getCurrentYoginiPeriod(timeline: any[], currentDate: Date): any {
    const current = timeline.find(d => 
      new Date(d.start) <= currentDate && new Date(d.end) >= currentDate
    );
    return current || timeline[0];
  }
  
  private getPlanetBasicEffects(planet: string): string[] {
    const effects: { [key: string]: string[] } = {
      'Sun': ['Leadership', 'Authority', 'Government connections', 'Health issues'],
      'Moon': ['Emotions', 'Mind', 'Public relations', 'Maternal influences'],
      'Mars': ['Energy', 'Courage', 'Conflicts', 'Accidents'],
      'Mercury': ['Communication', 'Business', 'Education', 'Nervousness'],
      'Jupiter': ['Wisdom', 'Spirituality', 'Teaching', 'Expansion'],
      'Venus': ['Relationships', 'Arts', 'Luxury', 'Romance'],
      'Saturn': ['Discipline', 'Hard work', 'Delays', 'Long-term gains'],
      'Rahu': ['Desires', 'Foreign connections', 'Technology', 'Illusions'],
      'Ketu': ['Spirituality', 'Detachment', 'Mysticism', 'Losses']
    };
    return effects[planet] || ['General planetary influences'];
  }
  
  private getHouseEffects(house: number): string[] {
    const houseEffects: { [key: number]: string[] } = {
      1: ['Personality', 'Health', 'Appearance', 'Overall life'],
      2: ['Wealth', 'Family', 'Speech', 'Food habits'],
      3: ['Courage', 'Siblings', 'Communication', 'Short journeys'],
      4: ['Mother', 'Home', 'Education', 'Property'],
      5: ['Children', 'Creativity', 'Speculation', 'Romance'],
      6: ['Health', 'Service', 'Enemies', 'Daily work'],
      7: ['Marriage', 'Partnerships', 'Business', 'Spouse'],
      8: ['Transformation', 'Occult', 'Longevity', 'Shared resources'],
      9: ['Father', 'Higher learning', 'Spirituality', 'Long journeys'],
      10: ['Career', 'Reputation', 'Authority', 'Public image'],
      11: ['Gains', 'Friends', 'Aspirations', 'Income'],
      12: ['Losses', 'Spirituality', 'Foreign lands', 'Subconscious']
    };
    return houseEffects[house] || ['General house influences'];
  }
  
  private getSignEffects(sign: string): string[] {
    const signEffects: { [key: string]: string[] } = {
      'Aries': ['Leadership', 'Initiative', 'Impatience', 'Courage'],
      'Taurus': ['Stability', 'Material comfort', 'Stubbornness', 'Patience'],
      'Gemini': ['Communication', 'Versatility', 'Restlessness', 'Intelligence'],
      'Cancer': ['Emotional', 'Protective', 'Moody', 'Intuitive'],
      'Leo': ['Dramatic', 'Confident', 'Proud', 'Generous'],
      'Virgo': ['Analytical', 'Practical', 'Critical', 'Service-oriented'],
      'Libra': ['Diplomatic', 'Harmonious', 'Indecisive', 'Aesthetic'],
      'Scorpio': ['Intense', 'Transformative', 'Secretive', 'Passionate'],
      'Sagittarius': ['Philosophical', 'Adventurous', 'Optimistic', 'Independent'],
      'Capricorn': ['Ambitious', 'Disciplined', 'Conservative', 'Practical'],
      'Aquarius': ['Innovative', 'Humanitarian', 'Eccentric', 'Independent'],
      'Pisces': ['Intuitive', 'Compassionate', 'Escapist', 'Spiritual']
    };
    return signEffects[sign] || ['General sign influences'];
  }
  
  private getYoginiPlanet(yogini: string): string {
    const yoginiPlanets: { [key: string]: string } = {
      'Mangala': 'Mars',
      'Pingala': 'Sun',
      'Dhanya': 'Jupiter',
      'Bhramari': 'Moon',
      'Bhadrika': 'Mercury',
      'Ulka': 'Venus',
      'Siddha': 'Saturn',
      'Sankata': 'Rahu'
    };
    return yoginiPlanets[yogini] || 'Unknown';
  }
  
  private getYoginiEffects(yogini: string): string[] {
    const effects: { [key: string]: string[] } = {
      'Mangala': ['Energy and courage', 'Leadership qualities', 'Potential conflicts'],
      'Pingala': ['Success and recognition', 'Authority and power', 'Health concerns'],
      'Dhanya': ['Wealth and prosperity', 'Spiritual growth', 'Family happiness'],
      'Bhramari': ['Mental peace', 'Emotional stability', 'Creative expression'],
      'Bhadrika': ['Intelligence and communication', 'Business success', 'Learning'],
      'Ulka': ['Relationships and romance', 'Artistic talents', 'Material comfort'],
      'Siddha': ['Spiritual wisdom', 'Discipline and hard work', 'Long-term success'],
      'Sankata': ['Challenges and obstacles', 'Hidden enemies', 'Transformation']
    };
    return effects[yogini] || ['General yogini influences'];
  }
}

export const dashaAnalyzer = new DashaAnalyzer();
