// app/api/panchang/route.ts
// Panchang API endpoint for daily Hindu calendar information

import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];
    
    // For now, we'll return mock data. In production, this would connect to a real panchang API
    const panchangData = {
      date: date,
      nepaliDate: "२०८१ कार्तिक १५",
      tithi: "शुक्ल पक्ष, द्वितीया",
      nakshatra: "रोहिणी",
      yoga: "सिद्धि",
      karana: "बव",
      paksha: "शुक्ल",
      rashi: "वृषभ",
      sunrise: "६:१५",
      sunset: "५:४५",
      moonrise: "११:३०",
      moonset: "१२:१५",
      abhijitMuhurat: "११:४५ - १२:३०",
      brahmaMuhurat: "४:३० - ५:१५",
      rahuKaal: "१२:०० - १:३०",
      gulikaKaal: "१:३० - ३:००",
      yamaganda: "९:०० - १०:३०",
      var: getDayOfWeek(date),
      masam: "कार्तिक",
      samvatsar: "२०८१",
      events: [
        { date: "2024-10-21", title: "दशैं", type: 'festival' },
        { date: "2024-10-22", title: "तिहार", type: 'festival' },
        { date: "2024-10-25", title: "एकादशी व्रत", type: 'fast' },
        { date: "2024-10-30", title: "कार्तिक पूर्णिमा", type: 'special' }
      ]
    };

    return NextResponse.json({
      success: true,
      data: panchangData
    });

  } catch (error) {
    console.error("Panchang API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = [
    "रविवार", "सोमवार", "मंगलवार", "बुधवार", 
    "गुरुवार", "शुक्रवार", "शनिवार"
  ];
  return days[date.getDay()];
}
