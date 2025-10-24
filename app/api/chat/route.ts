// app/api/chat/route.ts
// ZSTRO AI Chat API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openaiClient';
import { getAstrologyPrompt } from '@/lib/ai/prompts';

// Get user's astrological context for personalized chat responses
async function getUserAstroContext(userId: string, lang: string): Promise<string> {
  try {
    // Fetch user profile
    const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/profile`, {
      cache: 'no-store'
    });
    
    if (!profileResponse.ok) {
      return "ज्योतिषीय विवरण उपलब्ध छैन।";
    }
    
    const profile = await profileResponse.json();
    
    // Fetch astrological data
    const astroResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/prokerala`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        birth: profile.birth, 
        locale: lang 
      }),
      cache: 'no-store'
    });
    
    if (!astroResponse.ok) {
      return "ज्योतिषीय डाटा उपलब्ध छैन।";
    }
    
    const astroData = await astroResponse.json();
    
    // Create personalized context
    return `
व्यक्तिगत ज्योतिषीय विवरण:
- नाम: ${profile.name}
- जन्म मिति: ${profile.birth.date}
- जन्म समय: ${profile.birth.time}
- जन्म स्थान: ${profile.birth.location.place}
- लग्न: ${astroData.ascendant?.name || 'अज्ञात'}
- चन्द्र राशि: ${astroData.moon?.sign || 'अज्ञात'} (${astroData.moon?.house || '?'}औं भाव)
- वर्तमान दशा: ${astroData.currentDasha?.maha || 'अज्ञात'} (${astroData.currentDasha?.antara || ''} ${astroData.currentDasha?.pratyantara || ''})
- ग्रहहरूको स्थिति: ${astroData.planets?.map((p: any) => `${p.planet}: ${p.sign} (${p.house}औं भाव)`).join(', ') || 'अज्ञात'}
- गोचरका मुख्य बुँदा: ${astroData.transitHighlights?.join(', ') || 'अज्ञात'}
    `.trim();
    
  } catch (error) {
    console.error('Error fetching astro context:', error);
    return "ज्योतिषीय विवरण लोड गर्न सकिएन।";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, chatHistory = [], lang = 'ne' } = body;

    if (!message || !userId) {
      const response = NextResponse.json(
        { error: 'Missing required parameters: message, userId' },
        { status: 400 }
      );
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }

    // Get user's astrological context for personalized responses
    const astroContext = await getUserAstroContext(userId, lang);
    
    // Create personalized system prompt
    const systemPrompt = `तपाईं ZSTRO AI हुनुहुन्छ, एक वैदिक ज्योतिष विशेषज्ञ। तपाईंले निम्न ज्योतिषीय विवरणहरू प्रयोग गरेर व्यक्तिगत उत्तर दिनुहोस्:

${astroContext}

तपाईंको उत्तरहरू:
- नेपाली भाषामा दिनुहोस्
- वैदिक ज्योतिषका सिद्धान्तहरूमा आधारित हुनुहोस्
- व्यक्तिगत र सहायक हुनुहोस्
- सरल र स्पष्ट भाषामा लेख्नुहोस्
- यदि आवश्यक भए, उपायहरू सुझाउनुहोस्

प्रश्न: ${message}`;

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    });

    const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    const nextResponse = NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: 'gpt-4'
    });
    nextResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return nextResponse;

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // If OpenAI quota exceeded, provide a fallback response
    if (error instanceof Error && error.message.includes('quota')) {
      const fallbackResponse = NextResponse.json({
        success: true,
        response: `Namaste! I'm ZSTRO AI, your Vedic astrology assistant. I'm currently experiencing high demand, but I'm here to help you with your astrological questions. Please try again in a few moments, or visit our Kundali page for detailed astrological analysis.`,
        timestamp: new Date().toISOString(),
        model: 'fallback'
      });
      fallbackResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return fallbackResponse;
    }
    
    const response = NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message: 'ZSTRO AI Chat API',
    version: '1.0.0',
    supportedLanguages: ['en', 'ne'],
    usage: 'POST with message, userId, chatHistory, lang'
  });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return response;
}