// src/astro/config.ts
// Configuration for the fact-first astrology pipeline

export const ASTRO_CONFIG = {
  // System prompt configuration
  systemPrompt: {
    version: '2.0.0',
    source: 'Prokerala API',
    engine: 'Fact-First Engine',
    strictMode: true,
    citationRequired: true,
    hallucinationPrevention: true
  },
  
  // Rule engine configuration
  rules: {
    panchMahapurush: {
      enabled: true,
      strictValidation: true,
      shashaSaturnOnly: true
    },
    vipareetaRajyoga: {
      enabled: true,
      dusthanaHouses: [6, 8, 12],
      strictValidation: true
    },
    shadbala: {
      enabled: true,
      thresholds: {
        strong: 1.2,
        medium: 0.9,
        weak: 0.0
      }
    }
  },
  
  // Dasha configuration
  dasha: {
    vimshottari: {
      enabled: true,
      includeSookshma: true,
      houseEffects: true,
      lordshipEffects: true
    },
    yogini: {
      enabled: true,
      parallelAnalysis: true
    }
  },
  
  // Validation configuration
  validation: {
    strictMode: true,
    outlineValidation: true,
    factConsistency: true,
    houseValidation: true,
    planetValidation: true
  },
  
  // Output configuration
  output: {
    format: 'markdown',
    sections: [
      '🪐 Graha Positions and House Lords',
      '🔯 Yogas and Doshas', 
      '🧘 Dasha Timeline and Effects',
      '📊 Divisional Chart Insights',
      '💼 Career, 💕 Marriage, 🧠 Personality, 💸 Finance',
      '💪 Shadbala Strength Analysis',
      '🔮 Summary and Remedies'
    ],
    citations: true,
    emojis: true,
    culturalContext: true
  },
  
  // Language support
  languages: {
    supported: ['en', 'ne', 'hi'],
    default: 'en',
    culturalAdaptation: true
  },
  
  // Safety configuration
  safety: {
    noDeathPredictions: true,
    noFixedDates: true,
    ethicalGuidelines: true,
    dataGroundedOnly: true
  }
};

export const getSystemPromptConfig = () => ASTRO_CONFIG.systemPrompt;
export const getRuleEngineConfig = () => ASTRO_CONFIG.rules;
export const getValidationConfig = () => ASTRO_CONFIG.validation;
export const getOutputConfig = () => ASTRO_CONFIG.output;
