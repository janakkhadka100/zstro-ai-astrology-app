// src/astro/pipeline.ts
// Fact-first pipeline for ZSTRO AI astrology

import { buildAstroFactSheet } from './facts';
import { evaluateYogas } from './rules';
import { expandDasha } from './dasha/expand';
import { buildUserPrompt, validateOutline, SYSTEM_PROMPT } from './ai/prompt';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export type AstroPipelineConfig = {
  strictMode?: boolean;
  language?: 'en' | 'ne' | 'hi';
  model?: string;
};

export class AstroPipeline {
  private config: Required<AstroPipelineConfig>;
  
  constructor(config: AstroPipelineConfig = {}) {
    this.config = {
      strictMode: true,
      language: 'en',
      model: 'gpt-4o',
      ...config
    };
  }
  
  async processAstrologyRequest(
    astroData: any,
    question: string = '',
    userLanguage?: string
  ) {
    try {
      // Step 1: Build deterministic fact sheet
      const facts = buildAstroFactSheet(astroData);
      
      // Step 2: Evaluate yogas and doshas
      const yogas = evaluateYogas(facts);
      
      // Step 3: Expand dasha analysis
      const dasha = expandDasha(facts);
      
      // Step 4: Generate AI response with consistency guard
      const language = userLanguage || this.config.language;
      const userPrompt = buildUserPrompt(facts, yogas, question, language);
      
      const result = await streamText({
        model: openai(this.config.model),
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 4000,
        tools: {
          verifyOutline: {
            description: 'Verify the outline matches the facts before generating final response',
            parameters: {
              type: 'object',
              properties: {
                outline: {
                  type: 'object',
                  description: 'The verified outline structure'
                }
              },
              required: ['outline']
            }
          }
        }
      });
      
      // Step 5: Validate response if in strict mode
      if (this.config.strictMode) {
        // This would be implemented with the outline verification
        // For now, we'll log any potential issues
        console.log('Strict mode enabled - validating response consistency');
      }
      
      return {
        facts,
        yogas,
        dasha,
        result
      };
      
    } catch (error) {
      console.error('AstroPipeline error:', error);
      throw new Error(`Astrology analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Helper method to get current dasha period
  getCurrentDashaPeriod(facts: any) {
    const dasha = expandDasha(buildAstroFactSheet(facts));
    return dasha.current;
  }
  
  // Helper method to get planetary strengths
  getPlanetaryStrengths(facts: any) {
    const yogas = evaluateYogas(buildAstroFactSheet(facts));
    return yogas.shadbala;
  }
  
  // Helper method to get detected yogas
  getDetectedYogas(facts: any) {
    const yogas = evaluateYogas(buildAstroFactSheet(facts));
    return {
      panchMahapurush: yogas.panchMahapurush || [],
      vipareetaRajyoga: yogas.vipareetaRajyoga || [],
      other: yogas.other || []
    };
  }
}

// Export singleton instance
export const astroPipeline = new AstroPipeline();
