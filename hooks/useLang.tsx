"use client";
import { useEffect, useState } from "react";

export type Lang = "en" | "hi" | "ne";

export function useLang() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem("zstro:lang")) as Lang | null;
    if (saved === "en" || saved === "hi" || saved === "ne") setLang(saved);
  }, []);

  const update = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("zstro:lang", l); } catch {}
  };

  return { lang, setLang: update } as const;
}