// app/api/astrology/dasha-comprehensive/route.ts
// API endpoint for comprehensive dasha calculations

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { calculateDashaSystem, DashaRequest, DashaResponse } from "@/lib/astro/dashaCalculator";
import { DASHA_CALCULATION_SYSTEM_PROMPT, DASHA_CALCULATION_USER_PROMPT } from "@/lib/ai/dashaCalculationPrompt";
import { openai } from "@/lib/ai/openaiClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      birth, 
      moon_longitude_deg, 
      locale = "ne-NP", 
      query_range, 
      user_events, 
      config 
    } = body;

    // Validate required fields
    if (!birth || !moon_longitude_deg) {
      return NextResponse.json({ 
        error: "Missing required fields: birth and moon_longitude_deg" 
      }, { status: 400 });
    }

    // Validate birth data structure
    if (!birth.date || !birth.time || !birth.tz_offset || !birth.location || !birth.ayanamsa) {
      return NextResponse.json({ 
        error: "Invalid birth data structure" 
      }, { status: 400 });
    }

    // If no LLM analysis requested, return basic calculation
    if (body.skipLLM) {
      const request: DashaRequest = {
        birth,
        moon_longitude_deg,
        locale,
        query_range,
        user_events,
        config
      };

      const result = calculateDashaSystem(request);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // Prepare LLM request
    const llmRequest = {
      birth,
      moon_longitude_deg,
      locale,
      query_range,
      user_events,
      config
    };

    try {
      // Call LLM for detailed analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: DASHA_CALCULATION_SYSTEM_PROMPT },
          { role: "user", content: DASHA_CALCULATION_USER_PROMPT(llmRequest) }
        ],
        temperature: 0.1, // Low temperature for precise calculations
        max_tokens: 4000,
      });

      const llmResponse = completion.choices[0]?.message?.content;
      if (!llmResponse) {
        throw new Error("No response from LLM");
      }

      // Parse LLM response
      let parsedResponse: DashaResponse;
      try {
        parsedResponse = JSON.parse(llmResponse);
      } catch (parseError) {
        console.error("Failed to parse LLM response:", parseError);
        // Fallback to basic calculation
        const request: DashaRequest = {
          birth,
          moon_longitude_deg,
          locale,
          query_range,
          user_events,
          config
        };
        const result = calculateDashaSystem(request);
        return NextResponse.json({
          success: true,
          data: result,
          error: "LLM analysis failed, showing basic calculation"
        });
      }

      return NextResponse.json({
        success: true,
        data: parsedResponse
      });

    } catch (llmError) {
      console.error("LLM analysis error:", llmError);
      
      // Return basic calculation as fallback
      const request: DashaRequest = {
        birth,
        moon_longitude_deg,
        locale,
        query_range,
        user_events,
        config
      };
      const result = calculateDashaSystem(request);
      
      return NextResponse.json({
        success: true,
        data: result,
        error: "LLM analysis failed, showing basic calculation"
      });
    }

  } catch (error) {
    console.error("Dasha calculation API error:", error);
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
      birth: {
        date: "1990-05-15",
        time: "14:30:00",
        tz_offset: "+05:45",
        location: {
          lat: 27.7172,
          lon: 85.3240
        },
        ayanamsa: "Lahiri"
      },
      moon_longitude_deg: 120.5,
      locale: "ne-NP",
      query_range: {
        from: "2024-01-01T00:00:00Z",
        to: "2024-12-31T23:59:59Z"
      },
      user_events: ["2020-06-15", "2022-03-10"],
      config: {
        traditionHints: {
          startFrom: "Mangala"
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: "Comprehensive dasha calculation API endpoint",
      example,
      usage: {
        method: "POST",
        body: {
          birth: "object with date, time, tz_offset, location, ayanamsa",
          moon_longitude_deg: "number (sidereal longitude)",
          locale: "optional 'ne-NP' | 'en' (default: 'ne-NP')",
          query_range: "optional { from: string, to: string }",
          user_events: "optional string[] (YYYY-MM-DD dates)",
          config: "optional { traditionHints: { startFrom: string } }",
          skipLLM: "optional boolean (default: false)"
        }
      }
    });

  } catch (error) {
    console.error("Dasha calculation API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
