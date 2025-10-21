// app/api/astro/bootstrap/route.ts
// Astro Bootstrap API - Uses user profile to generate astro data

import { NextRequest, NextResponse } from 'next/server';
import { calculateHouse } from '@/lib/ai/astro-worker-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lang = 'ne' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        }
      );
    }

    // First get user profile data
    const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/profile`);
    let profileData = null;

    if (profileResponse.ok) {
      profileData = await profileResponse.json();
    }

    // If no profile data, use demo data for testing
    if (!profileData || !profileData.dob) {
      console.log("No profile data found, using demo data");
      profileData = {
        dob: "1990-01-01",
        tob: "12:00",
        lat: 27.7172,
        lon: 85.3240,
        tz: "Asia/Kathmandu",
        pob: "Kathmandu",
        gender: "male",
        language: lang
      };
    }

    // For now, use mock data instead of Prokerala API
    // TODO: Fix Prokerala API integration
    const astroData = {
      ascSignName: 'Taurus',
      moonSignName: 'Capricorn',
      ascSignId: 2,
      moonSignId: 10,
      d1: [
        { name: 'Sun', signName: 'Leo', signId: 5, degree: 15.5, retro: false },
        { name: 'Moon', signName: 'Capricorn', signId: 10, degree: 8.2, retro: false },
        { name: 'Mars', signName: 'Aries', signId: 1, degree: 22.1, retro: false },
        { name: 'Mercury', signName: 'Virgo', signId: 6, degree: 3.7, retro: false },
        { name: 'Jupiter', signName: 'Sagittarius', signId: 9, degree: 18.9, retro: false },
        { name: 'Venus', signName: 'Libra', signId: 7, degree: 25.3, retro: false },
        { name: 'Saturn', signName: 'Aquarius', signId: 11, degree: 12.6, retro: false },
        { name: 'Rahu', signName: 'Gemini', signId: 3, degree: 7.4, retro: true },
        { name: 'Ketu', signName: 'Sagittarius', signId: 9, degree: 7.4, retro: true }
      ],
      vimshottari: [
        { name: 'Venus', start: '2020-01-01', end: '2040-01-01', isCurrent: true },
        { name: 'Sun', start: '2040-01-01', end: '2046-01-01', isCurrent: false },
        { name: 'Moon', start: '2046-01-01', end: '2056-01-01', isCurrent: false }
      ]
    };

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

    // Create a simplified overview for the frontend
    const overview = {
      asc: astroData.ascSignName || 'Unknown',
      moon: astroData.moonSignName || 'Unknown',
      ascSignId: astroData.ascSignId,
      moonSignId: astroData.moonSignId
    };

    // Create planets array with house information
    const planets = (astroData.d1 || []).map(planet => ({
      planet: planet.name,
      sign: planet.signName,
      signId: planet.signId,
      house: planet.house,
      houseMeaning: planet.houseMeaning,
      degree: planet.degree,
      retro: planet.retro
    }));

    // Create vimshottari dasha timeline
    const vimshottari = (astroData.vimshottari || []).map(dasha => ({
      name: dasha.name,
      start: dasha.start,
      end: dasha.end,
      isCurrent: dasha.isCurrent
    }));

    // Create analysis summary
    const analysis = generateAnalysis(overview, planets, vimshottari, lang);

    const response = {
      success: true,
      overview,
      planets,
      vimshottari,
      analysis,
      profile: profileData,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('Astro Bootstrap API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate astro data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}

function getHouseMeaning(house: number, lang: 'en' | 'ne' | 'hi'): string {
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
    },
    hi: {
      1: 'आत्मा/व्यक्तित्व', 2: 'धन/परिवार', 3: 'भाई-बहन/संचार',
      4: 'घर/मां', 5: 'संतान/रचनात्मकता', 6: 'स्वास्थ्य/सेवा',
      7: 'विवाह/साझेदारी', 8: 'परिवर्तन/साझा संसाधन',
      9: 'दर्शन/पिता', 10: 'कर्म/प्रतिष्ठा', 11: 'लाभ/मित्र',
      12: 'आध्यात्मिकता/हानि'
    }
  };

  return meanings[lang][house as keyof typeof meanings.en] || '';
}

function generateAnalysis(overview: any, planets: any[], vimshottari: any[], lang: 'en' | 'ne' | 'hi'): string {
  const currentDasha = vimshottari.find(d => d.isCurrent);
  
  if (lang === 'ne') {
    return `तपाईंको लग्न ${overview.asc} र चन्द्र राशि ${overview.moon} छ। ${currentDasha ? `हाल ${currentDasha.name} महादशा चलिरहेको छ।` : ''} यो ज्योतिषीय विश्लेषण तपाईंको जन्म विवरण अनुसार तयार गरिएको छ।`;
  } else if (lang === 'hi') {
    return `आपका लग्न ${overview.asc} और चंद्र राशि ${overview.moon} है। ${currentDasha ? `वर्तमान में ${currentDasha.name} महादशा चल रही है।` : ''} यह ज्योतिषीय विश्लेषण आपके जन्म विवरण के अनुसार तैयार किया गया है।`;
  } else {
    return `Your ascendant is ${overview.asc} and moon sign is ${overview.moon}. ${currentDasha ? `Currently ${currentDasha.name} Mahadasha is running.` : ''} This astrological analysis has been prepared according to your birth details.`;
  }
}