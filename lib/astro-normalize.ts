export type Lang = "ne" | "en";

export type PlanetIn = {
  planet: "Sun"|"Moon"|"Mars"|"Mercury"|"Jupiter"|"Venus"|"Saturn"|"Rahu"|"Ketu";
  signId: number;             // 1..12
  signLabel?: string;
  degree?: number;
  house?: number | null;      // may be null/wrong
};

export type AstroIn = {
  ascSignId: number;          // 1..12
  ascSignLabel?: string;
  d1?: PlanetIn[];            // some APIs use d1
  planets?: PlanetIn[];       // or 'planets'
  yogas?: { key: string; label: string; factors?: string[] }[];
  doshas?: { key: string; label: string; factors?: string[] }[];
  lang?: Lang;
};

export type PlanetOut = PlanetIn & {
  safeHouse: number;          // always 1..12
  houseSource: "api" | "derived";
};

export type AstroOut = {
  ascSignId: number;
  ascSignLabel: string;
  planets: PlanetOut[];
  yogas: { key: string; label: string; factors: string[] }[];
  doshas: { key: string; label: string; factors: string[] }[];
  lang: Lang;
  mismatches: { planet: string; apiHouse?: number | null; derivedHouse: number }[];
};

const SIGN_LABELS_NE = [
  "", "मेष","वृष","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"
];
const SIGN_LABELS_EN = [
  "", "Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

export function computeHouseFromAsc(signId: number, ascSignId: number): number {
  if (!Number.isFinite(signId) || !Number.isFinite(ascSignId)) return 0;
  return (((signId - ascSignId + 12) % 12) + 1);
}

export function normalizeAstro(input: AstroIn, preferredLang: Lang = "ne"): AstroOut {
  const ascSignId = clamp12(input.ascSignId);
  const ascSignLabel = input.ascSignLabel
    ?? (preferredLang === "ne" ? SIGN_LABELS_NE[ascSignId] : SIGN_LABELS_EN[ascSignId]);

  const sourcePlanets = (input.planets && input.planets.length ? input.planets : input.d1) || [];
  const mismatches: AstroOut["mismatches"] = [];

  const planets: PlanetOut[] = sourcePlanets.map(p => {
    const signId = clamp12(p.signId);
    const derived = computeHouseFromAsc(signId, ascSignId);
    const apiHouse = (p.house && p.house >= 1 && p.house <= 12) ? p.house : null;
    const safeHouse = apiHouse ?? derived;
    const houseSource: "api" | "derived" = apiHouse ? "api" : "derived";

    if (apiHouse && apiHouse !== derived) {
      mismatches.push({ planet: p.planet, apiHouse, derivedHouse: derived });
    }

    // fill signLabel if missing
    const signLabel = p.signLabel ?? (preferredLang === "ne" ? SIGN_LABELS_NE[signId] : SIGN_LABELS_EN[signId]);

    return {
      ...p,
      signId,
      signLabel,
      house: apiHouse ?? p.house ?? null,
      safeHouse,
      houseSource,
      degree: p.degree,
    };
  });

  const toArr = (arr?: { key: string; label: string; factors?: string[] }[]) =>
    (arr ?? []).map(y => ({ key: y.key, label: y.label, factors: y.factors ?? [] }));

  return {
    ascSignId,
    ascSignLabel,
    planets,
    yogas: toArr(input.yogas),
    doshas: toArr(input.doshas),
    lang: input.lang ?? preferredLang,
    mismatches,
  };
}

function clamp12(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const x = Math.trunc(n);
  return (x < 1 || x > 12) ? 0 : x;
}
