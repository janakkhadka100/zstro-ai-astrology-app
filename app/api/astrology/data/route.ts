// app/api/astrology/data/route.ts
// JSON data endpoint - cards source of truth

import { NextResponse } from "next/server";
import { getAstroData } from "@/lib/prokerala/service";
import { AstroDataRequest } from "@/lib/astrology/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Validate and normalize request parameters
    const requestData: AstroDataRequest = {
      lang: body?.lang === "en" ? "en" : "ne",
      birthDate: body?.birthDate,
      birthTime: body?.birthTime,
      birthPlace: body?.birthPlace,
      latitude: typeof body?.latitude === "number" ? body.latitude : undefined,
      longitude: typeof body?.longitude === "number" ? body.longitude : undefined,
    };

    // Fetch and normalize astro data
    const data = await getAstroData(requestData);
    
    // Return normalized data as JSON
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
    
  } catch (error) {
    console.error('Error in /api/astrology/data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch astrology data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  try {
    const data = await getAstroData({ lang: "ne" });
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/astrology/data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch astrology data' }, 
      { status: 500 }
    );
  }
}
