// lib/cache/transit.ts
// Transit caching service with quality-of-life features

import { kv } from '@vercel/kv';

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const CACHE_PREFIX = 'transit:';

export interface CachedTransitData {
  data: any;
  timestamp: number;
  userId: string;
  date: string;
}

/**
 * Cache transit data for a user and date
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @param data - Transit data to cache
 */
export async function cacheTransitData(
  userId: string, 
  date: string, 
  data: any
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${userId}:${date}`;
    const cachedData: CachedTransitData = {
      data,
      timestamp: Date.now(),
      userId,
      date
    };
    
    await kv.set(cacheKey, cachedData, { ex: CACHE_TTL_SECONDS });
    console.log(`Cached transit data for ${userId} on ${date}`);
  } catch (error) {
    console.error('Error caching transit data:', error);
  }
}

/**
 * Get cached transit data for a user and date
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Cached data or null
 */
export async function getCachedTransitData(
  userId: string, 
  date: string
): Promise<any | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${userId}:${date}`;
    const cached = await kv.get<CachedTransitData>(cacheKey);
    
    if (cached && cached.data) {
      console.log(`Cache hit for transit data: ${userId} on ${date}`);
      return cached.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached transit data:', error);
    return null;
  }
}

/**
 * Cache user's last viewed date
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 */
export async function cacheLastViewedDate(userId: string, date: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}last-viewed:${userId}`;
    await kv.set(cacheKey, date, { ex: 7 * 24 * 60 * 60 }); // 7 days
  } catch (error) {
    console.error('Error caching last viewed date:', error);
  }
}

/**
 * Get user's last viewed date
 * @param userId - User ID
 * @returns Last viewed date or today's date
 */
export async function getLastViewedDate(userId: string): Promise<string> {
  try {
    const cacheKey = `${CACHE_PREFIX}last-viewed:${userId}`;
    const lastDate = await kv.get<string>(cacheKey);
    
    if (lastDate) {
      return lastDate;
    }
    
    // Return today's date as default
    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Error getting last viewed date:', error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Invalidate cache for a specific user and date
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 */
export async function invalidateTransitCache(userId: string, date: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${userId}:${date}`;
    await kv.del(cacheKey);
    console.log(`Invalidated transit cache for ${userId} on ${date}`);
  } catch (error) {
    console.error('Error invalidating transit cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns Cache statistics
 */
export async function getTransitCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
}> {
  try {
    // This is a simplified version - in production you'd want more detailed stats
    const keys = await kv.keys(`${CACHE_PREFIX}*`);
    
    return {
      totalKeys: keys.length,
      memoryUsage: 'N/A', // Would need Redis INFO command
      hitRate: 0.85 // Placeholder - would need to track hits/misses
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalKeys: 0,
      memoryUsage: 'N/A',
      hitRate: 0
    };
  }
}

/**
 * Background refresh for today's transit data
 * @param userId - User ID
 */
export async function backgroundRefreshTodayTransits(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we have cached data for today
    const cached = await getCachedTransitData(userId, today);
    
    if (cached) {
      // Data exists, no need to refresh
      return;
    }
    
    // Fetch fresh data in background
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/transits/today`);
    const result = await response.json();
    
    if (result.success) {
      await cacheTransitData(userId, today, result.data);
      console.log(`Background refresh completed for ${userId} on ${today}`);
    }
  } catch (error) {
    console.error('Error in background refresh:', error);
  }
}
