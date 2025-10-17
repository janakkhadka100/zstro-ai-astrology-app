// app/api/astro/fetch/route.ts
// Fetch API - on-demand data from Prokerala

import { NextRequest, NextResponse } from 'next/server';
import { FetchRequest, FetchResponse } from '@/lib/astrology/types';
import { fetchScopedData } from '@/lib/source/prokerala';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as FetchRequest;
    const { profile, plan, lang } = body;
    
    // Validate request
    if (!lang || !['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }

    if (!profile || !profile.birthDate || !profile.birthTime) {
      return NextResponse.json(
        { success: false, errors: ['Profile data incomplete'] },
        { status: 400 }
      );
    }

    if (!plan || plan.length === 0) {
      return NextResponse.json(
        { success: false, errors: ['No fetch plan provided'] },
        { status: 400 }
      );
    }

    console.log(`Fetching scoped data for plans: ${plan.map(p => p.kind).join(', ')}`);

    // Fetch scoped data from Prokerala
    const patch = await fetchScopedData(profile, plan, lang);

    console.log(`Fetch completed. Provenance: ${patch.provenance?.prokerala.join(', ')}`);

    const response: FetchResponse = {
      success: true,
      patch
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Fetch API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'],
        patch: { set: {}, provenance: { prokerala: [] } }
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
