// lib/security/middleware.ts
// Security middleware for API routes

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimiter } from './rate-limiter';
import { createSecureResponse, applySecurityHeaders } from './headers';
import { sanitizeString } from './validators';

interface SecurityConfig {
  rateLimit?: {
    action: string;
    customConfig?: any;
  };
  validation?: {
    schema: z.ZodSchema;
    body?: boolean;
    query?: boolean;
  };
  sanitize?: {
    fields?: string[];
  };
}

// Security middleware factory
export function createSecurityMiddleware(config: SecurityConfig) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Rate limiting
      if (config.rateLimit) {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userId = (req as any).user?.id || 'anonymous';
        const identifier = `${ip}:${userId}`;
        
        const rateLimitResult = await rateLimiter.checkLimit(
          identifier,
          config.rateLimit.action,
          config.rateLimit.customConfig
        );
        
        if (!rateLimitResult.allowed) {
          return createSecureResponse(
            {
              error: 'Too Many Requests',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: rateLimitResult.retryAfter
            },
            429,
            {
              headers: {
                'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
              }
            }
          );
        }
      }
      
      // Input validation
      if (config.validation) {
        const validationResult = await validateRequest(req, config.validation);
        if (!validationResult.valid) {
          return createSecureResponse(
            {
              error: 'Validation Error',
              message: 'Invalid request data',
              details: validationResult.errors
            },
            400
          );
        }
      }
      
      // Input sanitization
      if (config.sanitize) {
        await sanitizeRequest(req, config.sanitize);
      }
      
      // Continue to next middleware/handler
      return NextResponse.next();
      
    } catch (error) {
      console.error('Security middleware error:', error);
      return createSecureResponse(
        {
          error: 'Internal Server Error',
          message: 'Security check failed'
        },
        500
      );
    }
  };
}

// Validate request data
async function validateRequest(
  req: NextRequest,
  config: { schema: z.ZodSchema; body?: boolean; query?: boolean }
): Promise<{ valid: boolean; errors?: any }> {
  try {
    let data: any = {};
    
    if (config.body) {
      const body = await req.json();
      data = { ...data, ...body };
    }
    
    if (config.query) {
      const url = new URL(req.url);
      const queryParams: any = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      data = { ...data, ...queryParams };
    }
    
    const result = config.schema.safeParse(data);
    
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      errors: ['Invalid request format']
    };
  }
}

// Sanitize request data
async function sanitizeRequest(
  req: NextRequest,
  config: { fields?: string[] }
): Promise<void> {
  try {
    if (config.fields) {
      const body = await req.json();
      
      config.fields.forEach(field => {
        if (body[field] && typeof body[field] === 'string') {
          body[field] = sanitizeString(body[field]);
        }
      });
      
      // Note: In a real implementation, you'd need to modify the request
      // This is a simplified version
    }
  } catch (error) {
    console.error('Sanitization error:', error);
  }
}

// Common security configurations
export const SECURITY_CONFIGS = {
  // Astrology API
  astrology: {
    rateLimit: { action: 'api.astrology' },
    validation: {
      schema: z.object({
        question: z.string().min(1).max(1000),
        lang: z.enum(['ne', 'en']),
        includeCharts: z.boolean().optional(),
        includeSnapshots: z.boolean().optional()
      }),
      body: true
    },
    sanitize: {
      fields: ['question']
    }
  },
  
  // File upload
  upload: {
    rateLimit: { action: 'api.upload' },
    validation: {
      schema: z.object({
        category: z.enum(['chin', 'palm', 'document']),
        metadata: z.record(z.any()).optional()
      }),
      body: true
    }
  },
  
  // Export
  export: {
    rateLimit: { action: 'api.export' },
    validation: {
      schema: z.object({
        analysis: z.string().min(1).max(50000),
        cards: z.record(z.any()),
        title: z.string().max(200).optional(),
        lang: z.enum(['ne', 'en']),
        includeCharts: z.boolean().optional(),
        includeSnapshots: z.boolean().optional()
      }),
      body: true
    },
    sanitize: {
      fields: ['analysis', 'title']
    }
  },
  
  // History
  history: {
    rateLimit: { action: 'user.history' },
    validation: {
      schema: z.object({
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        includeStats: z.boolean().optional()
      }),
      query: true
    }
  },
  
  // Bootstrap
  bootstrap: {
    rateLimit: { action: 'api.bootstrap' },
    validation: {
      schema: z.object({
        profile: z.object({
          birthDate: z.string(),
          birthTime: z.string(),
          birthPlace: z.object({
            name: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            timezone: z.object({
              id: z.string(),
              offset: z.number()
            })
          }),
          timezone: z.object({
            id: z.string(),
            offset: z.number()
          })
        }),
        lang: z.enum(['ne', 'en'])
      }),
      body: true
    }
  },
  
  // Fetch
  fetch: {
    rateLimit: { action: 'api.fetch' },
    validation: {
      schema: z.object({
        profile: z.object({
          birthDate: z.string(),
          birthTime: z.string(),
          birthPlace: z.object({
            name: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            timezone: z.object({
              id: z.string(),
              offset: z.number()
            })
          }),
          timezone: z.object({
            id: z.string(),
            offset: z.number()
          })
        }),
        plan: z.array(z.object({
          kind: z.string(),
          levels: z.array(z.number()).optional(),
          list: z.array(z.string()).optional(),
          detail: z.boolean().optional()
        })),
        lang: z.enum(['ne', 'en'])
      }),
      body: true
    }
  }
} as const;

// Apply security to response
export function secureResponse(
  response: NextResponse,
  config?: {
    rateLimit?: { limit: number; remaining: number; resetTime: number };
    cache?: 'no-cache' | 'private' | 'public-short' | 'public-medium' | 'public-long' | 'immutable';
  }
): NextResponse {
  // Apply security headers
  applySecurityHeaders(response);
  
  // Apply rate limit headers
  if (config?.rateLimit) {
    response.headers.set('X-RateLimit-Limit', config.rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', config.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(config.rateLimit.resetTime).toISOString());
  }
  
  // Apply cache headers
  if (config?.cache) {
    const cacheHeaders = {
      'no-cache': 'no-cache, no-store, must-revalidate',
      'private': 'private, max-age=0, must-revalidate',
      'public-short': 'public, max-age=300',
      'public-medium': 'public, max-age=1800',
      'public-long': 'public, max-age=3600',
      'immutable': 'public, max-age=31536000, immutable'
    };
    response.headers.set('Cache-Control', cacheHeaders[config.cache]);
  }
  
  return response;
}
