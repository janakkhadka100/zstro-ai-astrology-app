// lib/services/enhanced-cache.ts
// Multi-level caching service with Redis + Memory + CDN

import { Redis } from 'ioredis';
import { logger } from './logger';

// Create Redis connection only if REDIS_URL is available (for Vercel deployment)
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch (error) {
    console.warn('Redis connection failed, enhanced caching disabled:', error);
  }
}

export interface CacheConfig {
  redis: {
    url: string;
    keyPrefix: string;
    defaultTTL: number;
  };
  memory: {
    maxSize: number;
    defaultTTL: number;
  };
  cdn: {
    enabled: boolean;
    defaultTTL: number;
  };
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface CacheStats {
  memory: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  redis: {
    connected: boolean;
    hits: number;
    misses: number;
    hitRate: number;
  };
  cdn: {
    enabled: boolean;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

class EnhancedCacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats = {
    memory: { size: 0, hits: 0, misses: 0, hitRate: 0 },
    redis: { connected: false, hits: 0, misses: 0, hitRate: 0 },
    cdn: { enabled: false, hits: 0, misses: 0, hitRate: 0 },
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.initializeRedis();
    this.startCleanupInterval();
  }

  private async initializeRedis() {
    try {
      this.redis = new Redis(this.config.redis.url, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keyPrefix: this.config.redis.keyPrefix,
      });

      this.redis.on('connect', () => {
        this.stats.redis.connected = true;
        logger.info('Redis connected');
      });

      this.redis.on('error', (error) => {
        this.stats.redis.connected = false;
        logger.error('Redis error:', error);
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Cleanup every minute
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    this.stats.memory.size = this.memoryCache.size;
    
    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired memory cache entries`);
    }
  }

  private generateCacheKey(namespace: string, key: string, version?: string): string {
    const versionStr = version ? `:v${version}` : '';
    return `${namespace}:${key}${versionStr}`;
  }

  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  async get<T>(namespace: string, key: string, version?: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey(namespace, key, version);

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry) {
      const now = Date.now();
      if (now - memoryEntry.timestamp < memoryEntry.ttl * 1000) {
        this.stats.memory.hits++;
        this.stats.memory.hitRate = this.calculateHitRate(
          this.stats.memory.hits,
          this.stats.memory.misses
        );
        logger.debug(`Memory cache hit: ${cacheKey}`);
        return memoryEntry.data as T;
      } else {
        this.memoryCache.delete(cacheKey);
      }
    } else {
      this.stats.memory.misses++;
    }

    // Try Redis cache
    if (this.redis && this.stats.redis.connected) {
      try {
        const redisData = await this.redis.get(cacheKey);
        if (redisData) {
          const entry: CacheEntry<T> = JSON.parse(redisData);
          const now = Date.now();
          
          if (now - entry.timestamp < entry.ttl * 1000) {
            // Store in memory cache for faster access
            this.memoryCache.set(cacheKey, entry);
            this.stats.redis.hits++;
            this.stats.redis.hitRate = this.calculateHitRate(
              this.stats.redis.hits,
              this.stats.redis.misses
            );
            logger.debug(`Redis cache hit: ${cacheKey}`);
            return entry.data;
          } else {
            await this.redis.del(cacheKey);
          }
        } else {
          this.stats.redis.misses++;
        }
      } catch (error) {
        logger.error('Redis get error:', error);
        this.stats.redis.misses++;
      }
    }

    return null;
  }

  async set<T>(
    namespace: string,
    key: string,
    data: T,
    ttl?: number,
    version?: string
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey(namespace, key, version);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.memory.defaultTTL,
      version: version || '1.0',
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry);
    this.stats.memory.size = this.memoryCache.size;

    // Store in Redis cache
    if (this.redis && this.stats.redis.connected) {
      try {
        const redisTTL = ttl || this.config.redis.defaultTTL;
        await this.redis.setex(cacheKey, redisTTL, JSON.stringify(entry));
        logger.debug(`Cached in Redis: ${cacheKey} (TTL: ${redisTTL}s)`);
      } catch (error) {
        logger.error('Redis set error:', error);
        return false;
      }
    }

    return true;
  }

  async delete(namespace: string, key: string, version?: string): Promise<boolean> {
    const cacheKey = this.generateCacheKey(namespace, key, version);

    // Remove from memory cache
    this.memoryCache.delete(cacheKey);
    this.stats.memory.size = this.memoryCache.size;

    // Remove from Redis cache
    if (this.redis && this.stats.redis.connected) {
      try {
        await this.redis.del(cacheKey);
        logger.debug(`Deleted from Redis: ${cacheKey}`);
      } catch (error) {
        logger.error('Redis delete error:', error);
        return false;
      }
    }

    return true;
  }

  async invalidatePattern(namespace: string, pattern: string): Promise<number> {
    let deletedCount = 0;

    // Clear memory cache entries matching pattern
    const memoryPattern = new RegExp(`^${namespace}:${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.memoryCache.keys()) {
      if (memoryPattern.test(key)) {
        this.memoryCache.delete(key);
        deletedCount++;
      }
    }
    this.stats.memory.size = this.memoryCache.size;

    // Clear Redis cache entries matching pattern
    if (this.redis && this.stats.redis.connected) {
      try {
        const redisPattern = `${this.config.redis.keyPrefix}${namespace}:${pattern}`;
        const keys = await this.redis.keys(redisPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deletedCount += keys.length;
        }
        logger.debug(`Invalidated Redis pattern: ${redisPattern} (${keys.length} keys)`);
      } catch (error) {
        logger.error('Redis pattern invalidation error:', error);
      }
    }

    return deletedCount;
  }

  async getOrSet<T>(
    namespace: string,
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
    version?: string
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(namespace, key, version);
    if (cached !== null) {
      return cached;
    }

    // Generate new data
    const data = await factory();
    
    // Store in cache
    await this.set(namespace, key, data, ttl, version);
    
    return data;
  }

  async warmCache<T>(
    namespace: string,
    items: Array<{ key: string; factory: () => Promise<T>; ttl?: number }>
  ): Promise<void> {
    const promises = items.map(({ key, factory, ttl }) =>
      this.getOrSet(namespace, key, factory, ttl)
    );

    await Promise.all(promises);
    logger.info(`Warmed cache for namespace: ${namespace} (${items.length} items)`);
  }

  getStats(): CacheStats {
    return {
      memory: {
        ...this.stats.memory,
        hitRate: this.calculateHitRate(this.stats.memory.hits, this.stats.memory.misses),
      },
      redis: {
        ...this.stats.redis,
        hitRate: this.calculateHitRate(this.stats.redis.hits, this.stats.redis.misses),
      },
      cdn: {
        ...this.stats.cdn,
        hitRate: this.calculateHitRate(this.stats.cdn.hits, this.stats.cdn.misses),
      },
    };
  }

  async clearAll(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.stats.memory.size = 0;

    // Clear Redis cache
    if (this.redis && this.stats.redis.connected) {
      try {
        const pattern = `${this.config.redis.keyPrefix}*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        logger.info(`Cleared all Redis cache (${keys.length} keys)`);
      } catch (error) {
        logger.error('Redis clear all error:', error);
      }
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.stats.redis.connected = false;
    }
  }
}

// Cache namespaces
export const CacheNamespaces = {
  ASTRO: 'astro',
  GEOCODING: 'geocoding',
  USER: 'user',
  API: 'api',
  STATIC: 'static',
} as const;

// Cache versions
export const CacheVersions = {
  ASTRO: 'v1.0.0',
  GEOCODING: 'v1.0.0',
  USER: 'v1.0.0',
  API: 'v1.0.0',
} as const;

// Initialize cache service
const cacheConfig: CacheConfig = {
  redis: {
    url: process.env.REDIS_URL || '',
    keyPrefix: 'zstro:',
    defaultTTL: 3600, // 1 hour
  },
  memory: {
    maxSize: 1000,
    defaultTTL: 300, // 5 minutes
  },
  cdn: {
    enabled: process.env.NODE_ENV === 'production',
    defaultTTL: 86400, // 24 hours
  },
};

export const enhancedCache = new EnhancedCacheService(cacheConfig);
export default enhancedCache;
