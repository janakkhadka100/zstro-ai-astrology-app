// lib/services/prokerala-service.ts
// Enhanced Prokerala API service with caching, error handling, and Nepali support

import { 
  AstroData, 
  AstroDataRequest,
  D1PlanetRow,
  DivisionalBlock,
  ShadbalaRow,
  DashaItem,
  PlanetName,
  SignId
} from '@/lib/astrology/types';
import { 
  toPlanet, 
  signIdFrom, 
  wholeSignHouse, 
  getSignLabel, 
  isRetrograde,
  validateSignId,
  validateHouseNumber 
} from '@/lib/astrology/util';
import { enhancedCache } from './enhanced-cache';
import { logger } from './logger';

// Nepali translations for astrological terms
const NEPALI_TRANSLATIONS = {
  signs: {
    1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्क', 5: 'सिंह', 6: 'कन्या',
    7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन'
  },
  planets: {
    'Sun': 'सूर्य', 'Moon': 'चन्द्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
    'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु'
  },
  houses: {
    1: 'लग्न', 2: 'धन', 3: 'सहज', 4: 'सुख', 5: 'पुत्र', 6: 'रिपु',
    7: 'विवाह', 8: 'आयु', 9: 'भाग्य', 10: 'कर्म', 11: 'लाभ', 12: 'व्यय'
  },
  yogas: {
    'gajakesari': 'गजकेसरी योग',
    'budha_aditya': 'बुध-आदित्य योग',
    'raja_yoga': 'राज योग',
    'chandra_mangal': 'चन्द्र-मंगल योग',
    'guru_chandra': 'गुरु-चन्द्र योग'
  },
  doshas: {
    'mangal_dosha': 'मंगल दोष',
    'kaal_sarp': 'कालसर्प दोष',
    'pitra_dosha': 'पितृ दोष',
    'shani_dosha': 'शनि दोष'
  }
};

// Prokerala API configuration
interface ProkeralaConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Birth details interface
interface BirthDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM:SS
  latitude: number;
  longitude: number;
  timezone: string;
  place?: string;
}

// API response interfaces
interface ProkeralaResponse<T> {
  data: T;
  status: {
    code: number;
    message: string;
  };
}

interface BirthChartResponse {
  ascendant: {
    longitude: number;
    latitude: number;
    timezone: string;
  };
  birth_details: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    is_retrograde: boolean;
    house: number;
    rasi: {
      id: number;
      name: string;
    };
  }>;
  divisionals: Array<{
    type: string;
    planets: Array<{
      name: string;
      rasi: { id: number; name: string };
      house: number;
    }>;
  }>;
  yogas: Array<{
    key: string;
    name: string;
    factors: string[];
  }>;
  doshas: Array<{
    key: string;
    name: string;
    factors: string[];
  }>;
  shadbala: Array<{
    planet: string;
    total: number;
    components: {
      sthana: number;
      dig: number;
      kala: number;
      cheshta: number;
      naisargika: number;
      drik: number;
    };
  }>;
  dasha: {
    vimshottari: {
      current: {
        planet: string;
        start: string;
        end: string;
      };
      maha: Array<{
        planet: string;
        start: string;
        end: string;
      }>;
      antar: Array<{
        planet: string;
        start: string;
        end: string;
      }>;
    };
    yogini: {
      current: {
        planet: string;
        start: string;
        end: string;
      };
      timeline: Array<{
        planet: string;
        start: string;
        end: string;
      }>;
    };
  };
}

class ProkeralaService {
  private config: ProkeralaConfig;
  private cache: typeof enhancedCache;

  constructor() {
    this.config = {
      apiKey: process.env.PROKERALA_API_KEY || '',
      apiSecret: process.env.PROKERALA_API_SECRET || '',
      baseUrl: process.env.PROKERALA_BASE_URL || 'https://api.prokerala.com/v2/astrology',
      timeout: 30000,
      retries: 3
    };
    this.cache = enhancedCache;
    
    if (!this.config.apiKey) {
      logger.warn('PROKERALA_API_KEY not found, using mock data');
    }
  }

