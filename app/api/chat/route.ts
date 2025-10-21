// app/api/chat/route.ts
// ZSTRO AI Chat API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openaiClient';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, chatHistory = [], lang = 'ne' } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: message, userId' },
        { status: 400 }
      );
    }

    // Get system prompt for ZSTRO AI
    const systemPrompt = getSystemPrompt(lang as 'en' | 'ne');

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

    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: 'gpt-4'
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ZSTRO AI Chat API',
    version: '1.0.0',
    supportedLanguages: ['en', 'ne'],
    usage: 'POST with message, userId, chatHistory, lang'
  });
}