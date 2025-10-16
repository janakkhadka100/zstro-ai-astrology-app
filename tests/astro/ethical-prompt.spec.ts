// tests/astro/ethical-prompt.spec.ts
// Unit tests for ethical prompt system

import { 
  getEthicalSystemPrompt, 
  buildEthicalUserPrompt,
  ETHICAL_SYSTEM_PROMPT_NEPALI,
  ETHICAL_SYSTEM_PROMPT_ENGLISH
} from '../../src/astro/ai/ethical-prompt';

describe('Ethical Prompt System', () => {
  test('should return Nepali prompt for ne language', () => {
    const prompt = getEthicalSystemPrompt('ne');
    expect(prompt).toBe(ETHICAL_SYSTEM_PROMPT_NEPALI);
    expect(prompt).toContain('प्रोकेरला API');
    expect(prompt).toContain('ज्योतिषीय डेटा');
  });

  test('should return English prompt for en language', () => {
    const prompt = getEthicalSystemPrompt('en');
    expect(prompt).toBe(ETHICAL_SYSTEM_PROMPT_ENGLISH);
    expect(prompt).toContain('Prokerala API');
    expect(prompt).toContain('astrological data');
  });

  test('should return English prompt for default/unknown language', () => {
    const prompt = getEthicalSystemPrompt('unknown');
    expect(prompt).toBe(ETHICAL_SYSTEM_PROMPT_ENGLISH);
  });

  test('should include ethical guidelines in both languages', () => {
    const nepaliPrompt = getEthicalSystemPrompt('ne');
    const englishPrompt = getEthicalSystemPrompt('en');

    // Check for death prediction prohibition
    expect(nepaliPrompt).toContain('मृत्युको निश्चित मिति');
    expect(englishPrompt).toContain('exact date or age of death');

    // Check for data grounding requirements
    expect(nepaliPrompt).toContain('प्रोकेरला API बाट प्राप्त');
    expect(englishPrompt).toContain('Prokerala API');

    // Check for comprehensive analysis requirements
    expect(nepaliPrompt).toContain('लग्न कुण्डली');
    expect(englishPrompt).toContain('Lagna Kundali');
  });

  test('should include house calculation instructions', () => {
    const nepaliPrompt = getEthicalSystemPrompt('ne');
    const englishPrompt = getEthicalSystemPrompt('en');

    // Check for house calculation formula
    expect(nepaliPrompt).toContain('घर = ((ग्रह_राशि - लग्न_राशि + १२) % १२) + १');
    expect(englishPrompt).toContain('House = ((Planet_Rashi - Lagna_Rashi + 12) % 12) + 1');

    // Check for zodiac sign mapping
    expect(nepaliPrompt).toContain('वृष (२)');
    expect(englishPrompt).toContain('Taurus (2)');
  });

  test('should include response format requirements', () => {
    const nepaliPrompt = getEthicalSystemPrompt('ne');
    const englishPrompt = getEthicalSystemPrompt('en');

    // Check for required sections
    expect(nepaliPrompt).toContain('🪐 ग्रह स्थिति');
    expect(englishPrompt).toContain('🪐 Planetary Positions');

    expect(nepaliPrompt).toContain('🔯 योग र दोष');
    expect(englishPrompt).toContain('🔯 Yogas and Doshas');

    expect(nepaliPrompt).toContain('🧘 दशा विश्लेषण');
    expect(englishPrompt).toContain('🧘 Dasha Analysis');
  });

  test('should build user prompt with proper structure', () => {
    const mockFacts = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: [
        { planet: 'Sun', sign: 'Leo', house: 5, degree: 15 }
      ]
    };

    const mockYogas = {
      panchMahapurush: [],
      vipareetaRajyoga: []
    };

    const userPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'en');

    expect(userPrompt).toContain('Test question');
    expect(userPrompt).toContain('Birth Chart Data (Prokerala API Source)');
    expect(userPrompt).toContain('Computed Yogas & Doshas (Fact-First Engine)');
    expect(userPrompt).toContain('Analysis Requirements');
    expect(userPrompt).toContain('Critical Instructions');
  });

  test('should include house calculation table in user prompt', () => {
    const mockFacts = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: [
        { planet: 'Sun', sign: 'Leo', house: 5, degree: 15 }
      ]
    };

    const mockYogas = {
      panchMahapurush: [],
      vipareetaRajyoga: []
    };

    const userPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'en');

    expect(userPrompt).toContain('| Planet | Sign | Degree | House from Lagna | House Name | Significance |');
    expect(userPrompt).toContain('| Sun    | Scorpio | 0.74° | 7th | 7th House (Kalatra) | Marriage, Partnerships |');
  });

  test('should include ethical restrictions in user prompt', () => {
    const mockFacts = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: []
    };

    const mockYogas = {
      panchMahapurush: [],
      vipareetaRajyoga: []
    };

    const userPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'en');

    expect(userPrompt).toContain('NEVER predict exact death dates or fixed death ages');
    expect(userPrompt).toContain('Use ONLY the provided Prokerala API data');
    expect(userPrompt).toContain('Shasha Yoga is ONLY by Saturn, never Moon');
  });

  test('should support different languages in user prompt', () => {
    const mockFacts = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: []
    };

    const mockYogas = {
      panchMahapurush: [],
      vipareetaRajyoga: []
    };

    const englishPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'en');
    const nepaliPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'ne');

    expect(englishPrompt).toContain('in English');
    expect(nepaliPrompt).toContain('नेपालीमा');
  });

  test('should include comprehensive analysis requirements', () => {
    const mockFacts = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: []
    };

    const mockYogas = {
      panchMahapurush: [],
      vipareetaRajyoga: []
    };

    const userPrompt = buildEthicalUserPrompt(mockFacts, mockYogas, 'Test question', 'en');

    expect(userPrompt).toContain('Lagna, Navamsha, and Chandra Kundali');
    expect(userPrompt).toContain('comprehensive analysis');
    expect(userPrompt).toContain('detailed, structured analysis');
  });
});
