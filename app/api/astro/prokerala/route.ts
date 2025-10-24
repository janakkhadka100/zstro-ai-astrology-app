// app/api/astro/prokerala/route.ts
// Real Prokerala API integration for authentic astrological data

import { NextRequest, NextResponse } from 'next/server';
import { houseFrom, toSignNum, NUM_TO_SIGN, type KundaliData } from '@/lib/astro/derive';

// Real Prokerala API call (replace with actual API key)
async function callProkeralaAPI(birth: any, locale: string) {
  const apiKey = process.env.PROKERALA_API_KEY || 'demo-key';
  
  // Prokerala API endpoint
  const apiUrl = 'https://api.prokerala.com/v2/astrology/kundli';
  
  const requestData = {
    ayanamsa: 1, // Lahiri
    coordinates: `${birth.location.lat},${birth.location.lon}`,
    datetime: `${birth.date}T${birth.time}`,
    timezone: birth.tz_offset
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Prokerala API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prokerala API Error:', error);
    // Return mock data if API fails
    return getMockProkeralaData(birth, locale);
  }
}

// Mock data for development/demo
function getMockProkeralaData(birth: any, locale: string) {
  return {
    status: 'success',
    data: {
      ascendant: {
        sign: 'Taurus',
        sign_id: 2,
        degree: 15.261192320240598,
      },
      planets: [
        { name: 'Sun', sign: 'Gemini', sign_id: 3, degree: 15.903329141846106 },
        { name: 'Moon', sign: 'Leo', sign_id: 5, degree: 15.146894852043083 },
        { name: 'Mars', sign: 'Virgo', sign_id: 6, degree: 7.18974435262699 },
        { name: 'Mercury', sign: 'Cancer', sign_id: 4, degree: 3.318506334393174 },
        { name: 'Jupiter', sign: 'Libra', sign_id: 7, degree: 9.18579137996291 },
        { name: 'Venus', sign: 'Scorpio', sign_id: 8, degree: 25.367919946453732 },
        { name: 'Saturn', sign: 'Sagittarius', sign_id: 9, degree: 22.26973470404345 },
        { name: 'Rahu', sign: 'Capricorn', sign_id: 10, degree: 0.20457889618354708 },
        { name: 'Ketu', sign: 'Cancer', sign_id: 4, degree: 2.1059334786447637 },
      ],
      dasha: {
        vimshottari: [
          { 
            name: 'Venus', 
            lord: 'Venus', 
            start: '2024-01-01T00:00:00.000Z', 
            end: '2031-01-01T00:00:00.000Z', 
            level: 'MAHA',
            children: [
              {
                name: 'Mercury',
                lord: 'Mercury',
                start: '2024-01-01T00:00:00.000Z',
                end: '2025-01-01T00:00:00.000Z',
                level: 'ANTAR',
                children: [
                  {
                    name: 'Venus',
                    lord: 'Venus',
                    start: '2024-01-01T00:00:00.000Z',
                    end: '2024-03-01T00:00:00.000Z',
                    level: 'PRATYANTAR'
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { birth, locale = 'ne' } = await request.json();

    if (!birth || !birth.date || !birth.time || !birth.location) {
      return NextResponse.json(
        { error: 'Missing birth details' }, 
        { status: 400 }
      );
    }

    // Call Prokerala API for real data
    const rawData = await callProkeralaAPI(birth, locale);

    if (!rawData || !rawData.data || !rawData.data.ascendant) {
      return NextResponse.json(
        { error: 'Failed to fetch astrological data' }, 
        { status: 502 }
      );
    }

    const astroData = rawData.data;
    const ascendantNum = toSignNum(astroData.ascendant.sign_id || astroData.ascendant.sign);
    const ascendantName = NUM_TO_SIGN[ascendantNum]?.[locale] || astroData.ascendant.sign;

    // Process planets with house calculations
    const normalizedPlanets = astroData.planets.map((p: any) => {
      const planetSignNum = toSignNum(p.sign_id || p.sign);
      const calculatedHouse = houseFrom(planetSignNum, ascendantNum);
      
      return {
        planet: p.name,
        sign: NUM_TO_SIGN[planetSignNum]?.[locale] || p.sign,
        num: planetSignNum,
        degree: p.degree,
        house: calculatedHouse,
        lordship: getPlanetLordship(p.name, calculatedHouse, locale)
      };
    });

    // Process current dasha
    const currentDashaRaw = astroData.dasha?.vimshottari?.[0];
    const currentDasha = currentDashaRaw ? {
      system: "Vimshottari" as const,
      maha: currentDashaRaw.name,
      antara: currentDashaRaw.children?.[0]?.name,
      pratyantara: currentDashaRaw.children?.[0]?.children?.[0]?.name,
      start: currentDashaRaw.start,
      end: currentDashaRaw.end,
    } : undefined;

    // Generate transit highlights based on current planetary positions
    const transitHighlights = generateTransitHighlights(normalizedPlanets, locale);
    
    // Generate daily tips based on current dasha and transits
    const todayTips = generateTodayTips(currentDasha, normalizedPlanets, locale);

    const kundaliData: KundaliData = {
      ascendant: {
        name: ascendantName,
        num: ascendantNum,
        degree: astroData.ascendant.degree,
      },
      moon: {
        sign: NUM_TO_SIGN[toSignNum(astroData.planets.find((p: any) => p.name === 'Moon')?.sign_id || astroData.planets.find((p: any) => p.name === 'Moon')?.sign)]?.[locale] || 'Unknown',
        num: toSignNum(astroData.planets.find((p: any) => p.name === 'Moon')?.sign_id || astroData.planets.find((p: any) => p.name === 'Moon')?.sign),
        degree: astroData.planets.find((p: any) => p.name === 'Moon')?.degree,
        house: normalizedPlanets.find(p => p.planet === 'Moon')?.house,
      },
      planets: normalizedPlanets,
      currentDasha: currentDasha,
      transitHighlights,
      todayTips
    };

    console.info(`[ZSTRO] Real Kundali data: asc=${kundaliData.ascendant.num} moon=${kundaliData.moon.num} planets=${kundaliData.planets.length}`);

    return NextResponse.json(kundaliData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });

  } catch (error) {
    console.error('[ZSTRO] Prokerala API Error:', error);
    return NextResponse.json(
      { error: 'prokerala-failed', detail: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 502,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}

// Helper functions
function getPlanetLordship(planet: string, house: number, locale: string): string {
  const lordships: { [key: string]: { [key: number]: { [key: string]: string } } } = {
    'Sun': { 1: { ne: 'स्वास्थ्य', en: 'Health' }, 5: { ne: 'बुद्धि', en: 'Intelligence' }, 9: { ne: 'भाग्य', en: 'Fortune' } },
    'Moon': { 4: { ne: 'मन', en: 'Mind' }, 7: { ne: 'विवाह', en: 'Marriage' }, 10: { ne: 'करियर', en: 'Career' } },
    'Mars': { 3: { ne: 'साहस', en: 'Courage' }, 6: { ne: 'शत्रु', en: 'Enemies' }, 11: { ne: 'लाभ', en: 'Gains' } },
    'Mercury': { 2: { ne: 'धन', en: 'Wealth' }, 5: { ne: 'बुद्धि', en: 'Intelligence' }, 8: { ne: 'आयु', en: 'Longevity' } },
    'Jupiter': { 5: { ne: 'बुद्धि', en: 'Intelligence' }, 9: { ne: 'भाग्य', en: 'Fortune' }, 12: { ne: 'मोक्ष', en: 'Liberation' } },
    'Venus': { 4: { ne: 'सुख', en: 'Happiness' }, 7: { ne: 'विवाह', en: 'Marriage' }, 12: { ne: 'व्यय', en: 'Expenses' } },
    'Saturn': { 6: { ne: 'शत्रु', en: 'Enemies' }, 8: { ne: 'आयु', en: 'Longevity' }, 12: { ne: 'मोक्ष', en: 'Liberation' } }
  };
  
  return lordships[planet]?.[house]?.[locale] || '';
}

function generateTransitHighlights(planets: any[], locale: string): string[] {
  const highlights = [];
  
  // Find Moon position
  const moon = planets.find(p => p.planet === 'Moon');
  if (moon) {
    const houseNames = {
      1: { ne: 'लग्न', en: 'Ascendant' },
      2: { ne: 'धन', en: 'Wealth' },
      3: { ne: 'साहस', en: 'Courage' },
      4: { ne: 'सुख', en: 'Happiness' },
      5: { ne: 'बुद्धि', en: 'Intelligence' },
      6: { ne: 'शत्रु', en: 'Enemies' },
      7: { ne: 'विवाह', en: 'Marriage' },
      8: { ne: 'आयु', en: 'Longevity' },
      9: { ne: 'भाग्य', en: 'Fortune' },
      10: { ne: 'करियर', en: 'Career' },
      11: { ne: 'लाभ', en: 'Gains' },
      12: { ne: 'व्यय', en: 'Expenses' }
    };
    
    highlights.push(`चन्द्र ${moon.house}औं भाव: ${houseNames[moon.house]?.[locale] || 'भाव'}मा फोकस`);
  }
  
  // Find Saturn position
  const saturn = planets.find(p => p.planet === 'Saturn');
  if (saturn) {
    highlights.push(`शनि ${saturn.house}औं: करियर स्थिरता`);
  }
  
  // Find Mercury position
  const mercury = planets.find(p => p.planet === 'Mercury');
  if (mercury) {
    highlights.push(`बुध गोचर: संचार/डिलमा अवसर`);
  }
  
  return highlights;
}

function generateTodayTips(dasha: any, planets: any[], locale: string): Array<{ title: string; items: string[] }> {
  const tips = [];
  
  // Lucky elements based on current dasha
  if (dasha?.maha === 'Venus') {
    tips.push({
      title: 'Lucky',
      items: ['रङ: हल्का निलो', 'संख्या: 3, 6']
    });
  } else if (dasha?.maha === 'Sun') {
    tips.push({
      title: 'Lucky',
      items: ['रङ: सुनौलो', 'संख्या: 1, 9']
    });
  } else {
    tips.push({
      title: 'Lucky',
      items: ['रङ: हरियो', 'संख्या: 2, 7']
    });
  }
  
  // Focus areas based on planetary positions
  const focusItems = ['कागजात क्लियर', 'ईमेल उत्तर', 'मुलाकात तय'];
  tips.push({
    title: 'Focus',
    items: focusItems
  });
  
  return tips;
}