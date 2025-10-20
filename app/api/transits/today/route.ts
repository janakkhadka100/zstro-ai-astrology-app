// app/api/transits/today/route.ts
// Today's transit API endpoint

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getTodayContextStack } from "@/lib/astro/stack";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contextStack = await getTodayContextStack(session.user.id);

    return NextResponse.json({
      success: true,
      data: contextStack
    });

  } catch (error) {
    console.error("Today's transit API error:", error);
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

    const contextStack = await getTodayContextStack(session.user.id);

    return NextResponse.json({
      success: true,
      data: contextStack
    });

  } catch (error) {
    console.error("Today's transit API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
