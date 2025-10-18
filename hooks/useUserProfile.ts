"use client";
import { useEffect, useState } from "react";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  lang?: "ne" | "en";
} | null;

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = await res.json();
        if (alive) setProfile(json?.profile ?? null);
      } catch {
        if (alive) setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { profile, loading };
}
