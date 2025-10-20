// app/api/transits/route.ts
// Transit API endpoint for fetching planetary positions

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { activeContextStack, getDateContextStack } from "@/lib/astro/stack";

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

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Validate date is not in the future beyond reasonable limit
    const requestedDate = new Date(date);
    const today = new Date();
    const maxFutureDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
    
    if (requestedDate > maxFutureDate) {
      return NextResponse.json({ error: "Date cannot be more than 1 year in the future" }, { status: 400 });
    }

    const contextStack = await getDateContextStack(session.user.id, date);

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

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Validate date is not in the future beyond reasonable limit
    const requestedDate = new Date(date);
    const today = new Date();
    const maxFutureDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
    
    if (requestedDate > maxFutureDate) {
      return NextResponse.json({ error: "Date cannot be more than 1 year in the future" }, { status: 400 });
    }

    const contextStack = await getDateContextStack(session.user.id, date);

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
