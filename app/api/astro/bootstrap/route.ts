// app/api/astro/bootstrap/route.ts
// Bootstrap API - hydrate cards from AccountCard (no external calls)

import { NextResponse } from 'next/server';
import { composeAstroData, ProkeralaParams } from '@/lib/cards/compose';

// @ts-ignore
export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: any = {};
  try { 
    body = await req.json(); 
  } catch (e) {
    console.warn('Failed to parse request body:', e);
  }
  
  // Session fallback (simplified for now)
  const prof = body?.dob ? body : {};

  // Validate required parameters
  if (!prof?.dob || !prof?.tob || prof?.lat == null || prof?.lon == null || !prof?.tz) {
    console.log('Missing profile data:', { received: prof, body });
    return NextResponse.json(
      { 
        error: "missing_profile", 
        hint: "dob/tob/lat/lon/tz required", 
        received: prof ?? null 
      },
      { status: 400 }
    );
  }

  try {
    const data = await composeAstroData(
      { 
        dob: prof.dob, 
        tob: prof.tob, 
        lat: Number(prof.lat), 
        lon: Number(prof.lon), 
        tz: String(prof.tz), 
        pob: prof.pob 
      },
      body?.lang ?? "ne"
    );
    
    console.log(`Bootstrap successful: D1(${data.d1.length}), Yogas(${data.yogas.length}), Dashas(${data.dashas.length})`);
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('Bootstrap failed:', e);
    // Never leak secrets
    return NextResponse.json({ error: "bootstrap_failed" }, { status: 500 });
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
