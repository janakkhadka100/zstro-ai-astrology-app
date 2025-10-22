// app/api/transits/route.ts
// Transit API endpoint for fetching planetary positions

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { activeContextStack, getDateContextStack } from "@/lib/astro/stack";
import { validateTransitDate, validateUserData } from "@/lib/safety/transit";
import { getRealtimeTransits } from "@/lib/astro/realtimeTransits";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Validate date using safety rails
    const dateValidation = validateTransitDate(date);
    if (!dateValidation.valid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    const contextStack = await getDateContextStack(session.user.id, date);

    // Check if we should use real-time updates
    const useRealtime = searchParams.get('realtime') === 'true';
    
    if (useRealtime) {
      // Use real-time transit data
      const realtimeData = await getRealtimeTransits(session.user.id, date);
      return NextResponse.json({
        success: true,
        data: {
          ...contextStack,
          transits: realtimeData.planets,
          realtime: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: contextStack
    });

  } catch (error) {
    console.error("Transit API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Validate date using safety rails
    const dateValidation = validateTransitDate(date);
    if (!dateValidation.valid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    const contextStack = await getDateContextStack(session.user.id, date);

    // Check if we should use real-time updates
    const { searchParams } = new URL(req.url);
    const useRealtime = searchParams.get('realtime') === 'true';
    
    if (useRealtime) {
      // Use real-time transit data
      const realtimeData = await getRealtimeTransits(session.user.id, date);
      return NextResponse.json({
        success: true,
        data: {
          ...contextStack,
          transits: realtimeData.planets,
          realtime: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: contextStack
    });

  } catch (error) {
    console.error("Transit API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}