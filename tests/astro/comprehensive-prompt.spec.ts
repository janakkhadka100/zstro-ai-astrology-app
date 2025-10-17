// tests/astro/comprehensive-prompt.spec.ts
// Unit tests for comprehensive prompt system

import { 
  getComprehensiveSystemPrompt, 
  buildComprehensiveUserPrompt,
  COMPREHENSIVE_SYSTEM_PROMPT
} from '../../src/astro/ai/comprehensive-prompt';

describe('Comprehensive Prompt System', () => {
  test('should return comprehensive system prompt', () => {
    const prompt = getComprehensiveSystemPrompt();
    expect(prompt).toBe(COMPREHENSIVE_SYSTEM_PROMPT);
  });

  test('should include data-driven analysis requirements', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('Use **all of this data** to answer the user\'s question');
    expect(prompt).toContain('Base your analysis strictly on the data given');
    expect(prompt).toContain('do not introduce information that is not supported by the charts');
  });

  test('should include birth time sensitivity warnings', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('even small differences in birth time can change the ascendant');
    expect(prompt).toContain('do not assume any chart factor is fixed unless it\'s confirmed by the provided data');
  });

  test('should include comprehensive chart integration', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('Lagna Kundali');
    expect(prompt).toContain('Navamsa (D9) Chart');
    expect(prompt).toContain('Chandra Kundali (Moon Chart)');
  });

  test('should include ethical boundaries', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('do NOT predict or state any exact date of death');
    expect(prompt).toContain('never give a specific death date or guarantee of death timing');
  });

  test('should include house calculation formula', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('House = ((Planet_Rashi - Lagna_Rashi + 12) % 12) + 1');
    expect(prompt).toContain('Aries=1, Taurus=2, Gemini=3');
  });

  test('should include response format requirements', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('🪐 Planetary Positions and House Analysis');
    expect(prompt).toContain('🔯 Yogas and Doshas');
    expect(prompt).toContain('🧘 Dasha Analysis');
    expect(prompt).toContain('📊 Divisional Chart Insights');
  });

  test('should include prohibited actions', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('❌ Prohibited Actions:');
    expect(prompt).toContain('Never predict exact death dates or ages');
    expect(prompt).toContain('Never guess planetary positions not in the data');
    expect(prompt).toContain('Never assume same lagna for different birth times');
  });

  test('should include required practices', () => {
    const prompt = getComprehensiveSystemPrompt();
    
    expect(prompt).toContain('✅ Required Practices:');
    expect(prompt).toContain('Present only verified facts from Prokerala API data');
    expect(prompt).toContain('Include all relevant chart information');
    expect(prompt).toContain('Use clear, accessible language');
  });

  test('should build user prompt with proper structure', () => {
    const mockAstroData = {
      lagnaChart: {
        ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
        planets: [
          { planet: 'Sun', sign: 'Leo', house: 5, degree: 15 }
        ]
      },
      navamshaChart: {
        ascendant: { sign: 'Leo', degree: 5 },
        planets: [
          { planet: 'Sun', sign: 'Aries', house: 1, degree: 10 }
        ]
      },
      chandraChart: {
        ascendant: { sign: 'Cancer', degree: 20 },
        planets: [
          { planet: 'Moon', sign: 'Cancer', house: 1, degree: 20 }
        ]
      },
      dashas: {
        vimshottari: {
          current: { planet: 'Jupiter', start: '2023-01-01', end: '2039-01-01' }
        }
      },
      yogas: {
        panchMahapurush: [],
        vipareetaRajyoga: []
      },
      doshas: [],
      shadbala: { Sun: 1.2, Moon: 0.95 },
      transits: {}
    };

    const userPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'en');

    expect(userPrompt).toContain('Test question');
    expect(userPrompt).toContain('Lagna Kundali (Birth Chart):');
    expect(userPrompt).toContain('Navamsa Chart (D9):');
    expect(userPrompt).toContain('Chandra Kundali (Moon Chart):');
    expect(userPrompt).toContain('Additional Astrological Data:');
  });

  test('should include analysis requirements in user prompt', () => {
    const mockAstroData = {
      lagnaChart: { ascendant: { sign: 'Aries' }, planets: [] },
      navamshaChart: {},
      chandraChart: {},
      dashas: {},
      yogas: {},
      doshas: [],
      shadbala: {},
      transits: {}
    };

    const userPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'en');

    expect(userPrompt).toContain('🪐 Planetary Positions and House Analysis');
    expect(userPrompt).toContain('🔯 Yogas and Doshas');
    expect(userPrompt).toContain('🧘 Dasha Analysis');
    expect(userPrompt).toContain('📊 Divisional Chart Insights');
    expect(userPrompt).toContain('💼 Life Area Analysis');
    expect(userPrompt).toContain('💪 Shadbala Strength');
    expect(userPrompt).toContain('🔮 Summary and Remedies');
  });

  test('should include critical instructions in user prompt', () => {
    const mockAstroData = {
      lagnaChart: { ascendant: { sign: 'Aries' }, planets: [] },
      navamshaChart: {},
      chandraChart: {},
      dashas: {},
      yogas: {},
      doshas: [],
      shadbala: {},
      transits: {}
    };

    const userPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'en');

    expect(userPrompt).toContain('Use ONLY the provided Prokerala API data');
    expect(userPrompt).toContain('Reference specific chart positions and calculations');
    expect(userPrompt).toContain('Include insights from Lagna, Navamsha, and Chandra charts');
    expect(userPrompt).toContain('NEVER predict exact death dates or fixed death ages');
    expect(userPrompt).toContain('Always calculate house positions using the formula provided');
  });

  test('should support different languages in user prompt', () => {
    const mockAstroData = {
      lagnaChart: { ascendant: { sign: 'Aries' }, planets: [] },
      navamshaChart: {},
      chandraChart: {},
      dashas: {},
      yogas: {},
      doshas: [],
      shadbala: {},
      transits: {}
    };

    const englishPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'en');
    const nepaliPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'ne');

    expect(englishPrompt).toContain('in English');
    expect(nepaliPrompt).toContain('नेपालीमा');
  });

  test('should include comprehensive data structure in user prompt', () => {
    const mockAstroData = {
      lagnaChart: {
        ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
        planets: [
          { planet: 'Sun', sign: 'Leo', house: 5, degree: 15, isRetro: false }
        ]
      },
      navamshaChart: {
        ascendant: { sign: 'Leo', degree: 5 },
        planets: [
          { planet: 'Sun', sign: 'Aries', house: 1, degree: 10 }
        ]
      },
      chandraChart: {
        ascendant: { sign: 'Cancer', degree: 20 },
        planets: [
          { planet: 'Moon', sign: 'Cancer', house: 1, degree: 20 }
        ]
      },
      dashas: {
        vimshottari: {
          current: { planet: 'Jupiter', start: '2023-01-01', end: '2039-01-01' }
        },
        yogini: []
      },
      yogas: {
        panchMahapurush: [],
        vipareetaRajyoga: []
      },
      doshas: [],
      shadbala: { Sun: 1.2, Moon: 0.95, Mars: 1.1 },
      transits: {}
    };

    const userPrompt = buildComprehensiveUserPrompt(mockAstroData, 'Test question', 'en');

    // Check that all data sections are included
    expect(userPrompt).toContain('"ascendant"');
    expect(userPrompt).toContain('"planets"');
    expect(userPrompt).toContain('"dashas"');
    expect(userPrompt).toContain('"yogas"');
    expect(userPrompt).toContain('"doshas"');
    expect(userPrompt).toContain('"shadbala"');
    expect(userPrompt).toContain('"transits"');
  });
});
