// lib/astro/dosha-detectors.ts
import { DoshaItem, PlanetPosition } from "../prokerala/types";

// Helpers
const isDusthana = (h: number) => [6, 8, 12].includes(h);

/**
 * Detect a pragmatic subset of classical doṣas from D1.
 * Returns plain DoshaItem[] (key, label, factors[, severity?]).
 */
function detectDoshas(
  planets: PlanetPosition[] = [],
  // kept for future compatibility; not used here to keep DoshaItem strict
  _v?: unknown
): DoshaItem[] {
  const res: DoshaItem[] = [];

  // Index by planet
  const P: Record<string, PlanetPosition | undefined> = {};
  for (const p of planets) P[p.planet] = p;

  // 1) Grahan Doṣa – Sun with Rahu/Ketu
  const sunG =
    !!P["Sun"] &&
    ((P["Rahu"] && P["Sun"]!.house === P["Rahu"]!.house) ||
      (P["Ketu"] && P["Sun"]!.house === P["Ketu"]!.house));
  if (sunG) {
    res.push({
      key: "dosha.grahan.surya",
      label: "Sūrya Grahan Doṣa",
      factors: [`Sun with Node in H${P["Sun"]!.house}`],
    });
  }

  // 1b) Grahan Doṣa – Moon with Rahu/Ketu
  const moonG =
    !!P["Moon"] &&
    ((P["Rahu"] && P["Moon"]!.house === P["Rahu"]!.house) ||
      (P["Ketu"] && P["Moon"]!.house === P["Ketu"]!.house));
  if (moonG) {
    res.push({
      key: "dosha.grahan.chandra",
      label: "Chandra Grahan Doṣa",
      factors: [`Moon with Node in H${P["Moon"]!.house}`],
    });
  }

  // 2) Mangal/Kuja Doṣa (Mars in 1,2,4,7,8,12 from Lagna or from Moon)
  const kujaH = new Set([1, 2, 4, 7, 8, 12]);
  const kujaFromLagna = !!P["Mars"] && kujaH.has(P["Mars"]!.house);
  let kujaFromMoon = false;
  if (P["Mars"] && P["Moon"]) {
    // distance of Mars from Moon (1..12)
    const dist = ((P["Mars"]!.house - P["Moon"]!.house + 12) % 12) || 12;
    kujaFromMoon = kujaH.has(dist);
  }
  if (kujaFromLagna || kujaFromMoon) {
    const reasons: string[] = [];
    if (kujaFromLagna) reasons.push(`Mars in sensitive house (H${P["Mars"]!.house})`);
    if (kujaFromMoon) reasons.push("Mars in 1/2/4/7/8/12 from Moon");
    res.push({
      key: "dosha.mangal",
      label: "Mangal (Kuja) Doṣa",
      factors: reasons,
    });
  }

  // 3) Kaal-Sarpa Doṣa (all classical planets between Rahu–Ketu)
  if (P["Rahu"] && P["Ketu"]) {
    const seven = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
      .map((x) => P[x])
      .filter(Boolean) as PlanetPosition[];
    if (seven.length === 7) {
      const r = P["Rahu"]!.house;
      const k = P["Ketu"]!.house;
      const a = Math.min(r, k);
      const b = Math.max(r, k);
      const inside = seven.every((p) => p.house > a && p.house < b);
      const outside = seven.every((p) => p.house < a || p.house > b);
      if (inside || outside) {
        res.push({
          key: "dosha.kaalsarpa",
          label: "Kaal-Sarpa Doṣa",
          factors: ["Seven planets hemmed by Rahu–Ketu axis"],
        });
      }
    }
  }

  // 4) Śrapit Doṣा (Saturn + Rahu together)
  const shrapit = !!(P["Saturn"] && P["Rahu"] && P["Saturn"]!.house === P["Rahu"]!.house);
  if (shrapit) {
    res.push({
      key: "dosha.shrapit",
      label: "Śrapit Doṣa",
      factors: [`Saturn & Rahu in H${P["Saturn"]!.house}`],
    });
  }

  // 5) Pitṛ Doṣा (Sun afflicted by nodes)
  const pitri =
    !!P["Sun"] &&
    ((P["Rahu"] && P["Sun"]!.house === P["Rahu"]!.house) ||
      (P["Ketu"] && P["Sun"]!.house === P["Ketu"]!.house));
  if (pitri) {
    res.push({
      key: "dosha.pitri",
      label: "Pitṛ Doṣa",
      factors: ["Sun afflicted by Rahu/Ketu"],
    });
  }

  // 6) Kemadruma (Moon isolated: no classical planets on both sides) – simple variant
  if (P["Moon"]) {
    const prev = ((P["Moon"]!.house + 10) % 12) + 1;
    const next = (P["Moon"]!.house % 12) + 1;
    const others = planets
      .filter((p) => !["Moon", "Rahu", "Ketu"].includes(p.planet))
      .map((p) => p.house);
    const kem = !others.includes(prev) && !others.includes(next);
    if (kem) {
      res.push({
        key: "dosha.kemadruma",
        label: "Kemadruma Doṣa",
        factors: ["No classical planet on either side of Moon"],
      });
    }
  }

  // 7) Daridra (simplified: ≥2 malefics in 2nd/11th)
  const malefics = ["Mars", "Saturn", "Rahu", "Ketu"];
  const heavy =
    malefics.filter((m) => P[m] && (P[m]!.house === 2 || P[m]!.house === 11)).length >= 2;
  if (heavy) {
    res.push({
      key: "dosha.daridra",
      label: "Daridra Yoga (Doṣa)",
      factors: ["Multiple malefics in 2nd/11th houses"],
    });
  }

  // 8) Vish Yoga (Saturn + Moon together)
  const vish = !!(P["Saturn"] && P["Moon"] && P["Saturn"]!.house === P["Moon"]!.house);
  if (vish) {
    res.push({
      key: "dosha.vish-yoga",
      label: "Vish (Saturn–Moon) Doṣa",
      factors: [`Saturn & Moon together in H${P["Moon"]!.house}`],
    });
  }

  // 9) Guru-Chandala (Jupiter with Rahu/Ketu)
  const gc =
    (P["Jupiter"] && P["Rahu"] && P["Jupiter"]!.house === P["Rahu"]!.house) ||
    (P["Jupiter"] && P["Ketu"] && P["Jupiter"]!.house === P["Ketu"]!.house);
  if (gc) {
    res.push({
      key: "dosha.guru-chandala",
      label: "Guru–Chandala Doṣa",
      factors: ["Jupiter conjoined with Rahu/Ketu"],
    });
  }

  // 10) Pāpakartari around 10th (malefics hemming 10th) – simplified
  const h9 = 9,
    h11 = 11;
  const mal = ["Mars", "Saturn"];
  const pk10 = mal.some((m) => P[m]?.house === h9) && mal.some((m) => P[m]?.house === h11);
  if (pk10) {
    res.push({
      key: "dosha.papakatari.10",
      label: "Pāpakartari (around 10th)",
      factors: ["Malefics in 9th and 11th hemming the 10th house"],
    });
  }

  // 11) Alpa Śakti (many planets in Dusthana) – simplified heuristic
  const dustCount = planets.filter(
    (p) => isDusthana(p.house) && !["Rahu", "Ketu"].includes(p.planet)
  ).length;
  if (dustCount >= 4) {
    res.push({
      key: "dosha.alpa-shakti",
      label: "Alpa Śakti (Dusthana crowd)",
      factors: ["≥4 planets across 6/8/12 houses"],
    });
  }

  // 12) Aṣṭama Śani (Saturn 8th from Moon)
  if (P["Saturn"] && P["Moon"]) {
    const eightFromMoon = ((P["Moon"]!.house + 7) % 12) + 1;
    const asht = P["Saturn"]!.house === eightFromMoon;
    if (asht) {
      res.push({
        key: "dosha.ashtama-shani",
        label: "Aṣṭama Śani (from Moon)",
        factors: ["Saturn is 8th from Moon"],
      });
    }
  }

  return res;
}

// Export both named and default so either import style works
export { detectDoshas };
export default detectDoshas;
