// app/api/astro/bootstrap/route.ts
// Bootstrap API - hydrate cards from AccountCard (no external calls)

import { NextRequest, NextResponse } from 'next/server';
import { BootstrapRequest, BootstrapResponse } from '@/lib/astrology/types';
import { getAccountCard, mapAccountToAstroData , validateAccountCard } from '@/lib/source/account';
import { composeAstroData } from '@/lib/cards/compose';
import { cacheBootstrapData, getCachedBootstrapData } from '@/lib/perf/cache';
import { isFeatureEnabled } from '@/lib/config/features';
import { createSecurityMiddleware, SECURITY_CONFIGS, secureResponse } from '@/lib/security/middleware';
import { ProfileSchema } from '@/lib/security/validators';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware(SECURITY_CONFIGS.bootstrap);
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    const body = await req.json() as BootstrapRequest;
    const { lang } = body;
    
    // Validate request
    if (!lang || !['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }

    // Get user ID from session/auth (mock for now)
    const userId = "test-user-123"; // In real app, get from auth session
    
    // Check cache first if caching is enabled
    if (isFeatureEnabled('skeletons')) {
      const cachedData = await getCachedBootstrapData(userId, lang);
      if (cachedData) {
        console.log(`Bootstrap cache hit for user ${userId}, language: ${lang}`);
        return NextResponse.json(
          { success: true, data: cachedData },
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=1800', // 30 minutes
              'X-Cache': 'HIT'
            }
          }
        );
      }
    }
    
    // Get account card
    const account = getAccountCard(userId);
    if (!account) {
      return NextResponse.json(
        { success: false, errors: ['Account not found'] },
        { status: 404 }
      );
    }

    // Validate account card
    const validation = validateAccountCard(account);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Map account to astro data
    const baseAstroData = mapAccountToAstroData(account, lang);
    
    // Compose full astro data with derived analysis
    const astroData = composeAstroData(baseAstroData, lang);
    
    // Cache the result if caching is enabled
    if (isFeatureEnabled('skeletons')) {
      await cacheBootstrapData(userId, lang, astroData);
      console.log(`Bootstrap data cached for user ${userId}, language: ${lang}`);
    }

    console.log(`Bootstrap successful for user ${userId}, language: ${lang}`);
    console.log(`Data coverage: D1(${astroData.d1.length}), Yogas(${astroData.yogas.length}), Dashas(${astroData.dashas.length})`);

    const response: BootstrapResponse = {
      success: true,
      data: astroData
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'public-medium'
    });

  } catch (error) {
    console.error('Bootstrap API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
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
