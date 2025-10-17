// lib/cards/compose.ts
// Card composition and patching system

import { AstroData, AstroPatch, DashaItem, DivisionalBlock, ShadbalaRow, YogaItem, DoshaItem } from '@/lib/astrology/types';

export function mergeAstroData(base: AstroData, patch: AstroPatch): AstroData {
  const merged: AstroData = {
    ...base,
    provenance: {
      account: [...(base.provenance?.account || [])],
      prokerala: [...(base.provenance?.prokerala || []), ...(patch.provenance?.prokerala || [])]
    }
  };

  if (patch.set) {
    // Merge profile data
    if (patch.set.profile) {
      merged.profile = { ...merged.profile, ...patch.set.profile };
    }

    // Merge D1 planets (replace if provided)
    if (patch.set.d1) {
      merged.d1 = patch.set.d1;
    }

    // Merge divisionals (append new ones)
    if (patch.set.divisionals) {
      const existingTypes = new Set(merged.divisionals.map(d => d.type));
      const newDivisionals = patch.set.divisionals.filter(d => !existingTypes.has(d.type));
      merged.divisionals = [...merged.divisionals, ...newDivisionals];
    }

    // Merge yogas (append new ones, avoid duplicates)
    if (patch.set.yogas) {
      const existingKeys = new Set(merged.yogas.map(y => y.key));
      const newYogas = patch.set.yogas.filter(y => !existingKeys.has(y.key));
      merged.yogas = [...merged.yogas, ...newYogas];
    }

    // Merge doshas (append new ones, avoid duplicates)
    if (patch.set.doshas) {
      const existingKeys = new Set(merged.doshas.map(d => d.key));
      const newDoshas = patch.set.doshas.filter(d => !existingKeys.has(d.key));
      merged.doshas = [...merged.doshas, ...newDoshas];
    }

    // Merge shadbala (replace if provided, as it's a complete dataset)
    if (patch.set.shadbala) {
      merged.shadbala = patch.set.shadbala;
    }

    // Merge dashas (append new ones, avoid duplicates)
    if (patch.set.dashas) {
      const existingDashas = new Set(
        merged.dashas.map(d => `${d.system}-${d.level}-${d.planet}-${d.from}`)
      );
      const newDashas = patch.set.dashas.filter(d => 
        !existingDashas.has(`${d.system}-${d.level}-${d.planet}-${d.from}`)
      );
      merged.dashas = [...merged.dashas, ...newDashas];
    }

    // Update language if provided
    if (patch.set.lang) {
      merged.lang = patch.set.lang;
    }
  }

  return merged;
}

export function createEmptyAstroData(lang: "ne" | "en" = "ne"): AstroData {
  return {
    ascSignId: 1,
    ascSignLabel: "Aries",
    d1: [],
    divisionals: [],
    yogas: [],
    doshas: [],
    shadbala: [],
    dashas: [],
    lang,
    provenance: {
      account: [],
      prokerala: []
    }
  };
}

