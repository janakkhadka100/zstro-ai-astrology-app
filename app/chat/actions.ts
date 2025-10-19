"use server";

import { AstroPayload, createSkeletonPayload, normalizePlanetRow, normalizeDashaNode } from "@/lib/astro-contract";

export async function getAstroPayload(userId: string): Promise<AstroPayload> {
  try {
    // Try to fetch from existing API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize the response data
    const payload: AstroPayload = {
      lang: data.lang || "en",
      birth: {
        name: data.birth?.name || "User",
        birthDate: data.birth?.birthDate || "1990-01-01",
        birthTime: data.birth?.birthTime || "12:00",
        birthPlace: data.birth?.birthPlace || "Kathmandu, Nepal"
      },
      overview: {
        asc: data.overview?.asc || "Aries",
        moon: data.overview?.moon || "Taurus",
        summary: data.overview?.summary || "Your birth chart shows interesting planetary positions."
      },
      planets: (data.planets || []).map(normalizePlanetRow),
      charts: {
        d1: data.charts?.d1 || null,
        d9: data.charts?.d9 || null
      },
      vimshottari: (data.vimshottari || []).map(normalizeDashaNode),
      yogini: (data.yogini || []).map(normalizeDashaNode),
      transits: {
        date: data.transits?.date || new Date().toISOString(),
        highlights: data.transits?.highlights || ["Jupiter in Aries brings new opportunities"],
        activeHouses: data.transits?.activeHouses || [1, 5, 9]
      },
      analysis: data.analysis || "Your birth chart indicates strong potential for success in career and relationships. The planetary positions suggest a balanced approach to life with opportunities for growth.",
      suggestions: data.suggestions || [
        "What are the best career paths for me?",
        "How can I improve my relationships?",
        "What does my future hold regarding finances?"
      ]
    };

    return payload;
  } catch (error) {
    console.error('Error fetching astro payload:', error);
    
    // Return mock data for development
    return {
      lang: "en",
      birth: {
        name: "John Doe",
        birthDate: "1990-05-15",
        birthTime: "10:30 AM",
        birthPlace: "Kathmandu, Nepal"
      },
      overview: {
        asc: "Taurus",
        moon: "Capricorn",
        summary: "Your birth chart shows strong potential for success in career and relationships."
      },
      planets: [
        { planet: "Sun", signLabel: "Taurus", house: 1, degree: 15.23, safeHouse: 1 },
        { planet: "Moon", signLabel: "Capricorn", house: 9, degree: 10.0, safeHouse: 9 },
        { planet: "Mars", signLabel: "Cancer", house: 3, degree: 22.1, safeHouse: 3 },
        { planet: "Mercury", signLabel: "Gemini", house: 2, degree: 5.5, safeHouse: 2 },
        { planet: "Jupiter", signLabel: "Sagittarius", house: 7, degree: 18.7, safeHouse: 7 },
        { planet: "Venus", signLabel: "Taurus", house: 1, degree: 8.9, safeHouse: 1 },
        { planet: "Saturn", signLabel: "Aquarius", house: 10, degree: 12.3, safeHouse: 10 }
      ],
      charts: {
        d1: { type: "Rashi", ascendant: "Taurus" },
        d9: { type: "Navamsa", ascendant: "Leo" }
      },
      vimshottari: [
        {
          name: "Jupiter",
          lord: "Jupiter",
          start: "2020-01-01T00:00:00Z",
          end: "2036-01-01T00:00:00Z",
          level: "MAHA",
          children: [
            {
              name: "Saturn",
              lord: "Saturn",
              start: "2024-01-01T00:00:00Z",
              end: "2027-01-01T00:00:00Z",
              level: "ANTAR",
              children: []
            }
          ]
        }
      ],
      yogini: [
        {
          name: "Sankata",
          lord: "Saturn",
          start: "2022-01-01T00:00:00Z",
          end: "2029-01-01T00:00:00Z",
          level: "YOGINI",
          children: [
            {
              name: "Ulka",
              lord: "Mars",
              start: "2024-01-01T00:00:00Z",
              end: "2026-01-01T00:00:00Z",
              level: "Y_ANTAR",
              children: []
            }
          ]
        }
      ],
      transits: {
        date: new Date().toISOString(),
        highlights: [
          "Jupiter in Aries brings new opportunities",
          "Saturn in Aquarius supports career growth",
          "Mars in Cancer enhances communication"
        ],
        activeHouses: [1, 5, 9]
      },
      analysis: "Your birth chart indicates strong potential for success in career and relationships. The planetary positions suggest a balanced approach to life with opportunities for growth. Jupiter's influence brings wisdom and expansion, while Saturn provides discipline and structure.",
      suggestions: [
        "What are the best career paths for me?",
        "How can I improve my relationships?",
        "What does my future hold regarding finances?"
      ]
    };
  }
}
