// app/api/healthz/route.ts
// Health check endpoint for monitoring and load balancers

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enhancedCache } from '@/lib/services/enhanced-cache';
import { logger } from '@/lib/services/logger';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    api: ServiceStatus;
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cache: {
      memory: {
        size: number;
        hitRate: number;
      };
      redis: {
        connected: boolean;
        hitRate: number;
      };
    };
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

const startTime = Date.now();

export async function GET(req: NextRequest) {
  const start = Date.now();
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Date.now() - startTime,
    services: {
      database: { status: 'down', lastCheck: new Date().toISOString() },
      cache: { status: 'down', lastCheck: new Date().toISOString() },
      api: { status: 'up', lastCheck: new Date().toISOString() },
    },
    metrics: {
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      cache: {
        memory: {
          size: 0,
          hitRate: 0,
        },
        redis: {
          connected: false,
          hitRate: 0,
        },
      },
    },
  };

  try {
    // Check database connectivity
    const dbStart = Date.now();
    try {
      await db.execute('SELECT 1');
      healthCheck.services.database = {
        status: 'up',
        responseTime: Date.now() - dbStart,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      healthCheck.services.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toISOString(),
      };
      healthCheck.status = 'degraded';
    }

    // Check cache connectivity
    const cacheStart = Date.now();
    try {
      const cacheStats = enhancedCache.getStats();
      healthCheck.services.cache = {
        status: cacheStats.redis.connected ? 'up' : 'degraded',
        responseTime: Date.now() - cacheStart,
        lastCheck: new Date().toISOString(),
      };
      healthCheck.metrics.cache = cacheStats;
    } catch (error) {
      healthCheck.services.cache = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toISOString(),
      };
      healthCheck.status = 'degraded';
    }

    // Get memory usage
    if (process.memoryUsage) {
      const memUsage = process.memoryUsage();
      healthCheck.metrics.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      };
    }

    // Determine overall status
    const serviceStatuses = Object.values(healthCheck.services);
    const downServices = serviceStatuses.filter(s => s.status === 'down');
    const degradedServices = serviceStatuses.filter(s => s.status === 'degraded');

    if (downServices.length > 0) {
      healthCheck.status = 'unhealthy';
    } else if (degradedServices.length > 0) {
      healthCheck.status = 'degraded';
    }

    // Log health check
    logger.info('Health check completed', {
      status: healthCheck.status,
      responseTime: Date.now() - start,
      services: healthCheck.services,
    });

    // Return appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': healthCheck.status,
        'X-Response-Time': `${Date.now() - start}ms`,
      },
    });

  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : String(error) });
    
    healthCheck.status = 'unhealthy';
    healthCheck.services.api = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString(),
    };

    return NextResponse.json(healthCheck, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy',
      },
    });
  }
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
