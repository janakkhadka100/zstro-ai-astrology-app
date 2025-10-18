// lib/cards/compose.ts
// Compose cards from account data + derived analysis + detected yogas

import { AstroData, D1PlanetRow, YogaExplained, YogaItem, DoshaItem } from '@/lib/astrology/types';
import { deriveBundle } from '@/lib/astrology/derive';
import { detectAll } from '@/lib/astrology/detectors';
import { getSignLabel } from '@/lib/astrology/tables';
import { dedupByKey } from '@/lib/astrology/util';

export function composeAstroData(
  accountData: Partial<AstroData>,
  lang: "ne" | "en" = "ne"
): AstroData {
  const provenance: string[] = [];

  // Ensure we have required data
  if (!accountData.ascSignId || !accountData.d1) {
    throw new Error("Missing required data: ascSignId and d1");
  }

  // Build derived analysis (houses, relations, strengths)
  const derived = deriveBundle(
    accountData.ascSignId,
    accountData.d1,
    accountData.shadbala
  );
  provenance.push("derived");

  // Detect additional yogas from D1 data
  const detectedYogas = detectAll(accountData.ascSignId, accountData.d1, lang);
  const existingYogas = accountData.yogas || [];
  const allYogas = dedupByKey([...existingYogas, ...detectedYogas]);
  
  if (detectedYogas.length > 0) {
    provenance.push("yogas.detected");
  }

  // Detect additional doshas (if any)
  const existingDoshas = accountData.doshas || [];
  const allDoshas = [...existingDoshas]; // Add dosha detection logic here if needed

  // Compose final AstroData
  const astroData: AstroData = {
    profile: accountData.profile,
    ascSignId: accountData.ascSignId,
    ascSignLabel: accountData.ascSignLabel || getSignLabel(accountData.ascSignId, lang),
    d1: accountData.d1,
    derived, // <<< new - house analysis, relations, strengths
    divisionals: accountData.divisionals || [],
    yogas: allYogas,
    doshas: allDoshas,
    shadbala: accountData.shadbala || [],
    dashas: accountData.dashas || [],
    lang,
    provenance: {
      account: provenance,
      prokerala: accountData.provenance?.prokerala || []
    }
  };

  return astroData;
}

// Helper function to merge new data into existing AstroData
export function mergeAstroData(
  existing: AstroData,
  newData: Partial<AstroData>,
  lang: "ne" | "en" = "ne"
): AstroData {
  const merged = {
    ...existing,
    ...newData,
    // Rebuild derived data if D1 or ascSignId changed
    derived: (newData.d1 || newData.ascSignId) ? 
      deriveBundle(
        newData.ascSignId || existing.ascSignId,
        newData.d1 || existing.d1,
        newData.shadbala || existing.shadbala
      ) : existing.derived,
    // Merge yogas and doshas
    yogas: dedupByKey([
      ...(existing.yogas || []),
      ...(newData.yogas || [])
    ]),
    doshas: dedupByKey([
      ...(existing.doshas || []),
      ...(newData.doshas || [])
    ]),
    // Update provenance
    provenance: {
      account: [
        ...(existing.provenance?.account || []),
        ...(newData.provenance?.account || [])
      ],
      prokerala: [
        ...(existing.provenance?.prokerala || []),
        ...(newData.provenance?.prokerala || [])
      ]
    }
  };

  return merged;
}

// Helper function to validate AstroData completeness
export function validateAstroData(data: AstroData): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!data.ascSignId) missing.push("ascSignId");
  if (!data.d1 || data.d1.length === 0) missing.push("d1");
  if (!data.derived) missing.push("derived");
  if (!data.derived?.houses || data.derived.houses.length === 0) missing.push("derived.houses");
  if (!data.derived?.relations || data.derived.relations.length === 0) missing.push("derived.relations");
  if (!data.derived?.strengths || data.derived.strengths.length === 0) missing.push("derived.strengths");

  return {
    valid: missing.length === 0,
    missing
  };
}

// Helper function to get house analysis for a specific house
export function getHouseAnalysis(data: AstroData, house: number) {
  if (!data.derived?.houses) return null;
  
  return data.derived.houses.find(h => h.house === house);
}

// Helper function to get planet strength
export function getPlanetStrength(data: AstroData, planet: string) {
  if (!data.derived?.strengths) return null;
  
  return data.derived.strengths.find(s => s.planet === planet);
}

// Helper function to get planetary relations
export function getPlanetaryRelations(data: AstroData, planet: string) {
  if (!data.derived?.relations) return [];
  
  return data.derived.relations.filter(r => r.a === planet || r.b === planet);
}