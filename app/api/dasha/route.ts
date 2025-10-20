// app/api/dasha/route.ts
// Multi-Level Dasha System API

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getFullDashaHierarchy, getUpcomingDashaChanges, getDashaPeriodsForRange } from "@/lib/astro/dashaEngine";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const action = searchParams.get("action") || "hierarchy";
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!date && action === "hierarchy") {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    switch (action) {
      case "hierarchy": {
        const hierarchy = await getFullDashaHierarchy(date!, session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to calculate dasha hierarchy" }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: hierarchy
        });
      }

      case "upcoming": {
        const hierarchy = await getFullDashaHierarchy(new Date().toISOString().split('T')[0], session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to get upcoming changes" }, { status: 500 });
        }

        const upcoming = getUpcomingDashaChanges(hierarchy.all_periods, new Date(), limit);
        
        return NextResponse.json({
          success: true,
          data: {
            upcoming_changes: upcoming,
            total_count: upcoming.length
          }
        });
      }

      case "range": {
        if (!startDate || !endDate) {
          return NextResponse.json({ error: "startDate and endDate parameters required" }, { status: 400 });
        }

        const hierarchy = await getFullDashaHierarchy(startDate, session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to get dasha periods for range" }, { status: 500 });
        }

        const rangePeriods = getDashaPeriodsForRange(
          hierarchy.all_periods,
          new Date(startDate),
          new Date(endDate)
        );

        return NextResponse.json({
          success: true,
          data: {
            periods: rangePeriods,
            total_count: rangePeriods.length,
            date_range: { start: startDate, end: endDate }
          }
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }

  } catch (error) {
    console.error("Dasha API error:", error);
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
    const { date, action = "hierarchy", limit = 10, startDate, endDate } = body;

    if (!date && action === "hierarchy") {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    switch (action) {
      case "hierarchy": {
        const hierarchy = await getFullDashaHierarchy(date, session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to calculate dasha hierarchy" }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: hierarchy
        });
      }

      case "upcoming": {
        const hierarchy = await getFullDashaHierarchy(new Date().toISOString().split('T')[0], session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to get upcoming changes" }, { status: 500 });
        }

        const upcoming = getUpcomingDashaChanges(hierarchy.all_periods, new Date(), limit);
        
        return NextResponse.json({
          success: true,
          data: {
            upcoming_changes: upcoming,
            total_count: upcoming.length
          }
        });
      }

      case "range": {
        if (!startDate || !endDate) {
          return NextResponse.json({ error: "startDate and endDate parameters required" }, { status: 400 });
        }

        const hierarchy = await getFullDashaHierarchy(startDate, session.user.id);
        if (!hierarchy) {
          return NextResponse.json({ error: "Unable to get dasha periods for range" }, { status: 500 });
        }

        const rangePeriods = getDashaPeriodsForRange(
          hierarchy.all_periods,
          new Date(startDate),
          new Date(endDate)
        );

        return NextResponse.json({
          success: true,
          data: {
            periods: rangePeriods,
            total_count: rangePeriods.length,
            date_range: { start: startDate, end: endDate }
          }
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }

  } catch (error) {
    console.error("Dasha API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
