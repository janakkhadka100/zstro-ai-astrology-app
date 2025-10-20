// lib/security/rate-limiter.ts
// Rate limiting implementation with Redis

import { Redis } from 'ioredis';
import { RateLimitInput } from './validators';

// Create Redis connection only if REDIS_URL is available (for Vercel deployment)
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch (error) {
    console.warn('Redis connection failed, rate limiting disabled:', error);
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  'api.astrology': { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
  'api.bootstrap': { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 requests per 5 minutes
  'api.fetch': { windowMs: 10 * 60 * 1000, maxRequests: 30 }, // 30 requests per 10 minutes
  'api.export': { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 exports per hour
  'api.upload': { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
  
  // User actions
  'user.chat': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 messages per minute
  'user.analysis': { windowMs: 5 * 60 * 1000, maxRequests: 3 }, // 3 analyses per 5 minutes
  'user.history': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 history requests per minute
  
  // Authentication
  'auth.login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 login attempts per 15 minutes
  'auth.register': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrations per hour
  'auth.password-reset': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 password resets per hour
  
  // Global limits
  'global.ip': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute per IP
  'global.user': { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests per minute per user
} as const;

export class RateLimiter {
  private redis: Redis | null;
  private configs: Map<string, RateLimitConfig>;

  constructor(redisClient?: Redis | null) {
    this.redis = redisClient !== undefined ? redisClient : redis;
    this.configs = new Map();
    
    // Initialize default configurations
    Object.entries(RATE_LIMITS).forEach(([key, config]) => {
      this.configs.set(key, config);
    });
  }

  // Add or update a rate limit configuration
  setConfig(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }

  // Get rate limit configuration
  getConfig(key: string): RateLimitConfig | undefined {
    return this.configs.get(key);
  }

  // Check if request is allowed
  async checkLimit(
    identifier: string,
    action: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const configKey = `${action}`;
    const config = customConfig ? { ...this.configs.get(configKey), ...customConfig } : this.configs.get(configKey);
    
    if (!config) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000
      };
    }

    const key = `rate_limit:${configKey}:${identifier}`;
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // If Redis is not available, allow all requests
      if (!this.redis) {
        return {
          allowed: true,
          remaining: Infinity,
          resetTime: Date.now() + 60000
        };
      }

      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results || results.some(result => result[0] !== null)) {
        throw new Error('Redis pipeline execution failed');
      }

      const currentCount = results[1][1] as number;
      const allowed = currentCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = now + windowMs;

      return {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000)
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000
      };
    }
  }

  // Check multiple limits
  async checkMultipleLimits(
    identifier: string,
    actions: string[],
    customConfigs?: Record<string, Partial<RateLimitConfig>>
  ): Promise<Record<string, RateLimitResult>> {
    const results: Record<string, RateLimitResult> = {};
    
    await Promise.all(
      actions.map(async (action) => {
        results[action] = await this.checkLimit(
          identifier,
          action,
          customConfigs?.[action]
        );
      })
    );
    
    return results;
  }

  // Reset rate limit for an identifier
  async resetLimit(identifier: string, action: string): Promise<void> {
    if (!this.redis) return;
    
    const configKey = `${action}`;
    const key = `rate_limit:${configKey}:${identifier}`;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  // Get current rate limit status
  async getStatus(identifier: string, action: string): Promise<RateLimitResult> {
    const configKey = `${action}`;
    const config = this.configs.get(configKey);
    
    if (!config) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000
      };
    }

    const key = `rate_limit:${configKey}:${identifier}`;
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // If Redis is not available, return unlimited status
      if (!this.redis) {
        return {
          allowed: true,
          remaining: Infinity,
          resetTime: Date.now() + 60000
        };
      }

      // Remove expired entries and count current
      await this.redis.zremrangebyscore(key, 0, windowStart);
      const currentCount = await this.redis.zcard(key);
      
      const allowed = currentCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = now + windowMs;

      return {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000)
      };

    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000
      };
    }
  }

  // Cleanup expired rate limit entries
  async cleanup(): Promise<number> {
    if (!this.redis) return 0;
    
    try {
      const pattern = 'rate_limit:*';
      const keys = await this.redis.keys(pattern);
      let cleaned = 0;

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key has no expiration, set one
          await this.redis.expire(key, 3600); // 1 hour
          cleaned++;
        }
      }

      return cleaned;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Helper function for middleware
export async function checkRateLimit(
  req: any,
  action: string,
  identifier?: string
): Promise<RateLimitResult> {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userId = req.user?.id || 'anonymous';
  const id = identifier || `${ip}:${userId}`;
  
  return await rateLimiter.checkLimit(id, action);
}

// Middleware factory
export function createRateLimitMiddleware(action: string, customConfig?: Partial<RateLimitConfig>) {
  return async (req: any, res: any, next: any) => {
    try {
      const result = await checkRateLimit(req, action);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': RATE_LIMITS[action as keyof typeof RATE_LIMITS]?.maxRequests || 100,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (!result.allowed) {
        res.set('Retry-After', result.retryAfter?.toString());
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open
    }
  };
}
