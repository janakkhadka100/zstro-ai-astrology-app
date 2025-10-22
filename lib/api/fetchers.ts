// lib/api/fetchers.ts
// Client-side data fetchers for real astrological data

export async function fetchUserProfile() {
  const r = await fetch("/api/user/profile", { 
    cache: "no-store",
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
  
  if (!r.ok) {
    if (r.status === 404) {
      throw new Error("profile-missing");
    }
    throw new Error(`Profile fetch failed: ${r.status}`);
  }
  
  return r.json();
}

export async function fetchKundali(birth: any, locale: string) {
  const r = await fetch("/api/astro/prokerala", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    },
    body: JSON.stringify({ birth, locale }),
    cache: "no-store"
  });
  
  const t = await r.text();
  
  if (!r.ok) { 
    console.error("[ZSTRO] prokerala error:", t.slice(0, 240)); 
    throw new Error("astro-failed"); 
  }
  
  return JSON.parse(t);
}
