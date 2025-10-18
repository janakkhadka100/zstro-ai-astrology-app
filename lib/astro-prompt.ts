import { normalizeAstro } from "./astro-normalize";

export function buildAstroPrompt(rawApiData: any) {
  const normalized = normalizeAstro(rawApiData, rawApiData?.lang ?? "ne");

  // AI लाई पठाउने JSON — सधैं safeHouse सहित
  const aiInput = {
    ascSignId: normalized.ascSignId,
    ascSignLabel: normalized.ascSignLabel,
    planets: normalized.planets.map(p => ({
      planet: p.planet,
      signId: p.signId,
      signLabel: p.signLabel,
      degree: p.degree ?? null,
      house: p.safeHouse,           // IMPORTANT: सुरक्षित भाव (correct & guaranteed)
    })),
    yogas: normalized.yogas,
    doshas: normalized.doshas,
    lang: normalized.lang,
  };

  // SYSTEM/DEVELOPER PROMPT (A) सँग यो aiInput (JSON.stringify) पठाउनुहोस्
  return {
    aiInput,
    mismatches: normalized.mismatches, // UI मा debug card/alert देखाउन
  };
}