  // Generate cache key for birth details
  private getCacheKey(birthDetails: BirthDetails): string {
    return `kundali:${birthDetails.name}:${birthDetails.birthDate}:${birthDetails.birthTime}:${birthDetails.latitude}:${birthDetails.longitude}`;
  }

  // Make API call with retry logic
  private async makeApiCall<T>(
    endpoint: string, 
    params: Record<string, any>
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const queryParams = new URLSearchParams({
      ...params,
      api_key: this.config.apiKey
    });

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(`${url}?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Zstro-Astrology/1.0'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status?.code !== 200) {
          throw new Error(`API Error: ${data.status?.message || 'Unknown error'}`);
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`API call attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(`API call failed after ${this.config.retries} attempts: ${lastError?.message}`);
  }

  // Get birth chart data
  async getKundali(birthDetails: BirthDetails): Promise<AstroData> {
    // Mock data mode check
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log('Using mock data for development');
      return this.getMockKundali(birthDetails);
    }

    const cacheKey = this.getCacheKey(birthDetails);
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached kundali data');
      return cached;
    }

    try {
      // If no API key, return mock data
      if (!this.config.apiKey) {
        logger.info('Using mock data for development');
        return this.getMockKundali(birthDetails);
      }

      // Make API call
      const params = {
        datetime: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
        coordinates: `${birthDetails.latitude},${birthDetails.longitude}`,
        timezone: birthDetails.timezone,
        ayanamsa: 1, // Lahiri
        house_system: 1, // Placidus
        ...(birthDetails.place && { place: birthDetails.place })
      };

      const response = await this.makeApiCall<ProkeralaResponse<BirthChartResponse>>(
        '/birth-chart',
        params
      );

      const astroData = this.normalizeResponse(response.data, 'ne');
      
      // Cache the result for 24 hours
      await this.cache.set(cacheKey, astroData, 24 * 60 * 60);
      
      return astroData;
    } catch (error) {
      logger.error('Error fetching kundali:', error);
      
      // Return mock data as fallback
      logger.info('Falling back to mock data');
      return this.getMockKundali(birthDetails);
    }
  }

  // Normalize Prokerala API response to our format
  private normalizeResponse(data: BirthChartResponse, lang: 'ne' | 'en'): AstroData {
    const ascSignId = Math.floor(data.ascendant.longitude / 30) + 1 as SignId;
    
    return {
      ascSignId,
      ascSignLabel: this.getSignLabel(ascSignId, lang),
      d1: this.normalizeD1(ascSignId, data.planets, lang),
      divisionals: this.normalizeDivisionals(ascSignId, data.divisionals, lang),
      yogas: this.normalizeYogas(data.yogas, lang),
      doshas: this.normalizeDoshas(data.doshas, lang),
      shadbala: this.normalizeShadbala(data.shadbala),
      dashas: this.normalizeDashas(data.dasha),
      lang
    };
  }

  // Normalize D1 planets
  private normalizeD1(ascSignId: SignId, planets: any[], lang: 'ne' | 'en'): D1PlanetRow[] {
    return planets
      .filter(p => p.name && p.rasi)
      .map(planet => {
        const signId = planet.rasi.id as SignId;
        const planetName = toPlanet(planet);
        const retro = isRetrograde(planet);
        const house = planet.house || wholeSignHouse(ascSignId, signId);
        
        return {
          planet: planetName,
          signId: validateSignId(signId) ? signId : 1,
          signLabel: this.getSignLabel(validateSignId(signId) ? signId : 1, lang),
          house: validateHouseNumber(house) ? house : 1,
          retro
        } as D1PlanetRow;
      })
      .filter(r => r.planet && validateSignId(r.signId) && validateHouseNumber(r.house));
  }

  // Normalize divisional charts
  private normalizeDivisionals(ascSignId: SignId, divisionals: any[], lang: 'ne' | 'en'): DivisionalBlock[] {
    return divisionals
      .filter(d => d.type && d.planets)
      .map(divisional => ({
        type: divisional.type.toUpperCase(),
        planets: divisional.planets
          .filter((p: any) => p.name && p.rasi)
          .map((planet: any) => {
            const signId = planet.rasi.id as SignId;
            const house = planet.house || wholeSignHouse(ascSignId, signId);
            
            return {
              planet: toPlanet(planet),
              signId: validateSignId(signId) ? signId : 1,
              signLabel: this.getSignLabel(validateSignId(signId) ? signId : 1, lang),
              house: validateHouseNumber(house) ? house : 1
            };
          })
          .filter((r: any) => r.planet && validateSignId(r.signId) && validateHouseNumber(r.house))
      }))
      .filter(d => ['D2', 'D7', 'D9', 'D10'].includes(d.type));
  }

  // Normalize yogas
  private normalizeYogas(yogas: any[], lang: 'ne' | 'en'): Array<{key: string; label: string; factors: string[]}> {
    return yogas.map(yoga => ({
      key: yoga.key || yoga.id || 'unknown',
      label: lang === 'ne' 
        ? NEPALI_TRANSLATIONS.yogas[yoga.key as keyof typeof NEPALI_TRANSLATIONS.yogas] || yoga.name
        : yoga.name || 'Unknown Yoga',
      factors: yoga.factors || []
    }));
  }

  // Normalize doshas
  private normalizeDoshas(doshas: any[], lang: 'ne' | 'en'): Array<{key: string; label: string; factors: string[]}> {
    return doshas.map(dosha => ({
      key: dosha.key || dosha.id || 'unknown',
      label: lang === 'ne'
        ? NEPALI_TRANSLATIONS.doshas[dosha.key as keyof typeof NEPALI_TRANSLATIONS.doshas] || dosha.name
        : dosha.name || 'Unknown Dosha',
      factors: dosha.factors || []
    }));
  }

  // Normalize shadbala
  private normalizeShadbala(shadbala: any[]): ShadbalaRow[] {
    return shadbala
      .filter(s => s.planet && s.total !== undefined)
      .map(s => ({
        planet: toPlanet(s),
        value: Number(s.total),
        unit: 'rupa',
        components: [
          { name: 'Sthana Bala', value: Number(s.components?.sthana || 0) },
          { name: 'Dik Bala', value: Number(s.components?.dig || 0) },
          { name: 'Kala Bala', value: Number(s.components?.kala || 0) },
          { name: 'Cheshta Bala', value: Number(s.components?.cheshta || 0) },
          { name: 'Naisargika Bala', value: Number(s.components?.naisargika || 0) },
          { name: 'Drik Bala', value: Number(s.components?.drik || 0) }
        ]
      }))
      .filter(r => r.planet);
  }

  // Normalize dashas
  private normalizeDashas(dasha: any): DashaItem[] {
    const items: DashaItem[] = [];
    
    // Vimshottari Dasha
    if (dasha.vimshottari) {
      if (dasha.vimshottari.current) {
        items.push({
          system: 'Vimshottari',
          level: 'current',
          planet: toPlanet(dasha.vimshottari.current),
          from: new Date(dasha.vimshottari.current.start).toISOString(),
          to: new Date(dasha.vimshottari.current.end).toISOString()
        });
      }
      
      (dasha.vimshottari.maha || []).forEach((m: any) => {
        items.push({
          system: 'Vimshottari',
          level: 'maha',
          planet: toPlanet(m),
          from: new Date(m.start).toISOString(),
          to: new Date(m.end).toISOString()
        });
      });
      
      (dasha.vimshottari.antar || []).forEach((a: any) => {
        items.push({
          system: 'Vimshottari',
          level: 'antar',
          planet: toPlanet(a),
          from: new Date(a.start).toISOString(),
          to: new Date(a.end).toISOString()
        });
      });
    }
    
    // Yogini Dasha
    if (dasha.yogini) {
      if (dasha.yogini.current) {
        items.push({
          system: 'Yogini',
          level: 'current',
          planet: toPlanet(dasha.yogini.current),
          from: new Date(dasha.yogini.current.start).toISOString(),
          to: new Date(dasha.yogini.current.end).toISOString()
        });
      }
      
      (dasha.yogini.timeline || []).forEach((t: any) => {
        items.push({
          system: 'Yogini',
          level: 'maha',
          planet: toPlanet(t),
          from: new Date(t.start).toISOString(),
          to: new Date(t.end).toISOString()
        });
      });
    }
    
    return items;
  }

  // Get sign label with language support
  private getSignLabel(signId: SignId, lang: 'ne' | 'en'): string {
    if (lang === 'ne') {
      return NEPALI_TRANSLATIONS.signs[signId] || 'अज्ञात';
    }
    return getSignLabel(signId, 'en');
  }

  // Mock data for development
  private getMockKundali(birthDetails: BirthDetails): AstroData {
    const ascSignId = 1 as SignId; // Aries
    
    return {
      ascSignId,
      ascSignLabel: this.getSignLabel(ascSignId, 'ne'),
      d1: [
        { planet: 'Sun', signId: 5, signLabel: this.getSignLabel(5, 'ne'), house: 5, retro: false },
        { planet: 'Moon', signId: 4, signLabel: this.getSignLabel(4, 'ne'), house: 4, retro: false },
        { planet: 'Mars', signId: 1, signLabel: this.getSignLabel(1, 'ne'), house: 1, retro: false },
        { planet: 'Mercury', signId: 6, signLabel: this.getSignLabel(6, 'ne'), house: 6, retro: true },
        { planet: 'Jupiter', signId: 9, signLabel: this.getSignLabel(9, 'ne'), house: 9, retro: false },
        { planet: 'Venus', signId: 7, signLabel: this.getSignLabel(7, 'ne'), house: 7, retro: false },
        { planet: 'Saturn', signId: 10, signLabel: this.getSignLabel(10, 'ne'), house: 10, retro: false },
        { planet: 'Rahu', signId: 12, signLabel: this.getSignLabel(12, 'ne'), house: 12, retro: true },
        { planet: 'Ketu', signId: 6, signLabel: this.getSignLabel(6, 'ne'), house: 6, retro: true }
      ],
      divisionals: [
        {
          type: 'D9',
          planets: [
            { planet: 'Sun', signId: 1, signLabel: this.getSignLabel(1, 'ne'), house: 1 },
            { planet: 'Moon', signId: 2, signLabel: this.getSignLabel(2, 'ne'), house: 2 },
            { planet: 'Mars', signId: 3, signLabel: this.getSignLabel(3, 'ne'), house: 3 }
          ]
        }
      ],
      yogas: [
        { key: 'gajakesari', label: 'गजकेसरी योग', factors: ['Jupiter', 'Moon'] },
        { key: 'budha_aditya', label: 'बुध-आदित्य योग', factors: ['Mercury', 'Sun'] }
      ],
      doshas: [
        { key: 'mangal_dosha', label: 'मंगल दोष', factors: ['Mars'] }
      ],
      shadbala: [
        { planet: 'Sun', value: 1.2, unit: 'rupa', components: [] },
        { planet: 'Moon', value: 0.9, unit: 'rupa', components: [] }
      ],
      dashas: [
        {
          system: 'Vimshottari',
          level: 'current',
          planet: 'Jupiter',
          from: new Date().toISOString(),
          to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      lang: 'ne'
    };
  }
}

// Export singleton instance
export const prokeralaService = new ProkeralaService();
