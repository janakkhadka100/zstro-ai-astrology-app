// app/api/configz/route.ts
// Configuration debug endpoint (development only)

import { NextRequest, NextResponse } from 'next/server';
import { getEnvironment, getBaseUrl } from '@/lib/utils/url';

export async function GET(req: NextRequest) {
  // Only allow in development and preview
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const environment = getEnvironment();
  const baseUrl = getBaseUrl();
  
  const config = {
    environment,
    baseUrl,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
    features: {
      pwa: process.env.FF_PWA === 'true',
      stripe: process.env.FF_STRIPE === 'true',
      i18n: process.env.FF_I18N === 'true',
      analytics: process.env.FF_ANALYTICS === 'true',
    },
    services: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasPokhrel: !!process.env.PROKERALA_API_KEY,
      hasDatabase: !!process.env.DATABASE_URL,
      hasRedis: !!process.env.REDIS_URL,
      hasNextAuth: !!process.env.NEXTAUTH_SECRET,
    },
    // Don't expose actual secrets, just indicate presence
    secrets: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasPIIEncKey: !!process.env.PII_ENC_KEY,
    }
  };

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
