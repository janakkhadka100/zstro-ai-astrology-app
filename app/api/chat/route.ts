// app/api/chat/route.ts
// Cards-first chat API with missing data detection

import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '@/lib/astrology/types';
import { buildCombinedPrompt, extractDataNeededFromResponse, isDataNeededResponse } from '@/lib/llm/prompt-core';
import { detectMissingData, createFetchPlansFromKeys, getDataNeededMessage, getDataUpdatedMessage } from '@/lib/llm/missing-detector';
import { fetchScopedData } from '@/lib/source/prokerala';
import { mergeAstroData } from '@/lib/cards/compose';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const { q: question, lang, cards, fetchMissing = true } = body;
    
    // Validate request
    if (!question || !lang || !cards) {
      return NextResponse.json(
        { success: false, errors: ['Question, language, and cards are required'] },
        { status: 400 }
      );
    }
    
    if (!['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }
    
    console.log(`Processing chat request: "${question}" in ${lang}`);
    
    // Build prompt from cards
    const { system, user, combined } = buildCombinedPrompt(lang, cards, question);
    
    // Simulate LLM response (in production, this would call actual LLM)
    let analysis = `Based on the provided cards, here's the analysis:\n\n${user}\n\n[LLM analysis would be generated here using the above prompt]`;
    
    // Check if data is needed
    let dataNeeded: string[] = [];
    let cardsUpdated = false;
    let updatedCards = cards;
    
    if (fetchMissing) {
      // Detect missing data from question
      const missingPlans = detectMissingData(question, cards);
      
      if (missingPlans.length > 0) {
        console.log(`Missing data detected, fetching: ${missingPlans.map(p => p.kind).join(', ')}`);
        
        try {
          // Fetch missing data
          const patch = await fetchScopedData(cards.profile || {}, missingPlans, lang);
          
          // Merge with existing cards
          updatedCards = mergeAstroData(cards, patch);
          cardsUpdated = true;
          
          // Re-build prompt with updated cards
          const { user: updatedUser } = buildCombinedPrompt(lang, updatedCards, question);
          analysis = `Based on the updated cards, here's the analysis:\n\n${updatedUser}\n\n[LLM analysis would be generated here using the updated prompt]`;
          
          console.log(`Data fetch completed. Updated cards with: ${patch.provenance?.prokerala.join(', ')}`);
        } catch (error) {
          console.error('Error fetching missing data:', error);
          analysis += `\n\nNote: Some additional data could not be fetched. Analysis based on available cards only.`;
        }
      }
    }
    
    // Check if LLM response indicates more data needed
    if (isDataNeededResponse(analysis)) {
      dataNeeded = extractDataNeededFromResponse(analysis);
      console.log(`LLM requested additional data: ${dataNeeded.join(', ')}`);
    }
    
    const response: ChatResponse = {
      success: true,
      analysis,
      dataNeeded: dataNeeded.length > 0 ? dataNeeded : undefined,
      cardsUpdated,
      warnings: []
    };
    
    // Add warnings if no basic data available
    if (cards.d1.length === 0) {
      response.warnings?.push('No D1 planets available for analysis');
    }
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'],
        analysis: 'Analysis failed due to server error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
