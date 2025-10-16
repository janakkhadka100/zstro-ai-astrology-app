// app/api/healthz/route.ts
// Simple health check endpoint for monitoring and load balancers

import { NextRequest, NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET(req: NextRequest) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Date.now() - startTime,
    environment: process.env.NODE_ENV || 'development',
    vercelEnv: process.env.VERCEL_ENV || 'local',
    services: {
      api: { status: 'up', lastCheck: new Date().toISOString() },
    },
    metrics: {
      memory: process.memoryUsage ? {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      } : null,
    },
  };

  return NextResponse.json(healthCheck, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': 'healthy',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}

// Liveness probe - simple check
export async function HEAD(req: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}