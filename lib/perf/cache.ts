// lib/perf/cache.ts
// Redis-based caching for performance optimization

import Redis from 'ioredis';
import { createHash } from 'crypto';

// Create Redis client only if REDIS_URL is available (for Vercel deployment)
let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch (error) {
    console.warn('Redis connection failed, caching disabled:', error);
  }
}

// Cache configuration
const CACHE_TTL = {
  BOOTSTRAP: parseInt(process.env.CACHE_TTL_BOOTSTRAP || '1800'), // 30 minutes
  PROKERALA: parseInt(process.env.CACHE_TTL_PROKERALA || '900'),   // 15 minutes
  ANALYSIS: parseInt(process.env.CACHE_TTL_ANALYSIS || '3600'),    // 1 hour
  USER_SESSION: 7200, // 2 hours
} as const;

// Cache key generators
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  const key = [prefix, ...parts].join(':');
  return createHash('md5').update(key).digest('hex');
}

// Bootstrap cache keys
export function getBootstrapCacheKey(userId: string, lang: string): string {
  return generateCacheKey('bootstrap', userId, lang);
}

// Prokerala cache keys
export function getProkeralaCacheKey(scope: string, profileHash: string): string {
  return generateCacheKey('prokerala', scope, profileHash);
}

// Analysis cache keys
export function getAnalysisCacheKey(questionHash: string, cardsHash: string): string {
  return generateCacheKey('analysis', questionHash, cardsHash);
}

// User session cache keys
export function getUserSessionCacheKey(userId: string): string {
  return generateCacheKey('session', userId);
}

// Generic cache operations
export class CacheService {
  private redis: Redis | null;

  constructor() {
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redis) return keys.map(() => null);
    
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttl: number = 3600): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const pipeline = this.redis.pipeline();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Cache with fallback function
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const fresh = await fallback();
      await this.set(key, fresh, ttl);
      return fresh;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      // Fallback to direct execution if cache fails
      return await fallback();
    }
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.redis.del(...keys);
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Singleton cache service
export const cache = new CacheService();

// Specialized cache functions for astrology data
export async function cacheBootstrapData(
  userId: string,
  lang: string,
  data: any
): Promise<boolean> {
  const key = getBootstrapCacheKey(userId, lang);
  return await cache.set(key, data, CACHE_TTL.BOOTSTRAP);
}

export async function getCachedBootstrapData(
  userId: string,
  lang: string
): Promise<any | null> {
  const key = getBootstrapCacheKey(userId, lang);
  return await cache.get(key);
}

export async function cacheProkeralaData(
  scope: string,
  profileHash: string,
  data: any
): Promise<boolean> {
  const key = getProkeralaCacheKey(scope, profileHash);
  return await cache.set(key, data, CACHE_TTL.PROKERALA);
}

export async function getCachedProkeralaData(
  scope: string,
  profileHash: string
): Promise<any | null> {
  const key = getProkeralaCacheKey(scope, profileHash);
  return await cache.get(key);
}

export async function cacheAnalysis(
  questionHash: string,
  cardsHash: string,
  analysis: any
): Promise<boolean> {
  const key = getAnalysisCacheKey(questionHash, cardsHash);
  return await cache.set(key, analysis, CACHE_TTL.ANALYSIS);
}

export async function getCachedAnalysis(
  questionHash: string,
  cardsHash: string
): Promise<any | null> {
  const key = getAnalysisCacheKey(questionHash, cardsHash);
  return await cache.get(key);
}

// Profile hash generation for caching
export function generateProfileHash(profile: any): string {
  const profileString = JSON.stringify({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    tz: profile.tz,
    lat: profile.lat,
    lon: profile.lon,
  });
  return createHash('md5').update(profileString).digest('hex');
}

// Question hash generation for caching
export function generateQuestionHash(question: string, lang: string): string {
  const questionString = `${question}:${lang}`;
  return createHash('md5').update(questionString).digest('hex');
}

// Cards hash generation for caching
export function generateCardsHash(cards: any): string {
  const cardsString = JSON.stringify(cards);
  return createHash('md5').update(cardsString).digest('hex');
}

// Cache warming functions
export async function warmBootstrapCache(userId: string, lang: string): Promise<void> {
  // This would be called during user login to pre-warm the cache
  console.log(`Warming bootstrap cache for user ${userId} in ${lang}`);
}

export async function warmProkeralaCache(
  scope: string,
  profile: any
): Promise<void> {
  // This would be called to pre-warm commonly used Prokerala data
  console.log(`Warming Prokerala cache for scope ${scope}`);
}

// Cache statistics
export async function getCacheStats(): Promise<{
  memory: string;
  keys: number;
  hits: number;
  misses: number;
}> {
  if (!redis) {
    return {
      memory: 'Redis not available',
      keys: 0,
      hits: 0,
      misses: 0,
    };
  }
  
  try {
    const info = await redis.info('memory');
    const keyspace = await redis.info('keyspace');
    const stats = await redis.info('stats');
    
    return {
      memory: info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'Unknown',
      keys: parseInt(keyspace.match(/keys=(\d+)/)?.[1] || '0'),
      hits: parseInt(stats.match(/keyspace_hits:(\d+)/)?.[1] || '0'),
      misses: parseInt(stats.match(/keyspace_misses:(\d+)/)?.[1] || '0'),
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      memory: 'Unknown',
      keys: 0,
      hits: 0,
      misses: 0,
    };
  }
}
