// app/api/astro/fetch/route.ts
// Fetch API - on-demand data from Prokerala

import { NextRequest, NextResponse } from 'next/server';
import { FetchRequest, FetchResponse } from '@/lib/astrology/types';
import { fetchScopedData } from '@/lib/source/prokerala';
import { cacheProkeralaData, getCachedProkeralaData, generateProfileHash } from '@/lib/perf/cache';
import { isFeatureEnabled } from '@/lib/config/features';

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

    // Generate profile hash for caching
    const profileHash = generateProfileHash(profile);
    
    // Check cache for each scope if caching is enabled
    const cachedPatches: any[] = [];
    const uncachedPlans: any[] = [];
    
    if (isFeatureEnabled('skeletons')) {
      for (const planItem of plan) {
        const scopeKey = `${planItem.kind}${planItem.levels ? '.' + planItem.levels.join('.') : ''}${planItem.list ? '.' + planItem.list.join('.') : ''}${planItem.detail ? '.detail' : ''}`;
        const cachedData = await getCachedProkeralaData(scopeKey, profileHash);
        
        if (cachedData) {
          console.log(`Cache hit for scope: ${scopeKey}`);
          cachedPatches.push(cachedData);
        } else {
          uncachedPlans.push(planItem);
        }
      }
    } else {
      uncachedPlans.push(...plan);
    }

    // Fetch uncached data from Prokerala
    let freshPatch = { set: {}, provenance: { prokerala: [] } };
    if (uncachedPlans.length > 0) {
      freshPatch = await fetchScopedData(profile, uncachedPlans, lang);
      
      // Cache the fresh data
      if (isFeatureEnabled('skeletons')) {
        for (const planItem of uncachedPlans) {
          const scopeKey = `${planItem.kind}${planItem.levels ? '.' + planItem.levels.join('.') : ''}${planItem.list ? '.' + planItem.list.join('.') : ''}${planItem.detail ? '.detail' : ''}`;
          await cacheProkeralaData(scopeKey, profileHash, freshPatch);
          console.log(`Cached data for scope: ${scopeKey}`);
        }
      }
    }

    // Merge cached and fresh data
    const mergedPatch = {
      set: {
        ...cachedPatches.reduce((acc, patch) => ({ ...acc, ...patch.set }), {}),
        ...freshPatch.set
      },
      provenance: {
        prokerala: [
          ...cachedPatches.flatMap(p => p.provenance?.prokerala || []),
          ...(freshPatch.provenance?.prokerala || [])
        ]
      }
    };

    console.log(`Fetch completed. Provenance: ${mergedPatch.provenance?.prokerala.join(', ')}`);

    const response: FetchResponse = {
      success: true,
      patch: mergedPatch
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900', // 15 minutes
        'X-Cache': cachedPatches.length > 0 ? 'PARTIAL' : 'MISS'
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
