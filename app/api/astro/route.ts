// app/api/astro/route.ts
// ZSTRO AI Astro Data API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getAstroData } from '@/lib/prokerala/service';
import { calculateHouse } from '@/lib/ai/astro-worker-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dob, tob, lat, lon, tz, lang = 'ne' } = body;

    if (!dob || !tob || !lat || !lon || !tz) {
      return NextResponse.json(
        { error: 'Missing required parameters: dob, tob, lat, lon, tz' },
        { status: 400 }
      );
    }

    // Fetch astro data from Prokerala
    const astroData = await getAstroData({
      dob,
      tob,
      lat,
      lon,
      tz,
      lang: lang as 'en' | 'ne'
    });

    // Enhance with house calculations
    if (astroData.d1 && astroData.ascSignId) {
      const enhancedPlanets = astroData.d1.map(planet => {
        const house = calculateHouse(planet.signId, astroData.ascSignId);
        return {
          ...planet,
          house,
          houseMeaning: getHouseMeaning(house, lang)
        };
      });

      astroData.d1 = enhancedPlanets;
    }

    return NextResponse.json({
      success: true,
      data: astroData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Astro API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch astro data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getHouseMeaning(house: number, lang: 'en' | 'ne'): string {
  const meanings = {
    en: {
      1: 'Self/Personality', 2: 'Wealth/Family', 3: 'Siblings/Communication',
      4: 'Home/Mother', 5: 'Children/Creativity', 6: 'Health/Service',
      7: 'Marriage/Partnership', 8: 'Transformation/Shared Resources',
      9: 'Philosophy/Father', 10: 'Career/Authority', 11: 'Gains/Friends',
      12: 'Spirituality/Losses'
    },
    ne: {
      1: 'आत्मा/व्यक्तित्व', 2: 'धन/परिवार', 3: 'भाइबहिनी/संचार',
      4: 'घर/आमा', 5: 'सन्तान/सृजनशीलता', 6: 'स्वास्थ्य/सेवा',
      7: 'विवाह/साझेदारी', 8: 'परिवर्तन/साझा संसाधन',
      9: 'दर्शन/बुबा', 10: 'कर्म/प्रतिष्ठा', 11: 'लाभ/मित्र',
      12: 'आध्यात्मिकता/हानि'
    }
  };

  return meanings[lang][house as keyof typeof meanings.en] || '';
}
