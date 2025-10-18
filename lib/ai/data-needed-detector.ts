// lib/ai/data-needed-detector.ts
// DataNeeded detection and analysis

import { AstroData, DataNeeded } from '@/lib/astrology/types';
import { getString, type Lang } from '@/lib/utils/i18n';

interface DataRequirement {
  type: keyof DataNeeded;
  required: boolean;
  available: boolean;
  missing: boolean;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface DataAnalysisResult {
  sufficient: boolean;
  missing: DataNeeded;
  requirements: DataRequirement[];
  confidence: number;
  recommendations: string[];
}

export class DataNeededDetector {
  private astroData: AstroData;
  private lang: Lang;

  constructor(astroData: AstroData, lang: Lang) {
    this.astroData = astroData;
    this.lang = lang;
  }

  // Analyze question and determine data requirements
  analyzeQuestion(question: string): DataAnalysisResult {
    const requirements = this.extractRequirements(question);
    const missing = this.identifyMissingData(requirements);
    const sufficient = this.isDataSufficient(requirements);
    const confidence = this.calculateConfidence(requirements, missing);
    const recommendations = this.generateRecommendations(requirements, missing);

    return {
      sufficient,
      missing,
      requirements,
      confidence,
      recommendations
    };
  }

  // Extract data requirements from question
  private extractRequirements(question: string): DataRequirement[] {
    const questionLower = question.toLowerCase();
    const isNepali = this.lang === 'ne';
    
    const requirements: DataRequirement[] = [];

    // Divisional charts
    const divisionalPatterns = this.getDivisionalPatterns(isNepali);
    const requiredDivisionals: string[] = [];
    
    for (const [pattern, chart] of Object.entries(divisionalPatterns)) {
      if (questionLower.includes(pattern)) {
        requiredDivisionals.push(chart);
      }
    }

    if (requiredDivisionals.length > 0) {
      const availableDivisionals = this.astroData.divisionals?.map(d => d.chart) || [];
      const missingDivisionals = requiredDivisionals.filter(req => 
        !availableDivisionals.includes(req)
      );

      requirements.push({
        type: 'divisionals',
        required: true,
        available: availableDivisionals.length > 0,
        missing: missingDivisionals.length > 0,
        priority: 'high',
        description: isNepali 
          ? `विभाजन चार्ट आवश्यक: ${requiredDivisionals.join(', ')}`
          : `Divisional charts required: ${requiredDivisionals.join(', ')}`
      });
    }

    // Other data types
    const dataTypes = this.getDataTypes(isNepali);
    
    for (const [type, patterns] of Object.entries(dataTypes)) {
      const isRequired = patterns.some(pattern => questionLower.includes(pattern));
      const isAvailable = this.checkDataAvailability(type as keyof AstroData);
      
      if (isRequired) {
        requirements.push({
          type: type as keyof DataNeeded,
          required: true,
          available: isAvailable,
          missing: !isAvailable,
          priority: this.getPriority(type as keyof DataNeeded),
          description: this.getDescription(type as keyof DataNeeded, isNepali)
        });
      }
    }

    return requirements;
  }

  // Get divisional chart patterns
  private getDivisionalPatterns(isNepali: boolean): Record<string, string> {
    if (isNepali) {
      return {
        'नवांश': 'D9',
        'दशमांश': 'D10',
        'द्वादशांश': 'D12',
        'त्रिंशांश': 'D30',
        'षष्ठांश': 'D60',
        'अष्टमांश': 'D8',
        'नवमांश': 'D9',
        'दशांश': 'D10',
        'चतुर्थांश': 'D4',
        'सप्तमांश': 'D7',
        'एकादशांश': 'D11',
        'षोडशांश': 'D16',
        'विंशांश': 'D20',
        'चतुर्विंशांश': 'D24',
        'सप्तविंशांश': 'D27',
        'चतुःषष्टांश': 'D64',
        'अशीतांश': 'D80',
        'शतांश': 'D100',
        'षष्टांश': 'D60'
      };
    } else {
      return {
        'navamsa': 'D9',
        'dashamsha': 'D10',
        'dwadashamsha': 'D12',
        'trimsamsha': 'D30',
        'sashtamsha': 'D60',
        'ashtamsha': 'D8',
        'navamsha': 'D9',
        'chaturthamsha': 'D4',
        'saptamsha': 'D7',
        'ekadashamsha': 'D11',
        'shodashamsha': 'D16',
        'vishamsha': 'D20',
        'chaturvishamsha': 'D24',
        'saptavishamsha': 'D27',
        'chaturshashtamsha': 'D64',
        'ashitamsha': 'D80',
        'shatamsha': 'D100',
        'shashtamsha': 'D60'
      };
    }
  }

