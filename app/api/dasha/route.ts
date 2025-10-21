// app/api/dasha/route.ts
// ZSTRO AI Dasha Calculation API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { calculateVimshottariDasha, calculateYoginiDasha } from '@/lib/astro/dashaEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dob, tob, lat, lon, tz, system = 'vimshottari', lang = 'ne' } = body;

    if (!dob || !tob || !lat || !lon || !tz) {
      return NextResponse.json(
        { error: 'Missing required parameters: dob, tob, lat, lon, tz' },
        { status: 400 }
      );
    }

    let dashaData;

    if (system === 'vimshottari') {
      dashaData = await calculateVimshottariDasha({
        dob,
        tob,
        lat,
        lon,
        tz,
        lang: lang as 'en' | 'ne'
      });
    } else if (system === 'yogini') {
      dashaData = await calculateYoginiDasha({
        dob,
        tob,
        lat,
        lon,
        tz,
        lang: lang as 'en' | 'ne'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid dasha system. Use "vimshottari" or "yogini"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dashaData,
      system,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dasha API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate dasha',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const system = searchParams.get('system') || 'vimshottari';
  
  return NextResponse.json({
    message: 'ZSTRO AI Dasha API',
    supportedSystems: ['vimshottari', 'yogini'],
    currentSystem: system,
    usage: 'POST with dob, tob, lat, lon, tz, system, lang'
  });
}