export function validateAstroData(data: AstroData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ascendant
  if (!data.ascSignId || data.ascSignId < 1 || data.ascSignId > 12) {
    errors.push("Invalid ascendant sign ID");
  }

  // Validate D1 planets
  for (const planet of data.d1) {
    if (!planet.planet || !planet.signId || planet.signId < 1 || planet.signId > 12) {
      errors.push(`Invalid D1 planet data: ${planet.planet}`);
    }
    if (planet.house < 1 || planet.house > 12) {
      errors.push(`Invalid house number for ${planet.planet}: ${planet.house}`);
    }
  }

  // Validate divisionals
  for (const divisional of data.divisionals) {
    if (!["D2", "D7", "D9", "D10"].includes(divisional.type)) {
      errors.push(`Invalid divisional chart type: ${divisional.type}`);
    }
    for (const planet of divisional.planets) {
      if (!planet.planet || !planet.signId || planet.signId < 1 || planet.signId > 12) {
        errors.push(`Invalid divisional planet data in ${divisional.type}: ${planet.planet}`);
      }
    }
  }

  // Validate dashas
  for (const dasha of data.dashas) {
    if (!["Vimshottari", "Yogini"].includes(dasha.system)) {
      errors.push(`Invalid dasha system: ${dasha.system}`);
    }
    if (!["maha", "antar", "pratyantar", "current"].includes(dasha.level)) {
      errors.push(`Invalid dasha level: ${dasha.level}`);
    }
    if (!dasha.planet || !dasha.from || !dasha.to) {
      errors.push(`Incomplete dasha data: ${dasha.planet}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getDataCoverage(data: AstroData): {
  d1: boolean;
  divisionals: string[];
  yogas: boolean;
  doshas: boolean;
  shadbala: boolean;
  dashas: {
    vimshottari: string[];
    yogini: string[];
  };
} {
  return {
    d1: data.d1.length > 0,
    divisionals: data.divisionals.map(d => d.type),
    yogas: data.yogas.length > 0,
    doshas: data.doshas.length > 0,
    shadbala: data.shadbala.length > 0,
    dashas: {
      vimshottari: data.dashas
        .filter(d => d.system === "Vimshottari")
        .map(d => d.level),
      yogini: data.dashas
        .filter(d => d.system === "Yogini")
        .map(d => d.level)
    }
  };
}

export function getMissingData(data: AstroData): string[] {
  const missing: string[] = [];
  const coverage = getDataCoverage(data);

  if (!coverage.d1) {
    missing.push("d1");
  }

  if (coverage.divisionals.length === 0) {
    missing.push("divisionals");
  } else {
    const available = coverage.divisionals;
    const expected = ["D2", "D7", "D9", "D10"];
    const missingDivisionals = expected.filter(d => !available.includes(d));
    if (missingDivisionals.length > 0) {
      missing.push(`divisionals.${missingDivisionals.join(',')}`);
    }
  }

  if (!coverage.yogas) {
    missing.push("yogas");
  }

  if (!coverage.doshas) {
    missing.push("doshas");
  }

  if (!coverage.shadbala) {
    missing.push("shadbala");
  }

  if (coverage.dashas.vimshottari.length === 0) {
    missing.push("dashas.vimshottari");
  } else {
    const available = coverage.dashas.vimshottari;
    const expected = ["maha", "antar", "pratyantar", "current"];
    const missingVimshottari = expected.filter(l => !available.includes(l));
    if (missingVimshottari.length > 0) {
      missing.push(`dashas.vimshottari.${missingVimshottari.join(',')}`);
    }
  }

  if (coverage.dashas.yogini.length === 0) {
    missing.push("dashas.yogini");
  } else {
    const available = coverage.dashas.yogini;
    const expected = ["maha", "current"];
    const missingYogini = expected.filter(l => !available.includes(l));
    if (missingYogini.length > 0) {
      missing.push(`dashas.yogini.${missingYogini.join(',')}`);
    }
  }

  return missing;
}

export function createPatchFromMissing(missing: string[]): AstroPatch {
  const patch: AstroPatch = {
    set: {},
    provenance: { prokerala: [] }
  };

  for (const item of missing) {
    if (item.startsWith("divisionals.")) {
      const charts = item.replace("divisionals.", "").split(",");
      patch.set!.divisionals = charts.map(chart => ({
        type: chart as "D2" | "D7" | "D9" | "D10",
        planets: []
      }));
    } else if (item.startsWith("dashas.vimshottari.")) {
      const levels = item.replace("dashas.vimshottari.", "").split(",");
      patch.set!.dashas = levels.map(level => ({
        system: "Vimshottari" as const,
        level: level as "maha" | "antar" | "pratyantar" | "current",
        planet: "Sun" as const,
        from: new Date().toISOString(),
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } else if (item.startsWith("dashas.yogini.")) {
      const levels = item.replace("dashas.yogini.", "").split(",");
      patch.set!.dashas = levels.map(level => ({
        system: "Yogini" as const,
        level: level as "maha" | "current",
        planet: "Sun" as const,
        from: new Date().toISOString(),
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } else {
      // For simple items like "d1", "yogas", "doshas", "shadbala"
      patch.provenance!.prokerala.push(item);
    }
  }

  return patch;
}