  // Get data type patterns
  private getDataTypes(isNepali: boolean): Record<string, string[]> {
    if (isNepali) {
      return {
        shadbala: ['षड्बल', 'बल', 'शक्ति', 'शुभ', 'अशुभ', 'बलवान', 'कमजोर'],
        dashas: ['दशा', 'अंतर्दशा', 'प्रत्यंतर', 'महादशा', 'विम्शोत्तरी', 'योगिनी', 'अवधि'],
        yogas: ['योग', 'राजयोग', 'धनयोग', 'विवाह', 'संतान', 'करियर', 'सफलता'],
        doshas: ['दोष', 'कालसर्प', 'मंगल', 'केतु', 'राहु', 'शनि', 'अशुभ'],
        transits: ['गोचर', 'ट्रांजिट', 'वर्तमान', 'भविष्य', 'आगामी', 'चलन'],
        aspects: ['दृष्टि', 'अस्पेक्ट', 'युति', 'संयोग', 'देखना'],
        houses: ['घर', 'भाव', 'प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश'],
        nakshatras: ['नक्षत्र', 'तारा', 'सितारा', 'नक्षत्र', 'तारामंडल']
      };
    } else {
      return {
        shadbala: ['shadbala', 'strength', 'power', 'benefic', 'malefic', 'strong', 'weak'],
        dashas: ['dasha', 'antardasha', 'pratyantar', 'mahadasha', 'vimshottari', 'yogini', 'period'],
        yogas: ['yoga', 'rajyoga', 'dhanayoga', 'marriage', 'children', 'career', 'success'],
        doshas: ['dosha', 'kalsarpa', 'mangal', 'ketu', 'rahu', 'shani', 'malefic'],
        transits: ['gochar', 'transit', 'current', 'future', 'upcoming', 'movement'],
        aspects: ['drishti', 'aspect', 'conjunction', 'yuti', 'seeing'],
        houses: ['house', 'bhava', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'],
        nakshatras: ['nakshatra', 'star', 'constellation', 'nakshatra', 'star cluster']
      };
    }
  }

  // Check data availability
  private checkDataAvailability(type: keyof AstroData): boolean {
    const data = this.astroData[type];
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    return !!data;
  }

  // Get priority for data type
  private getPriority(type: keyof DataNeeded): 'high' | 'medium' | 'low' {
    const highPriority: (keyof DataNeeded)[] = ['divisionals', 'shadbala', 'dashas'];
    const mediumPriority: (keyof DataNeeded)[] = ['yogas', 'doshas', 'houses'];
    const lowPriority: (keyof DataNeeded)[] = ['transits', 'aspects', 'nakshatras'];

    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  }

  // Get description for data type
  private getDescription(type: keyof DataNeeded, isNepali: boolean): string {
    const descriptions = {
      shadbala: isNepali ? 'षड्बल विश्लेषण' : 'Shadbala analysis',
      dashas: isNepali ? 'दशा विश्लेषण' : 'Dasha analysis',
      yogas: isNepali ? 'योग विश्लेषण' : 'Yoga analysis',
      doshas: isNepali ? 'दोष विश्लेषण' : 'Dosha analysis',
      transits: isNepali ? 'गोचर विश्लेषण' : 'Transit analysis',
      aspects: isNepali ? 'दृष्टि विश्लेषण' : 'Aspect analysis',
      houses: isNepali ? 'भाव विश्लेषण' : 'House analysis',
      nakshatras: isNepali ? 'नक्षत्र विश्लेषण' : 'Nakshatra analysis'
    };

    return descriptions[type] || type;
  }

  // Identify missing data
  private identifyMissingData(requirements: DataRequirement[]): DataNeeded {
    const missing: DataNeeded = {
      divisionals: [],
      shadbala: false,
      dashas: false,
      yogas: false,
      doshas: false,
      transits: false,
      aspects: false,
      houses: false,
      nakshatras: false
    };

    for (const req of requirements) {
      if (req.missing) {
        if (req.type === 'divisionals') {
          // Extract missing divisional charts
          const availableDivisionals = this.astroData.divisionals?.map(d => d.chart) || [];
          const requiredDivisionals = this.extractRequiredDivisionals(req.description);
          missing.divisionals = requiredDivisionals.filter(req => 
            !availableDivisionals.includes(req)
          );
        } else {
          (missing as any)[req.type] = true;
        }
      }
    }

    return missing;
  }

  // Extract required divisional charts from description
  private extractRequiredDivisionals(description: string): string[] {
    const charts: string[] = [];
    const divisionalPatterns = this.getDivisionalPatterns(this.lang === 'ne');
    
    for (const [pattern, chart] of Object.entries(divisionalPatterns)) {
      if (description.includes(chart)) {
        charts.push(chart);
      }
    }
    
    return charts;
  }

  // Check if data is sufficient
  private isDataSufficient(requirements: DataRequirement[]): boolean {
    return requirements.every(req => !req.missing);
  }

  // Calculate confidence level
  private calculateConfidence(requirements: DataRequirement[], missing: DataNeeded): number {
    const totalRequirements = requirements.length;
    const missingRequirements = requirements.filter(req => req.missing).length;
    
    if (totalRequirements === 0) return 1.0;
    
    return 1.0 - (missingRequirements / totalRequirements);
  }

  // Generate recommendations
  private generateRecommendations(requirements: DataRequirement[], missing: DataNeeded): string[] {
    const isNepali = this.lang === 'ne';
    const recommendations: string[] = [];

    if (missing.divisionals.length > 0) {
      recommendations.push(
        isNepali 
          ? `विभाजन चार्ट प्राप्त करें: ${missing.divisionals.join(', ')}`
          : `Fetch divisional charts: ${missing.divisionals.join(', ')}`
      );
    }

    if (missing.shadbala) {
      recommendations.push(
        isNepali 
          ? 'षड्बल डेटा प्राप्त करें'
          : 'Fetch Shadbala data'
      );
    }

    if (missing.dashas) {
      recommendations.push(
        isNepali 
          ? 'दशा डेटा प्राप्त करें'
          : 'Fetch Dasha data'
      );
    }

    if (missing.yogas) {
      recommendations.push(
        isNepali 
          ? 'योग डेटा प्राप्त करें'
          : 'Fetch Yoga data'
      );
    }

    if (missing.doshas) {
      recommendations.push(
        isNepali 
          ? 'दोष डेटा प्राप्त करें'
          : 'Fetch Dosha data'
      );
    }

    return recommendations;
  }
}

// Export helper functions
export function detectDataNeeded(question: string, astroData: AstroData, lang: Lang): DataNeeded | null {
  const detector = new DataNeededDetector(astroData, lang);
  const result = detector.analyzeQuestion(question);
  
  return result.sufficient ? null : result.missing;
}

export function analyzeDataRequirements(question: string, astroData: AstroData, lang: Lang): DataAnalysisResult {
  const detector = new DataNeededDetector(astroData, lang);
  return detector.analyzeQuestion(question);
}

export function isDataSufficientForQuestion(question: string, astroData: AstroData, lang: Lang): boolean {
  const detector = new DataNeededDetector(astroData, lang);
  const result = detector.analyzeQuestion(question);
  return result.sufficient;
}
