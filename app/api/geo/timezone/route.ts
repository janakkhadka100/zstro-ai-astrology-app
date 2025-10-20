export const runtime = "nodejs";
import { NextResponse } from "next/server";
import tzLookup from "tz-lookup";
import { DateTime } from "luxon";
import { TimezoneResult } from "@/lib/types/location";

export async function POST(req: Request) {
  try {
    const { lat, lon, localDate, localTime } = await req.json();
    
    if ([lat, lon, localDate, localTime].some(v => v === undefined || v === null)) {
      return NextResponse.json({ ok: false, error: "bad body" }, { status: 400 });
    }

    const iana = tzLookup(lat, lon);
    const local = DateTime.fromFormat(`${localDate} ${localTime}`, "yyyy-LL-dd HH:mm", { zone: iana });
    
    if (!local.isValid) {
      return NextResponse.json({ 
        ok: false, 
        error: "invalid date/time", 
        details: local.invalidReason 
      }, { status: 400 });
    }

    const offset_minutes = local.offset; // e.g. 345 for Nepal
    const utc = local.toUTC().toISO();

    const result: TimezoneResult = {
      iana,
      offset_minutes,
      datetime_utc: utc || ""
    };

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Timezone calculation error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "timezone calculation failed" 
    }, { status: 500 });
  }
}
