// ✅ lib/cache.ts
type CacheEntry<T> = { value: T; expiry: number };
const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached value or compute and cache it
 * @param key unique cache key
 * @param ttlMillis time to live in ms
 * @param fetcher function to fetch data if cache miss
 */
export async function getOrSetCache<T>(
  key: string,
  ttlMillis: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);

  if (entry && entry.expiry > now) {
    return entry.value; // ✅ return cached
  }

  const value = await fetcher();
  cache.set(key, { value, expiry: now + ttlMillis });
  return value;
}

// Optional: clear cache manually
export function clearCache(key: string) {
  cache.delete(key);
}
export function clearAllCache() {
  cache.clear();
}