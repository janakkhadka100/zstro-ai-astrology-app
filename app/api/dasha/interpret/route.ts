// app/api/dasha/interpret/route.ts
// AI-powered Dasha Interpretation API

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getFullDashaHierarchy } from "@/lib/astro/dashaEngine";
import { dashaInterpretationPrompt, detectLanguage } from "@/lib/ai/prompts";
import { openai } from "@/lib/ai/openaiClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, query, lang } = body;

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Get dasha hierarchy for the specified date
    const hierarchy = await getFullDashaHierarchy(date, session.user.id);
    if (!hierarchy) {
      return NextResponse.json({ error: "Unable to calculate dasha hierarchy" }, { status: 500 });
    }

    // Detect language if not provided
    const detectedLang = lang || detectLanguage(query);

    // Generate AI interpretation
    const prompt = dashaInterpretationPrompt(hierarchy, date, detectedLang);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert Vedic astrologer specializing in Vimshottari Dasha analysis. Provide detailed, accurate interpretations of multi-level dasha combinations. Be specific about planetary influences and practical guidance.`
        },
        {
          role: "user", 
          content: `${prompt}\n\nUser Query: ${query || 'Please analyze this dasha combination and provide insights.'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const interpretation = response.choices[0]?.message?.content?.trim();
    
    if (!interpretation) {
      return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        hierarchy: hierarchy.summary,
        interpretation,
        language: detectedLang,
        active_chain: hierarchy.active_chain
      }
    });

  } catch (error) {
    console.error("Dasha interpretation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const query = searchParams.get("query") || "";
    const lang = searchParams.get("lang");

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Get dasha hierarchy for the specified date
    const hierarchy = await getFullDashaHierarchy(date, session.user.id);
    if (!hierarchy) {
      return NextResponse.json({ error: "Unable to calculate dasha hierarchy" }, { status: 500 });
    }

    // Detect language if not provided
    const detectedLang = lang || detectLanguage(query);

    // Generate AI interpretation
    const prompt = dashaInterpretationPrompt(hierarchy, date, detectedLang);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert Vedic astrologer specializing in Vimshottari Dasha analysis. Provide detailed, accurate interpretations of multi-level dasha combinations. Be specific about planetary influences and practical guidance.`
        },
        {
          role: "user", 
          content: `${prompt}\n\nUser Query: ${query || 'Please analyze this dasha combination and provide insights.'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const interpretation = response.choices[0]?.message?.content?.trim();
    
    if (!interpretation) {
      return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        hierarchy: hierarchy.summary,
        interpretation,
        language: detectedLang,
        active_chain: hierarchy.active_chain
      }
    });

  } catch (error) {
    console.error("Dasha interpretation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
