// lib/middleware/rateLimit.ts
// Rate limiting middleware for API routes

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiterService } from '../services/rateLimiter';
import { logger } from '../services/logger';

export interface RateLimitMiddlewareOptions {
  limitName: string;
  customKey?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const requestId = req.headers.get('x-request-id') || 
      Math.random().toString(36).substring(2, 15);

    try {
      const result = await rateLimiterService.checkLimit(
        options.limitName,
        req,
        options.customKey?.(req)
      );

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          limitName: options.limitName,
          requestId,
          retryAfter: result.retryAfter,
        });

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: result.retryAfter,
            resetTime: result.resetTime,
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': '100', // You might want to make this dynamic
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await next();
      
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    } catch (error) {
      logger.error('Rate limit middleware error', {
        limitName: options.limitName,
        requestId,
        error,
      });

      // Fail open - allow request if rate limiting fails
      return next();
    }
  };
}

// Pre-configured rate limit middlewares
export const rateLimitMiddlewares = {
  // General API rate limiting
  api: createRateLimitMiddleware({
    limitName: 'api',
  }),

  // Astrology API rate limiting
  astrology: createRateLimitMiddleware({
    limitName: 'astrology',
    customKey: (req) => {
      // Rate limit by user ID if available, otherwise by IP
      const userId = req.headers.get('x-user-id');
      return userId ? `user:${userId}` : undefined;
    },
  }),

  // Authentication rate limiting
  auth: createRateLimitMiddleware({
    limitName: 'auth',
  }),

  // Payment rate limiting
  payment: createRateLimitMiddleware({
    limitName: 'payment',
    customKey: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `user:${userId}` : undefined;
    },
  }),

  // Chat rate limiting
  chat: createRateLimitMiddleware({
    limitName: 'chat',
    customKey: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `user:${userId}` : undefined;
    },
  }),
} as const;
