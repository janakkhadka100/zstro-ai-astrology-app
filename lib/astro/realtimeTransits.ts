// lib/astro/realtimeTransits.ts
// Real-time transit updates service

import { kv } from '@vercel/kv';
import { fetchTransitsForDate } from './gocharService';
import { cacheTransitData, getCachedTransitData } from '@/lib/cache/transit';

const REALTIME_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
const CACHE_KEY_PREFIX = 'realtime:transits:';

export interface RealtimeTransitUpdate {
  userId: string;
  date: string;
  lastUpdated: number;
  nextUpdate: number;
  data: any;
}

/**
 * Get real-time transit data with automatic updates
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @param forceRefresh - Force refresh even if cache is valid
 * @returns Real-time transit data
 */
export async function getRealtimeTransits(
  userId: string, 
  date: string, 
  forceRefresh: boolean = false
): Promise<any> {
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}:${date}`;
  
  try {
    // Check if we have cached data
    if (!forceRefresh) {
      const cached = await getCachedTransitData(userId, date);
      if (cached) {
        return cached;
      }
    }

    // Fetch fresh data
    const transitData = await fetchTransitsForDate(userId, date);
    
    // Store in real-time cache
    const update: RealtimeTransitUpdate = {
      userId,
      date,
      lastUpdated: Date.now(),
      nextUpdate: Date.now() + REALTIME_UPDATE_INTERVAL,
      data: transitData
    };

    await kv.set(cacheKey, update, { ex: 24 * 60 * 60 }); // 24 hours
    
    return transitData;
  } catch (error) {
    console.error('Error getting real-time transits:', error);
    
    // Fallback to cached data if available
    const cached = await getCachedTransitData(userId, date);
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * Schedule background update for transit data
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 */
export async function scheduleTransitUpdate(userId: string, date: string): Promise<void> {
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}:${date}`;
  
  try {
    // Check if update is needed
    const cached = await kv.get<RealtimeTransitUpdate>(cacheKey);
    if (cached && cached.nextUpdate > Date.now()) {
      return; // No update needed
    }

    // Fetch fresh data in background
    const transitData = await fetchTransitsForDate(userId, date);
    
    // Update cache
    const update: RealtimeTransitUpdate = {
      userId,
      date,
      lastUpdated: Date.now(),
      nextUpdate: Date.now() + REALTIME_UPDATE_INTERVAL,
      data: transitData
    };

    await kv.set(cacheKey, update, { ex: 24 * 60 * 60 });
    
    console.log(`Background transit update completed for ${userId} on ${date}`);
  } catch (error) {
    console.error('Error in background transit update:', error);
  }
}

/**
 * Get all users who need transit updates
 * @returns Array of user IDs that need updates
 */
export async function getUsersNeedingUpdates(): Promise<string[]> {
  try {
    const keys = await kv.keys(`${CACHE_KEY_PREFIX}*`);
    const usersNeedingUpdates: string[] = [];
    
    for (const key of keys) {
      const update = await kv.get<RealtimeTransitUpdate>(key);
      if (update && update.nextUpdate <= Date.now()) {
        usersNeedingUpdates.push(update.userId);
      }
    }
    
    return usersNeedingUpdates;
  } catch (error) {
    console.error('Error getting users needing updates:', error);
    return [];
  }
}

/**
 * Batch update transits for multiple users
 * @param userIds - Array of user IDs
 * @param date - Date in YYYY-MM-DD format
 */
export async function batchUpdateTransits(userIds: string[], date: string): Promise<void> {
  const promises = userIds.map(userId => scheduleTransitUpdate(userId, date));
  await Promise.allSettled(promises);
}

/**
 * Get transit update status
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Update status information
 */
export async function getTransitUpdateStatus(
  userId: string, 
  date: string
): Promise<{
  lastUpdated: number;
  nextUpdate: number;
  isStale: boolean;
  timeUntilUpdate: number;
}> {
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}:${date}`;
  
  try {
    const update = await kv.get<RealtimeTransitUpdate>(cacheKey);
    
    if (!update) {
      return {
        lastUpdated: 0,
        nextUpdate: 0,
        isStale: true,
        timeUntilUpdate: 0
      };
    }

    const now = Date.now();
    const isStale = update.nextUpdate <= now;
    const timeUntilUpdate = Math.max(0, update.nextUpdate - now);

    return {
      lastUpdated: update.lastUpdated,
      nextUpdate: update.nextUpdate,
      isStale,
      timeUntilUpdate
    };
  } catch (error) {
    console.error('Error getting transit update status:', error);
    return {
      lastUpdated: 0,
      nextUpdate: 0,
      isStale: true,
      timeUntilUpdate: 0
    };
  }
}
