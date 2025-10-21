// lib/fetch-wrapper.ts
// ZSTRO AI Fetch Wrapper with No-Cache for Development

export async function zFetch(input: RequestInfo, init: RequestInit = {}) {
  return fetch(input, { 
    cache: "no-store", 
    next: { revalidate: 0 }, 
    ...init 
  });
}

export async function zFetchWithCache(input: RequestInfo, init: RequestInit = {}) {
  // For production use with proper caching
  return fetch(input, init);
}
