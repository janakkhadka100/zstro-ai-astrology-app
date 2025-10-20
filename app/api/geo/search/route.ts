export const runtime = "nodejs";
import { NextResponse } from "next/server";
import tzLookup from "tz-lookup";
import { NormalizedPlace } from "@/lib/types/location";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    
    if (!q.trim()) {
      return NextResponse.json({ ok: false, error: "empty query" }, { status: 400 });
    }

    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) {
      // Return mock data for demo purposes
      const mockData = getMockSearchResults(q);
      return NextResponse.json({ ok: true, items: mockData });
    }

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(q)}&key=${apiKey}&language=en&limit=5&no_annotations=0`
    );

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "geocoding failed" }, { status: 502 });
    }

    const data = await response.json();
    const results = data.results || [];

    const items: NormalizedPlace[] = results.map((item: any) => {
      const lat = Number(item.geometry?.lat);
      const lon = Number(item.geometry?.lng);
      const iana = tzLookup(lat, lon); // robust IANA
      const comp = item.components || {};
      
      return {
        provider: "opencage" as const,
        provider_place_id: item.annotations?.what3words || item.annotations?.geohash || item.components?.city || item.formatted,
        display_name: item.formatted,
        country: comp.country || "",
        country_code: comp.country_code || "",
        admin1: comp.state || comp.region || null,
        city: comp.city || comp.town || comp.village || comp.county || null,
        lat,
        lon,
        iana_tz: iana,
        raw: item
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (error: any) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ ok: false, error: error.message || "geocoding failed" }, { status: 500 });
  }
}

function getMockSearchResults(query: string): NormalizedPlace[] {
  const mockPlaces: NormalizedPlace[] = [
    {
      provider: "opencage",
      provider_place_id: "kathmandu-nepal",
      display_name: "Kathmandu, Bagmati, Nepal",
      country: "Nepal",
      country_code: "np",
      admin1: "Bagmati",
      city: "Kathmandu",
      lat: 27.7172,
      lon: 85.3240,
      iana_tz: "Asia/Kathmandu",
      raw: { mock: true }
    },
    {
      provider: "opencage",
      provider_place_id: "new-york-usa",
      display_name: "New York, NY, USA",
      country: "United States",
      country_code: "us",
      admin1: "New York",
      city: "New York",
      lat: 40.7128,
      lon: -74.0060,
      iana_tz: "America/New_York",
      raw: { mock: true }
    },
    {
      provider: "opencage",
      provider_place_id: "london-uk",
      display_name: "London, England, UK",
      country: "United Kingdom",
      country_code: "gb",
      admin1: "England",
      city: "London",
      lat: 51.5074,
      lon: -0.1278,
      iana_tz: "Europe/London",
      raw: { mock: true }
    },
    {
      provider: "opencage",
      provider_place_id: "tokyo-japan",
      display_name: "Tokyo, Japan",
      country: "Japan",
      country_code: "jp",
      admin1: "Tokyo",
      city: "Tokyo",
      lat: 35.6762,
      lon: 139.6503,
      iana_tz: "Asia/Tokyo",
      raw: { mock: true }
    },
    {
      provider: "opencage",
      provider_place_id: "sydney-australia",
      display_name: "Sydney, NSW, Australia",
      country: "Australia",
      country_code: "au",
      admin1: "New South Wales",
      city: "Sydney",
      lat: -33.8688,
      lon: 151.2093,
      iana_tz: "Australia/Sydney",
      raw: { mock: true }
    }
  ];

  // Filter results based on query
  const filtered = mockPlaces.filter(place => 
    place.display_name.toLowerCase().includes(query.toLowerCase()) ||
    place.city?.toLowerCase().includes(query.toLowerCase()) ||
    place.country.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, 5);
}
