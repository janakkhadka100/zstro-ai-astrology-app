// app/api/chat/route.ts
// Enhanced chat API that integrates Prokerala + Evidence cards

import { NextRequest, NextResponse } from 'next/server';
import { getAstroData } from '@/lib/prokerala/service';
import { buildCombinedPrompt } from '@/lib/llm/prompt-vision';
import { ChatWithEvidenceRequest, ChatWithEvidenceResponse, EvidenceBundle } from '@/lib/extract/types';

export const runtime = 'nodejs'; // Required for file processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatWithEvidenceRequest;
    const { question, lang, prokeralaData, evidenceBundle } = body;
    
    // Validate request
    if (!question || !lang) {
      return NextResponse.json(
        { success: false, errors: ['Question and language are required'] },
        { status: 400 }
      );
    }
    
    if (!['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }
    
    console.log(`Processing chat request with ${evidenceBundle ? evidenceBundle.cards.length : 0} evidence cards`);
    
    // Get Prokerala data if not provided
    let astroData = prokeralaData;
    if (!astroData) {
      astroData = await getAstroData({ lang });
    }
    
    // Build combined prompt
    const { system, user, combined } = buildCombinedPrompt(
      lang,
      astroData,
      evidenceBundle || { files: [], cards: [], lang, extractedAt: new Date().toISOString() },
      question
    );
    
    // For now, return the prompt structure (in production, this would call LLM)
    const analysis = `Based on the provided data, here's the analysis:\n\n${user}\n\n[LLM analysis would be generated here using the above prompt]`;
    
    const response: ChatWithEvidenceResponse = {
      success: true,
      analysis,
      cardsUsed: {
        prokerala: !!astroData,
        evidence: !!(evidenceBundle && evidenceBundle.cards.length > 0)
      },
      warnings: []
    };
    
    // Add warnings if no cards available
    if (!astroData && (!evidenceBundle || evidenceBundle.cards.length === 0)) {
      response.warnings?.push('No astrological data available for analysis');
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
