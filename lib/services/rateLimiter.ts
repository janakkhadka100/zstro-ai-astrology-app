// lib/services/rateLimiter.ts
// Rate limiting service for API endpoints and user actions

import { NextRequest } from 'next/server';
import { cacheService } from './cache';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiterService {
  private configs = new Map<string, RateLimitConfig>();

  /**
   * Register a rate limit configuration
   */
  registerConfig(name: string, config: RateLimitConfig): void {
    this.configs.set(name, config);
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    name: string,
    req: NextRequest,
    customKey?: string
  ): Promise<RateLimitResult> {
    const config = this.configs.get(name);
    if (!config) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    const key = customKey || this.generateKey(name, req, config);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Get current request count
      const requestData = await cacheService.get<{
        count: number;
        resetTime: number;
      }>(key) || { count: 0, resetTime: now + config.windowMs };

      // Reset if window has expired
      if (now > requestData.resetTime) {
        requestData.count = 0;
        requestData.resetTime = now + config.windowMs;
      }

      // Check if limit exceeded
      if (requestData.count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: requestData.resetTime,
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
        };
      }

      // Increment counter
      requestData.count++;
      await cacheService.set(key, requestData, {
        ttl: Math.ceil(config.windowMs / 1000),
        namespace: 'rateLimit',
      });

      return {
        allowed: true,
        remaining: config.maxRequests - requestData.count,
        resetTime: requestData.resetTime,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: now + config.windowMs,
      };
    }
  }

  /**
   * Generate cache key for rate limiting
   */
  private generateKey(name: string, req: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    // Default key generation based on IP and user agent
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const key = `${name}:${ip}:${this.hashString(userAgent)}`;
    
    return key;
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return req.ip || 'unknown';
  }

  /**
   * Hash string for consistent key generation
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetLimit(name: string, key: string): Promise<boolean> {
    try {
      return await cacheService.delete(key, 'rateLimit');
    } catch (error) {
      console.error('Rate limit reset error:', error);
      return false;
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(name: string, key: string): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
  } | null> {
    try {
      const config = this.configs.get(name);
      if (!config) return null;

      const requestData = await cacheService.get<{
        count: number;
        resetTime: number;
      }>(key);

      if (!requestData) return null;

      return {
        count: requestData.count,
        remaining: Math.max(0, config.maxRequests - requestData.count),
        resetTime: requestData.resetTime,
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return null;
    }
  }
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Astrology API - more restrictive
  astrology: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // Payment endpoints
  payment: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
  },
  
  // Chat messages
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
} as const;

export const rateLimiterService = new RateLimiterService();

// Register default configurations
Object.entries(RateLimitConfigs).forEach(([name, config]) => {
  rateLimiterService.registerConfig(name, config);
});

export default rateLimiterService;
