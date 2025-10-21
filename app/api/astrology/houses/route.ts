// app/api/astrology/houses/route.ts
// API endpoint for Vedic astrology house calculations

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { 
  buildAstroDerivePayload, 
  buildAstroDerivePayloadWithLordship,
  calculateHouses, 
  HouseCalculationRequest,
  HouseCalculationResponse 
} from "@/lib/astro/houseCalculation";
import { HOUSE_CALCULATION_SYSTEM_PROMPT, HOUSE_CALCULATION_USER_PROMPT } from "@/lib/ai/houseCalculationPrompt";
import { openai } from "@/lib/ai/openaiClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ascendant, planets, dasha, locale = "ne-NP" } = body;

    // Validate input
    if (!ascendant || !planets) {
      return NextResponse.json({ 
        error: "Missing required fields: ascendant and planets" 
      }, { status: 400 });
    }

    // Calculate basic house positions
    const basicCalculation = calculateHouses(ascendant, planets, locale);

    // If no LLM analysis requested, return basic calculation
    if (body.skipLLM) {
      return NextResponse.json({
        success: true,
        data: basicCalculation
      });
    }

    // Prepare LLM request with lordship calculation
    const llmRequest = buildAstroDerivePayloadWithLordship(ascendant, planets, dasha, locale);

    try {
      // Call LLM for detailed analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: HOUSE_CALCULATION_SYSTEM_PROMPT },
          { role: "user", content: HOUSE_CALCULATION_USER_PROMPT(llmRequest) }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const llmResponse = completion.choices[0]?.message?.content;
      if (!llmResponse) {
        throw new Error("No response from LLM");
      }

      // Parse LLM response
      let parsedResponse: HouseCalculationResponse;
      try {
        parsedResponse = JSON.parse(llmResponse);
      } catch (parseError) {
        console.error("Failed to parse LLM response:", parseError);
        // Fallback to basic calculation with error note
        return NextResponse.json({
          success: true,
          data: {
            ...basicCalculation,
            summary: "House positions calculated successfully. Detailed analysis temporarily unavailable.",
            error: "LLM analysis failed, showing basic calculation"
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: parsedResponse
      });

    } catch (llmError) {
      console.error("LLM analysis error:", llmError);
      
      // Return basic calculation as fallback
      return NextResponse.json({
        success: true,
        data: {
          ...basicCalculation,
          summary: "House positions calculated successfully. Detailed analysis temporarily unavailable.",
          error: "LLM analysis failed, showing basic calculation"
        }
      });
    }

  } catch (error) {
    console.error("House calculation API error:", error);
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

    // Example usage
    const example = {
      ascendant: "Taurus",
      planets: {
        "Sun": "Sagittarius",
        "Moon": "Capricorn", 
        "Mars": 8,
        "Mercury": "Sagittarius",
        "Jupiter": "Libra",
        "Venus": "Virgo",
        "Saturn": "Aquarius",
        "Rahu": "Aries",
        "Ketu": "Libra"
      },
      dasha: { 
        mahadasha: "Venus", 
        antardasha: "Mercury" 
      },
      locale: "ne-NP"
    };

    return NextResponse.json({
      success: true,
      message: "House calculation API endpoint",
      example,
      usage: {
        method: "POST",
        body: {
          ascendant: "string | number (1-12)",
          planets: "Record<string, string | number>",
          dasha: "optional { mahadasha?: string, antardasha?: string }",
          locale: "optional 'ne-NP' | 'en' (default: 'ne-NP')",
          skipLLM: "optional boolean (default: false)"
        }
      }
    });

  } catch (error) {
    console.error("House calculation API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
