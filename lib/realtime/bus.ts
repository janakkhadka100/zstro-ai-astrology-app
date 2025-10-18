// lib/realtime/bus.ts
// Redis Pub/Sub for realtime updates

import Redis from "ioredis";

const url = process.env.REDIS_URL || 'redis://localhost:6379';

export const pub = new Redis(url, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export const sub = new Redis(url, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

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
  try {
    await pub.publish(userChannel(userId), JSON.stringify(patch));
    console.log(`Published patch to user ${userId}:`, patch);
  } catch (error) {
    console.error('Error publishing user patch:', error);
  }
}

// Publish a global update
export async function publishGlobalUpdate(update: any): Promise<void> {
  try {
    await pub.publish(globalChannel(), JSON.stringify(update));
    console.log('Published global update:', update);
  } catch (error) {
    console.error('Error publishing global update:', error);
  }
}

// Publish a system message
export async function publishSystemMessage(message: any): Promise<void> {
  try {
    await pub.publish(systemChannel(), JSON.stringify(message));
    console.log('Published system message:', message);
  } catch (error) {
    console.error('Error publishing system message:', error);
  }
}

// Health check for Redis connection
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await pub.ping();
    await sub.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
