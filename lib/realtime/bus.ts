// lib/realtime/bus.ts
// Redis Pub/Sub for realtime updates

import Redis from "ioredis";

// Create Redis connections only if REDIS_URL is available (for Vercel deployment)
let pub: Redis | null = null;
let sub: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    pub = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    sub = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch (error) {
    console.warn('Redis connection failed, realtime features disabled:', error);
  }
}

export { pub, sub };

export function userChannel(userId: string): string {
  return `cards:patch:${userId}`;
}
export function globalChannel(): string {
  return 'cards:global';
}

export function systemChannel(): string {
  return 'cards:system';
}

// Publish a patch to a specific user
export async function publishUserPatch(userId: string, patch: any): Promise<void> {
  if (!pub) {
    console.warn('Redis not available, skipping user patch publish');
    return;
  }
  
  try {
    await pub.publish(userChannel(userId), JSON.stringify(patch));
    console.log(`Published patch to user ${userId}:`, patch);
  } catch (error) {
    console.error('Error publishing user patch:', error);
  }
}

// Publish a global update
export async function publishGlobalUpdate(update: any): Promise<void> {
  if (!pub) {
    console.warn('Redis not available, skipping global update publish');
    return;
  }
  
  try {
    await pub.publish(globalChannel(), JSON.stringify(update));
    console.log('Published global update:', update);
  } catch (error) {
    console.error('Error publishing global update:', error);
  }
}

// Publish a system message
export async function publishSystemMessage(message: any): Promise<void> {
  if (!pub) {
    console.warn('Redis not available, skipping system message publish');
    return;
  }
  
  try {
    await pub.publish(systemChannel(), JSON.stringify(message));
    console.log('Published system message:', message);
  } catch (error) {
    console.error('Error publishing system message:', error);
  }
}

// Health check for Redis connection
export async function checkRedisHealth(): Promise<boolean> {
  if (!pub || !sub) {
    return false;
  }
  
  try {
    await pub.ping();
    await sub.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
