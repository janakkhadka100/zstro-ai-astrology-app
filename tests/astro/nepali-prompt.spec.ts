// tests/astro/nepali-prompt.spec.ts
// Unit tests for Nepali prompt system

import { 
  getNepaliSystemPrompt, 
  buildNepaliUserPrompt,
  NEPALI_SYSTEM_PROMPT
} from '../../src/astro/ai/nepali-prompt';

describe('Nepali Prompt System', () => {
  test('should return Nepali system prompt', () => {
    const prompt = getNepaliSystemPrompt();
    expect(prompt).toBe(NEPALI_SYSTEM_PROMPT);
  });

  test('should include role definition in Nepali', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('ZSTRO AI ज्योतिष सहायक');
    expect(prompt).toContain('Prokerala API बाट प्राप्त कुण्डली विवरण');
  });

  test('should include yoga verification rules', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('गजकेसरी योग');
    expect(prompt).toContain('कालसर्प दोष');
    expect(prompt).toContain('मंगल दोष');
    expect(prompt).toContain('Prokerala को डाटाका आधारमा');
  });

  test('should include house calculation formula in Nepali', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('घर = ((ग्रह_राशि - लग्न_राशि + १२) % १२) + १');
    expect(prompt).toContain('वृष (२)');
    expect(prompt).toContain('वृश्चिक (८)');
  });

  test('should include analysis framework in Nepali', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('🪐 ग्रह स्थिति र घर विश्लेषण');
    expect(prompt).toContain('🔯 योग र दोषहरू');
    expect(prompt).toContain('🧘 दशा विश्लेषण');
    expect(prompt).toContain('📊 विभाजन चार्ट अन्तर्दृष्टि');
  });

  test('should include language and style requirements', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('नेपाली भाषामा');
    expect(prompt).toContain('सरल, स्पष्ट र आदरपूर्ण');
    expect(prompt).toContain('संस्कृत-अवधारणामा');
  });

  test('should include response structure requirements', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('प्रस्तावना');
    expect(prompt).toContain('मुख्य विवरण');
    expect(prompt).toContain('वर्गीकरण');
    expect(prompt).toContain('पैराग्राफ');
    expect(prompt).toContain('उपचार');
    expect(prompt).toContain('समापन');
  });

  test('should include prohibited actions in Nepali', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('❌ निषेधित कार्यहरू:');
    expect(prompt).toContain('मृत्यु भविष्यवाणी');
    expect(prompt).toContain('अनुमानित जानकारी');
    expect(prompt).toContain('सामान्यीकरण');
  });

  test('should include required practices in Nepali', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('✅ आवश्यक अभ्यासहरू:');
    expect(prompt).toContain('डाटा सत्यता');
    expect(prompt).toContain('व्यापक कवरेज');
    expect(prompt).toContain('व्यावसायिक प्रस्तुति');
  });

  test('should build user prompt with proper structure', () => {
    const mockAstroData = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: [
        { planet: 'Sun', sign: 'Leo', house: 5, degree: 15 }
      ]
    };

    const userPrompt = buildNepaliUserPrompt(mockAstroData, 'Test question');

    expect(userPrompt).toContain('Test question');
    expect(userPrompt).toContain('Prokerala API डाटाको आधारमा');
    expect(userPrompt).toContain('विश्लेषण आवश्यकताहरू');
    expect(userPrompt).toContain('महत्वपूर्ण निर्देशहरू');
  });

  test('should include analysis requirements in user prompt', () => {
    const mockAstroData = {
      ascendant: { sign: 'Aries' }, 
      planets: []
    };

    const userPrompt = buildNepaliUserPrompt(mockAstroData, 'Test question');

    expect(userPrompt).toContain('🪐 ग्रह स्थिति र घर विश्लेषण');
    expect(userPrompt).toContain('🔯 योग र दोषहरू');
    expect(userPrompt).toContain('🧘 दशा विश्लेषण');
    expect(userPrompt).toContain('📊 विभाजन चार्ट अन्तर्दृष्टि');
    expect(userPrompt).toContain('💼 जीवन क्षेत्र विश्लेषण');
    expect(userPrompt).toContain('💪 शद्बल शक्ति');
    expect(userPrompt).toContain('🔮 सारांश र उपचारहरू');
  });

  test('should include critical instructions in user prompt', () => {
    const mockAstroData = {
      ascendant: { sign: 'Aries' }, 
      planets: []
    };

    const userPrompt = buildNepaliUserPrompt(mockAstroData, 'Test question');

    expect(userPrompt).toContain('Prokerala API डाटा मात्र प्रयोग गर्नुहोस्');
    expect(userPrompt).toContain('विशिष्ट चार्ट स्थितिहरू र गणनाहरू सन्दर्भ गर्नुहोस्');
    expect(userPrompt).toContain('लग्न, नवमांश, र चन्द्र कुण्डलीबाट अन्तर्दृष्टिहरू');
    expect(userPrompt).toContain('कहिल्यै निश्चित मृत्यु मिति वा निश्चित मृत्यु उमेर भविष्यवाणी नगर्नुहोस्');
  });

  test('should include data structure in user prompt', () => {
    const mockAstroData = {
      ascendant: { sign: 'Aries', degree: 10, lord: 'Mars' },
      planets: [
        { planet: 'Sun', sign: 'Leo', house: 5, degree: 15, isRetro: false }
      ],
      dashas: {
        vimshottari: {
          current: { planet: 'Jupiter', start: '2023-01-01', end: '2039-01-01' }
        }
      },
      yogas: {
        panchMahapurush: [],
        vipareetaRajyoga: []
      }
    };

    const userPrompt = buildNepaliUserPrompt(mockAstroData, 'Test question');

    // Check that data is included in JSON format
    expect(userPrompt).toContain('"ascendant"');
    expect(userPrompt).toContain('"planets"');
    expect(userPrompt).toContain('"dashas"');
    expect(userPrompt).toContain('"yogas"');
  });

  test('should handle empty question gracefully', () => {
    const mockAstroData = {
      ascendant: { sign: 'Aries' }, 
      planets: []
    };

    const userPrompt = buildNepaliUserPrompt(mockAstroData, '');

    expect(userPrompt).toContain('सामान्य कुण्डली विश्लेषण');
  });

  test('should include proper Nepali terminology', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('राशि');
    expect(prompt).toContain('भाव');
    expect(prompt).toContain('ग्रह');
    expect(prompt).toContain('लग्न');
    expect(prompt).toContain('चन्द्रमा');
    expect(prompt).toContain('बृहस्पति');
    expect(prompt).toContain('राहु');
    expect(prompt).toContain('केतु');
  });

  test('should include verification requirements', () => {
    const prompt = getNepaliSystemPrompt();
    
    expect(prompt).toContain('क्रस-चेक गर्नुहोस्');
    expect(prompt).toContain('तथ्यमा नअ_found_ भएका योग/दोष');
    expect(prompt).toContain('विनम्रतरिकाले');
    expect(prompt).toContain('अन्तिम पटक');
  });
});
