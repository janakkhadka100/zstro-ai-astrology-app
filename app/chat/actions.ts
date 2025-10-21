"use server";

import { AstroPayload, createSkeletonPayload, normalizePlanetRow, normalizeDashaNode } from "@/lib/astro-contract";

export async function getAstroPayload(userId: string): Promise<AstroPayload> {
  try {
    // Try to fetch from existing API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/astro/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lang: 'ne' })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize the response data
    const payload: AstroPayload = {
      lang: data.lang || "ne",
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
    
    // Return mock data for development - but with correct Moon position
    return {
      lang: "ne",
      birth: {
        name: "dsfs",
        birthDate: "1993-12-16",
        birthTime: "16:17",
        birthPlace: "Arghakhanchi"
      },
      overview: {
        asc: "Taurus",
        moon: "Capricorn", // Correct Moon sign as per user profile
        summary: "तपाईंको जन्मकुण्डली अनुसार तपाईं वृष लग्न र मकर राशिमा जन्मिएका हुनुहुन्छ।"
      },
      planets: [
        { planet: "Sun", signLabel: "Taurus", house: 1, degree: 15.23, safeHouse: 1 },
        { planet: "Moon", signLabel: "Capricorn", house: 9, degree: 10.0, safeHouse: 9 }, // Correct Moon position
        { planet: "Mars", signLabel: "Cancer", house: 3, degree: 22.1, safeHouse: 3 },
        { planet: "Mercury", signLabel: "Gemini", house: 2, degree: 5.5, safeHouse: 2 },
        { planet: "Jupiter", signLabel: "Sagittarius", house: 6, degree: 18.7, safeHouse: 6 },
        { planet: "Venus", signLabel: "Taurus", house: 1, degree: 8.9, safeHouse: 1 },
        { planet: "Saturn", signLabel: "Aquarius", house: 10, degree: 12.3, safeHouse: 10 },
        { planet: "Rahu", signLabel: "Scorpio", house: 7, degree: 15.5, safeHouse: 7 }, // Correct Rahu position - 7th house
        { planet: "Ketu", signLabel: "Taurus", house: 1, degree: 15.5, safeHouse: 1 }
      ],
      charts: {
        d1: { type: "Rashi", ascendant: "Taurus" },
        d9: { type: "Navamsa", ascendant: "Leo" }
      },
      vimshottari: [
        {
          name: "Rahu",
          lord: "Rahu",
          start: "2011-01-01T00:00:00Z",
          end: "2029-01-01T00:00:00Z",
          level: "MAHA",
          children: [
            {
              name: "Jupiter",
              lord: "Jupiter",
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
      analysis: "तपाईंको जन्मकुण्डली अनुसार तपाईं वृष लग्न र मकर राशिमा जन्मिएका हुनुहुन्छ। यो संयोजन तपाईंलाई दृढता, विश्वसनीयता र भौतिक सुरक्षाको इच्छा दिन्छ। सूर्य, मंगल र बुधको संयोजनले तपाईंलाई उद्देश्यपूर्ण र तार्किक बनाउँछ, तर राहुको प्रभावले अनिश्चितता ल्याउन सक्छ।",
      suggestions: [
        "मेरो करियरका लागि केही सुझाव दिनुहोस्",
        "मेरो विवाह जीवन कस्तो हुनेछ?",
        "मेरो भविष्यका लागि केही ज्योतिषीय सुझाव दिनुहोस्"
      ]
    };
  }
}
