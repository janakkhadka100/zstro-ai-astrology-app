// lib/qa/ai-enhanced.spec.ts
// Tests for enhanced AI prompting and DataNeeded detection

import { describe, it, expect, beforeEach } from 'vitest';
import { buildEnhancedPrompts } from '@/lib/ai/prompts-enhanced';
import { analyzeDataRequirements, detectDataNeeded, isDataSufficientForQuestion } from '@/lib/ai/data-needed-detector';
import { AstroData } from '@/lib/astrology/types';

describe('Enhanced AI Prompting', () => {
  let mockAstroData: AstroData;

  beforeEach(() => {
    mockAstroData = {
      d1: [
        { planet: 'Sun', signId: 1, signLabel: 'Aries', house: 1, retro: false },
        { planet: 'Moon', signId: 2, signLabel: 'Taurus', house: 2, retro: false },
        { planet: 'Mars', signId: 3, signLabel: 'Gemini', house: 3, retro: false },
        { planet: 'Mercury', signId: 4, signLabel: 'Cancer', house: 4, retro: false },
        { planet: 'Jupiter', signId: 5, signLabel: 'Leo', house: 5, retro: false },
        { planet: 'Venus', signId: 6, signLabel: 'Virgo', house: 6, retro: false },
        { planet: 'Saturn', signId: 7, signLabel: 'Libra', house: 7, retro: false },
        { planet: 'Rahu', signId: 8, signLabel: 'Scorpio', house: 8, retro: false },
        { planet: 'Ketu', signId: 9, signLabel: 'Sagittarius', house: 9, retro: false }
      ],
      divisionals: [
        { chart: 'D10', planets: [] } // Missing D9 for navamsa questions
      ],
      yogas: [
        { label: 'Gajakesari Yoga', factors: ['Jupiter', 'Moon'], type: 'benefic' },
        { label: 'Kemadruma Yoga', factors: ['Moon'], type: 'malefic' }
      ],
      doshas: [
        { label: 'Mangal Dosha', factors: ['Mars'], type: 'malefic' }
      ],
      shadbala: [], // Missing shadbala data
      dashas: [], // Missing dasha data
      transits: [],
      aspects: [],
      houses: [],
      nakshatras: [],
      profile: {
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthPlace: {
          name: 'Kathmandu',
          latitude: 27.7172,
          longitude: 85.3240,
          timezone: { id: 'Asia/Kathmandu', offset: 5.75 }
        },
        timezone: { id: 'Asia/Kathmandu', offset: 5.75 }
      },
      provenance: {
        account: true,
        prokerala: ['d1', 'divisionals', 'yogas', 'doshas']
      }
    };
  });

  describe('DataNeeded Detection', () => {
    it('should detect missing divisional chart requirements', () => {
      const question = 'नवांशमा शुक्र कहाँ छ?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeDefined();
      expect(dataNeeded?.divisionals).toContain('D9');
    });

    it('should detect missing shadbala requirements', () => {
      const question = 'ग्रहहरूको बल कति छ?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeDefined();
      expect(dataNeeded?.shadbala).toBe(true);
    });

    it('should detect missing dasha requirements', () => {
      const question = 'हालको दशा कुन हो?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeDefined();
      expect(dataNeeded?.dashas).toBe(true);
    });

    it('should return null when data is sufficient', () => {
      const question = 'मेरो जन्मकुंडलीमा कुन योग छ?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeNull();
    });

    it('should work with English questions', () => {
      const question = 'What is my navamsa chart?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'en');
      
      expect(dataNeeded).toBeDefined();
      expect(dataNeeded?.divisionals).toContain('D9');
    });
  });

  describe('Data Sufficiency Check', () => {
    it('should return true when data is sufficient', () => {
      const question = 'मेरो जन्मकुंडलीमा कुन योग छ?';
      const sufficient = isDataSufficientForQuestion(question, mockAstroData, 'ne');
      
      expect(sufficient).toBe(true);
    });

    it('should return false when data is insufficient', () => {
      const question = 'नवांशमा शुक्र कहाँ छ?';
      const sufficient = isDataSufficientForQuestion(question, mockAstroData, 'ne');
      
      expect(sufficient).toBe(false);
    });
  });

  describe('Enhanced Prompt Building', () => {
    it('should build system prompt with data instructions', () => {
      const context = {
        astroData: mockAstroData,
        question: 'मेरो जन्मकुंडलीमा कुन योग छ?',
        lang: 'ne' as const
      };

      const result = buildEnhancedPrompts(context);
      
      expect(result.systemPrompt).toContain('ज्योतिषी');
      expect(result.systemPrompt).toContain('कार्ड डेटा');
      expect(result.systemPrompt).toContain('D1 ग्रह स्थिति');
      expect(result.systemPrompt).toContain('योग');
      expect(result.systemPrompt).toContain('दोष');
    });

    it('should build user prompt with question analysis', () => {
      const context = {
        astroData: mockAstroData,
        question: 'मेरो जन्मकुंडलीमा कुन योग छ?',
        lang: 'ne' as const
      };

      const result = buildEnhancedPrompts(context);
      
      expect(result.userPrompt).toContain('प्रश्न विश्लेषण');
      expect(result.userPrompt).toContain('ज्योतिषीय संदर्भ');
      expect(result.userPrompt).toContain('मेरो जन्मकुंडलीमा कुन योग छ?');
    });

    it('should include evidence cards when provided', () => {
      const context = {
        astroData: mockAstroData,
        question: 'मेरो चिनको विश्लेषण गर्नुहोस्',
        lang: 'ne' as const,
        evidenceCards: [
          { type: 'chin', observations: { jawAngle: 45, chinShape: 'pointed' } }
        ]
      };

      const result = buildEnhancedPrompts(context);
      
      expect(result.systemPrompt).toContain('प्रमाण कार्ड');
      expect(result.systemPrompt).toContain('चिन');
    });

    it('should include session history when provided', () => {
      const context = {
        astroData: mockAstroData,
        question: 'मेरो जन्मकुंडलीमा कुन योग छ?',
        lang: 'ne' as const,
        sessionHistory: ['पहिलेको प्रश्न', 'पहिलेको उत्तर']
      };

      const result = buildEnhancedPrompts(context);
      
      expect(result.systemPrompt).toContain('सत्र इतिहास');
      expect(result.systemPrompt).toContain('पिछले प्रश्न');
    });
  });

  describe('Data Analysis', () => {
    it('should analyze data requirements comprehensively', () => {
      const question = 'नवांशमा शुक्र कहाँ छ र मेरो दशा कुन हो?';
      const analysis = analyzeDataRequirements(question, mockAstroData, 'ne');
      
      expect(analysis.sufficient).toBe(false);
      expect(analysis.missing.divisionals).toContain('D9');
      expect(analysis.missing.dashas).toBe(true);
      expect(analysis.confidence).toBeLessThan(1.0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for missing data', () => {
      const question = 'नवांशमा शुक्र कहाँ छ?';
      const analysis = analyzeDataRequirements(question, mockAstroData, 'ne');
      
      expect(analysis.recommendations.some(rec => rec.includes('विभाजन चार्ट प्राप्त करें: D9'))).toBe(true);
    });

    it('should calculate confidence correctly', () => {
      const question = 'मेरो जन्मकुंडलीमा कुन योग छ?';
      const analysis = analyzeDataRequirements(question, mockAstroData, 'ne');
      
      expect(analysis.confidence).toBe(1.0);
      expect(analysis.sufficient).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty questions', () => {
      const question = '';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeNull();
    });

    it('should handle questions with no astrological content', () => {
      const question = 'हाउ अर यू?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeNull();
    });

    it('should handle mixed language questions', () => {
      const question = 'मेरो नवांश chart कस्तो छ?';
      const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
      
      expect(dataNeeded).toBeDefined();
      expect(dataNeeded?.divisionals).toBeDefined();
      expect(dataNeeded?.divisionals?.length).toBeGreaterThan(0);
    });

    it('should handle questions with multiple requirements', () => {
      const question = 'नवांशमा शुक्र कहाँ छ, मेरो दशा कुन हो, र ग्रहहरूको बल कति छ?';
      const analysis = analyzeDataRequirements(question, mockAstroData, 'ne');
      
      expect(analysis.sufficient).toBe(false);
      expect(analysis.missing.divisionals).toContain('D9');
      expect(analysis.missing.dashas).toBe(true);
      expect(analysis.missing.shadbala).toBe(true);
    });
  });
});
