// lib/astro/yoga-detectors.ts

import {
  PlanetPosition,
  DignityItem,
  AspectItem,
  VimshottariDasha,
  YogaItem,
} from "../prokerala/types";

/* ----------------------------- helpers ----------------------------- */

const isKendra = (h: number) => [1, 4, 7, 10].includes(h);
const isTrikon = (h: number) => [1, 5, 9].includes(h);
const isDusthana = (h: number) => [6, 8, 12].includes(h);

function byPlanet(planets: PlanetPosition[]) {
  const map: Record<string, PlanetPosition | undefined> = {};
  for (const p of planets) map[p.planet] = p;
  return map;
}

/* ----------------------------- detector ----------------------------- */

/**
 * Detects a concise subset of classical yogas from D1.
 * Returns YogaItem[] strictly (key, label, factors[, strengthHint?]).
 */
export function detectYogas(
  planets: PlanetPosition[] = [],
  dignities: DignityItem[] = [],
  _aspects: AspectItem[] = [],
  _v?: VimshottariDasha | null
): YogaItem[] {
  const res: YogaItem[] = [];
  const P = byPlanet(planets);

  /* ========== 1) Gaja–Kesari (Jupiter–Moon kendra relation) ========== */
  if (P["Jupiter"] && P["Moon"]) {
    const jH = P["Jupiter"]!.house;
    const mH = P["Moon"]!.house;
    const diff = ((Math.abs(jH - mH) % 12) || 12);
    const kendraRelation = [1, 3, 7, 9, 11].includes(diff) && (isKendra(jH) || isKendra(mH));
    if (kendraRelation) {
      res.push({
        key: "yoga.gajakesari",
        label: "Gaja–Kesari Yoga",
        factors: [`Jupiter (H${jH}) and Moon (H${mH}) in kendra relation`],
        strengthHint: "strong",
      });
    }
  }

  /* ========== 2) Budha–Āditya (Sun + Mercury conjunction) ========== */
  if (P["Sun"] && P["Mercury"] && P["Sun"]!.house === P["Mercury"]!.house) {
    res.push({
      key: "yoga.budha-aditya",
      label: "Budha–Āditya Yoga",
      factors: [`Sun & Mercury conjoined in H${P["Sun"]!.house}`],
      strengthHint: isKendra(P["Sun"]!.house) ? "strong" : "medium",
    });
  }

  /* ========== 3) Panch Mahapurusha (simplified) ========== */
  const pmpList: Array<{ pl: string; key: string; name: string }> = [
    { pl: "Saturn",  key: "yoga.shasha",  name: "Śaśa (Saturn in Kendra, own/exalt)" },
    { pl: "Mars",    key: "yoga.ruchaka", name: "Ruchaka (Mars in Kendra, own/exalt)" },
    { pl: "Mercury", key: "yoga.bhadra",  name: "Bhadra (Mercury in Kendra, own/exalt)" },
    { pl: "Jupiter", key: "yoga.hamsa",   name: "Haṁsa (Jupiter in Kendra, own/exalt)" },
    { pl: "Venus",   key: "yoga.malavya", name: "Mālavya (Venus in Kendra, own/exalt)" },
  ];

  const dignityMap: Record<string, string | undefined> = {};
  for (const d of dignities) dignityMap[d.planet] = d.status?.toLowerCase();

  for (const cfg of pmpList) {
    const p = P[cfg.pl];
    if (!p) continue;
    const st = dignityMap[cfg.pl] || "";
    if (isKendra(p.house) && (st.includes("exalt") || st.includes("own"))) {
      res.push({
        key: cfg.key,
        label: cfg.name,
        factors: [`${cfg.pl} ${st} in Kendra (H${p.house})`],
        strengthHint: "strong",
      });
    }
  }

  /* ========== 4) Rāja Yoga (Kendra–Trikona linkage) – heuristic ========== */
  const classical = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const list = classical.map((pl) => P[pl]).filter(Boolean) as PlanetPosition[];
  if (list.length >= 2) {
    const hasKT = list.some((a) =>
      isKendra(a.house) && list.some((b) => isTrikon(b.house) && b !== a)
    );
    if (hasKT) {
      res.push({
        key: "yoga.raja.kendra-trikona",
        label: "Rāja Yoga (Kendra–Trikona linkage)",
        factors: ["At least one planet in Kendra and one in Trikona"],
        strengthHint: "medium",
      });
    }
  }

  /* ========== 5) Viparīta Rāja (hint) – simplified ========== */
  const dustCount = list.filter((p) => isDusthana(p.house)).length;
  if (dustCount >= 3) {
    res.push({
      key: "yoga.viparita-hint",
      label: "Viparīta Rāja Yoga (hint)",
      factors: ["Multiple planets in dusthana houses (6/8/12)"],
      strengthHint: "light",
    });
  }

  return res;
}

// (optional) also export default to allow either import style
export default detectYogas;
