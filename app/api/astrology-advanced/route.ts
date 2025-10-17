// app/api/astrology-advanced/route.ts
// Advanced Vedic astrology analysis API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { advancedPokhrelService } from '@/lib/prokerala/advanced-service';
import { 
  ADVANCED_SYSTEM_PROMPT, 
  ADVANCED_USER_PROMPT,
  YOGA_ANALYSIS_PROMPT,
  DASHA_ANALYSIS_PROMPT,
  SHADBALA_ANALYSIS_PROMPT,
  DIVISIONAL_CHART_PROMPT,
  FINAL_SYNTHESIS_PROMPT
} from '@/lib/prompts/advanced-astrology';
import { SYSTEM_PROMPT, buildUserPrompt, getSystemPrompt, buildUserPromptAdvanced } from '@/src/astro/ai/prompt';
import { getEthicalSystemPrompt } from '@/src/astro/ai/ethical-prompt';
import { logger } from '@/lib/services/logger';
import { enhancedCache } from '@/lib/services/enhanced-cache';
import { astrologyValidationService } from '@/lib/services/astro/validate';

const advancedAstrologyRequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid birth date format'),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid birth time format'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  question: z.string().optional(),
  language: z.enum(['en', 'ne', 'hi']).default('en'),
  analysisType: z.enum(['basic', 'advanced', 'comprehensive']).default('comprehensive')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = advancedAstrologyRequestSchema.parse(body);
    
    logger.info('Processing advanced astrology request', {
      birthDate: validatedData.birthDate,
      birthPlace: validatedData.birthPlace,
      language: validatedData.language,
      analysisType: validatedData.analysisType
    });

    // Validate birth data
    const validationResult = astrologyValidationService.validateBirthData(
      validatedData.birthDate,
      validatedData.birthTime,
      validatedData.birthPlace
    );

    if (!validationResult.valid) {
      logger.warn('Invalid birth data provided', { errors: validationResult.errors });
      return NextResponse.json(
        { error: 'Invalid birth data', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `astro:advanced:${validatedData.birthDate}-${validatedData.birthTime}-${validatedData.birthPlace}`;
    
    let advancedData = await enhancedCache.get(cacheKey);
    
    if (!advancedData) {
      // Fetch basic data from Pokhrel API (simplified for demo)
      const basicData = await fetchBasicAstrologyData(validatedData);
      
      // Transform to advanced data structure
      advancedData = advancedPokhrelService.transformToAdvancedData(basicData);
      
      // Cache the advanced data
      await enhancedCache.set(cacheKey, advancedData, { ttl: 3600 });
    }

    // Validate the advanced chart data
    const chartValidation = astrologyValidationService.validateChart(
      advancedData.planets,
      [],
      [],
      advancedData.ascendant.sign,
      advancedData.divisionalCharts
    );

    if (!chartValidation.valid) {
      logger.warn('Chart validation failed', { issues: chartValidation.issues });
    }

    // Use fact-first pipeline for enhanced accuracy
    const { buildAstroFactSheet } = await import('@/src/astro/facts');
    const { evaluateYogas } = await import('@/src/astro/rules');
    
    // Build deterministic fact sheet
    const facts = buildAstroFactSheet(advancedData);
    const yogas = evaluateYogas(facts);
    
    // Build comprehensive prompt using advanced system
    const systemPrompt = getSystemPrompt(validatedData.analysisType, validatedData.language);
    const userPrompt = buildUserPromptAdvanced(advancedData, validatedData.question, validatedData.language, validatedData.analysisType);

    // Generate AI response
    const result = await streamText({
      model: openai(process.env.OPENAI_API_KEY ? 'gpt-4o' : 'gpt-3.5-turbo'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    logger.info('Advanced astrology analysis completed successfully', {
      analysisType: validatedData.analysisType,
      language: validatedData.language
    });

    return result.toDataStreamResponse();

  } catch (error) {
    logger.error('Advanced astrology request failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        detail: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : 'An error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}

// Build comprehensive prompt with all analysis sections
function buildComprehensivePrompt(advancedData: any, requestData: any): string {
  const basePrompt = ADVANCED_USER_PROMPT(advancedData, requestData.question || '', requestData.language);
  
  const additionalPrompts = [
    YOGA_ANALYSIS_PROMPT(advancedData.yogas, advancedData.doshas),
    DASHA_ANALYSIS_PROMPT(advancedData.dashas),
    SHADBALA_ANALYSIS_PROMPT(advancedData.shadbala),
    DIVISIONAL_CHART_PROMPT(advancedData.divisionalCharts),
    FINAL_SYNTHESIS_PROMPT(advancedData.analysis)
  ];
  
  return `${basePrompt}\n\n${additionalPrompts.join('\n\n')}`;
}

// Simplified function to fetch basic astrology data
async function fetchBasicAstrologyData(requestData: any): Promise<any> {
  // This is a simplified version - in production, you would call the actual Pokhrel API
  // For now, return mock data that matches the expected structure
  
  const mockData = {
    ascendant: {
      sign: 'Aries',
      degree: 15.5,
      lord: 'Mars',
      nakshatra: 'Bharani',
      nakshatraLord: 'Venus'
    },
    planets: [
      {
        planet: 'Sun',
        sign: 'Aries',
        house: 1,
        lord: 'Mars',
        isRetro: false,
        dignity: 'Own',
        degree: 20.3,
        nakshatra: 'Bharani',
        nakshatraLord: 'Venus',
        shadbala: 1.2,
        aspects: ['Moon', 'Jupiter'],
        conjunctions: []
      },
      {
        planet: 'Moon',
        sign: 'Cancer',
        house: 4,
        lord: 'Moon',
        isRetro: false,
        dignity: 'Own',
        degree: 8.7,
        nakshatra: 'Pushya',
        nakshatraLord: 'Saturn',
        shadbala: 1.1,
        aspects: ['Sun'],
        conjunctions: []
      },
      {
        planet: 'Mars',
        sign: 'Aries',
        house: 1,
        lord: 'Mars',
        isRetro: false,
        dignity: 'Own',
        degree: 12.1,
        nakshatra: 'Bharani',
        nakshatraLord: 'Venus',
        shadbala: 1.3,
        aspects: ['Moon', 'Jupiter'],
        conjunctions: ['Sun']
      },
      {
        planet: 'Mercury',
        sign: 'Taurus',
        house: 2,
        lord: 'Venus',
        isRetro: false,
        dignity: 'Neutral',
        degree: 25.8,
        nakshatra: 'Rohini',
        nakshatraLord: 'Moon',
        shadbala: 0.9,
        aspects: [],
        conjunctions: []
      },
      {
        planet: 'Jupiter',
        sign: 'Sagittarius',
        house: 9,
        lord: 'Jupiter',
        isRetro: false,
        dignity: 'Own',
        degree: 18.2,
        nakshatra: 'Purva Ashadha',
        nakshatraLord: 'Venus',
        shadbala: 1.4,
        aspects: ['Sun', 'Mars'],
        conjunctions: []
      },
      {
        planet: 'Venus',
        sign: 'Pisces',
        house: 12,
        lord: 'Jupiter',
        isRetro: false,
        dignity: 'Exalted',
        degree: 22.6,
        nakshatra: 'Uttara Bhadrapada',
        nakshatraLord: 'Saturn',
        shadbala: 1.5,
        aspects: [],
        conjunctions: []
      },
      {
        planet: 'Saturn',
        sign: 'Capricorn',
        house: 10,
        lord: 'Saturn',
        isRetro: false,
        dignity: 'Own',
        degree: 14.9,
        nakshatra: 'Uttara Ashadha',
        nakshatraLord: 'Sun',
        shadbala: 1.1,
        aspects: [],
        conjunctions: []
      },
      {
        planet: 'Rahu',
        sign: 'Gemini',
        house: 3,
        lord: 'Mercury',
        isRetro: true,
        dignity: 'Neutral',
        degree: 6.4,
        nakshatra: 'Ardra',
        nakshatraLord: 'Rahu',
        shadbala: 0.6,
        aspects: [],
        conjunctions: []
      },
      {
        planet: 'Ketu',
        sign: 'Sagittarius',
        house: 9,
        lord: 'Jupiter',
        isRetro: true,
        dignity: 'Neutral',
        degree: 6.4,
        nakshatra: 'Mula',
        nakshatraLord: 'Ketu',
        shadbala: 0.6,
        aspects: [],
        conjunctions: ['Jupiter']
      }
    ],
    birthData: {
      date: requestData.birthDate,
      time: requestData.birthTime,
      place: requestData.birthPlace,
      latitude: 27.7172,
      longitude: 85.3240,
      timezone: 'Asia/Kathmandu'
    }
  };
  
  return mockData;
}
