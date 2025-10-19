import { AstroInput, AstroOutput, PlanetOutput, ShadbalaTableRow } from './schemas';
import { processPlanetHouses } from './house-derivation';
import { processShadbalaData, createShadbalaTable } from './shadbala-normalization';
import { processVimshottariTree, processYoginiTree } from './dasha-trees';
import { fillAscSignLabel, fillPlanetSignLabels } from './labels';

/**
 * Main pipeline function that processes raw astro input and returns validated output
 * NEVER throws - collects all issues in mismatches and dashaFixes
 */
export function buildAstroOutput(raw: AstroInput): AstroOutput {
  const fixes: string[] = [];
  const lang = raw.lang || "ne";

  // Fill missing ascSignLabel
  const ascSignLabel = raw.ascSignLabel || fillAscSignLabel(raw.ascSignId, lang);

  // Process planets for house derivation
  const { processedPlanets, mismatches } = processPlanetHouses(raw.d1, raw.ascSignId);

  // Process Shadbala data
  const shadbalaData = processShadbalaData(raw.d1, raw.shadbala);

  // Fill missing planet sign labels
  const planetsWithLabels = fillPlanetSignLabels(processedPlanets, lang);

  // Create final planet output
  const planets: PlanetOutput[] = planetsWithLabels.map(planet => {
    const shadbalaInfo = shadbalaData.find(s => s.planet === planet.planet);
    const originalPlanet = raw.d1.find(p => p.planet === planet.planet);
    return {
      planet: planet.planet,
      signId: planet.signId,
      signLabel: planet.signLabel,
      degree: originalPlanet?.degree ?? null,
      house: planet.house ?? null,
      safeHouse: planet.safeHouse,
      shadbala: shadbalaInfo?.shadbala ?? null
    };
  });

  // Create Shadbala table
  const shadbalaTable: ShadbalaTableRow[] = createShadbalaTable(shadbalaData);

  // Process dasha trees
  const vimshottariTree = raw.vimshottari ? processVimshottariTree(raw.vimshottari, fixes) : [];
  const yoginiTree = raw.yogini ? processYoginiTree(raw.yogini, fixes) : [];

  return {
    ascSignId: raw.ascSignId,
    ascSignLabel,
    planets,
    shadbalaTable,
    vimshottariTree,
    yoginiTree,
    mismatches,
    dashaFixes: fixes,
    lang
  };
}

/**
 * Helper function to get planet rows for display
 */
export function getPlanetRows(output: AstroOutput): Array<{
  planet: string;
  signLabel: string;
  house: number;
  degree: number | null;
  shadbalaTotal: number | null;
}> {
  return output.planets.map(planet => ({
    planet: planet.planet,
    signLabel: planet.signLabel,
    house: planet.safeHouse,
    degree: planet.degree,
    shadbalaTotal: planet.shadbala?.total ?? null
  }));
}

/**
 * Helper function to get dasha levels for rendering
 */
export function getDashaLevels(output: AstroOutput, type: "vimshottari" | "yogini"): Array<{
  level: string;
  blocks: Array<{
    name: string;
    lord: string;
    start: string;
    end: string;
    children?: any[];
  }>;
}> {
  const tree = type === "vimshottari" ? output.vimshottariTree : output.yoginiTree;
  
  // Group by level
  const levelMap = new Map<string, any[]>();
  
  function processBlocks(blocks: any[], depth = 0) {
    for (const block of blocks) {
      const level = block.level;
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level)!.push(block);
      
      if (block.children && block.children.length > 0) {
        processBlocks(block.children, depth + 1);
      }
    }
  }
  
  processBlocks(tree);
  
  return Array.from(levelMap.entries()).map(([level, blocks]) => ({
    level,
    blocks: blocks.map(block => ({
      name: block.name,
      lord: block.lord,
      start: block.start,
      end: block.end,
      children: block.children
    }))
  }));
}

/**
 * Helper function to get Vimshottari levels
 */
export function getVimshottariLevels(output: AstroOutput) {
  return getDashaLevels(output, "vimshottari");
}

/**
 * Helper function to get Yogini levels
 */
export function getYoginiLevels(output: AstroOutput) {
  return getDashaLevels(output, "yogini");
}

/**
 * Validate that the output is JSON-serializable
 */
export function validateOutputSerializable(output: AstroOutput): boolean {
  try {
    const serialized = JSON.stringify(output);
    const parsed = JSON.parse(serialized);
    return true;
  } catch {
    return false;
  }
}
