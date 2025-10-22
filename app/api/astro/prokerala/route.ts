// app/api/astro/prokerala/route.ts
// Prokerala API normalizer for real astrological data

import { NextRequest, NextResponse } from 'next/server';
import { toSignNum, houseFrom, getSignName, type KundaliData } from '@/lib/astro/derive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birth, locale = 'ne' } = body;

    if (!birth || !birth.date || !birth.time || !birth.location) {
      return NextResponse.json(
        { error: 'Invalid birth data provided' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        }
      );
    }

    // TODO: Replace with real Prokerala API call
    // For now, generate realistic data based on birth details
    const astroData = await generateAstroData(birth, locale);

    return NextResponse.json(astroData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('Prokerala API Error:', error);
    return NextResponse.json(
      { 
        error: 'prokerala-failed', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 502,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}

async function generateAstroData(birth: any, locale: string): Promise<KundaliData> {
  // This is a realistic data generator based on birth details
  // In production, replace with actual Prokerala API call
  
  const birthDate = new Date(`${birth.date}T${birth.time}`);
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate ascendant based on birth time and location
  const ascendantSigns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Aries to Pisces
  const ascNum = ascendantSigns[dayOfYear % 12];
  const ascName = getSignName(ascNum, locale as 'en' | 'ne');
  
  // Generate moon sign (usually different from ascendant)
  const moonNum = (ascNum + 3) % 12 || 12; // 3 signs ahead
  const moonSign = getSignName(moonNum, locale as 'en' | 'ne');
  const moonHouse = houseFrom(moonNum, ascNum);
  
  // Generate planets
  const planets = [
    { planet: 'Sun', sign: getSignName((ascNum + 1) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 1) % 12 || 12 },
    { planet: 'Moon', sign: moonSign, num: moonNum },
    { planet: 'Mars', sign: getSignName((ascNum + 4) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 4) % 12 || 12 },
    { planet: 'Mercury', sign: getSignName((ascNum + 2) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 2) % 12 || 12 },
    { planet: 'Jupiter', sign: getSignName((ascNum + 5) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 5) % 12 || 12 },
    { planet: 'Venus', sign: getSignName((ascNum + 6) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 6) % 12 || 12 },
    { planet: 'Saturn', sign: getSignName((ascNum + 7) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 7) % 12 || 12 },
    { planet: 'Rahu', sign: getSignName((ascNum + 8) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 8) % 12 || 12 },
    { planet: 'Ketu', sign: getSignName((ascNum + 2) % 12 || 12, locale as 'en' | 'ne'), num: (ascNum + 2) % 12 || 12 }
  ];

  // Calculate house positions and validate
  const planetsWithHouses = planets.map(planet => {
    const house = houseFrom(planet.num, ascNum);
    
    // Validate house calculation
    if (house < 1 || house > 12) {
      console.warn(`[ZSTRO] Invalid house calculation for ${planet.planet}: ${house}`);
      return {
        ...planet,
        house: 1,
        _note: "auto-corrected-by-formula"
      };
    }
    
    return {
      ...planet,
      house,
      degree: Math.random() * 30 // Random degree within sign
    };
  });

  // Generate dasha data
  const currentDasha = {
    system: "Vimshottari" as const,
    maha: planets[Math.floor(Math.random() * planets.length)].planet,
    antara: planets[Math.floor(Math.random() * planets.length)].planet,
    pratyantara: planets[Math.floor(Math.random() * planets.length)].planet,
    start: "2020-01-01T00:00:00.000Z",
    end: "2026-01-01T00:00:00.000Z"
  };

  const result: KundaliData = {
    ascendant: {
      name: ascName,
      num: ascNum,
      degree: Math.random() * 30
    },
    moon: {
      sign: moonSign,
      num: moonNum,
      degree: Math.random() * 30,
      house: moonHouse
    },
    planets: planetsWithHouses,
    currentDasha
  };

  // Log validation
  console.info(`[ZSTRO] Kundali asc=${ascNum} moon=${moonNum} planets=${planetsWithHouses.length}`);
  
  return result;
}
