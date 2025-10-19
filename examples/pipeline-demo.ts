import { buildAstroOutput, getPlanetRows, getVimshottariLevels, getYoginiLevels } from '../lib/astrology/pipeline';
import type { AstroInput } from '../lib/astrology/schemas';

// Example usage of the deterministic astrology pipeline
export function demonstratePipeline() {
  // Sample input data
  const sampleInput: AstroInput = {
    ascSignId: 2, // Taurus
    ascSignLabel: "Taurus",
    d1: [
      {
        planet: "Sun",
        signId: 9, // Sagittarius
        signLabel: "Sagittarius",
        degree: 245.5,
        house: 7, // API says 7, but derived should be 8
        shadbala: {
          total: 150.25,
          sthana: 45.5,
          dig: 30.2,
          kala: 25.8,
          chestha: 20.1,
          naisargika: 28.65
        }
      },
      {
        planet: "Moon",
        signId: 4, // Cancer
        degree: 95.3,
        house: 3, // Matches derived
        shadbala: {
          total: 180.75,
          sthana: 50.2,
          dig: 35.1,
          kala: 30.5,
          chestha: 25.8,
          naisargika: 39.15
        }
      },
      {
        planet: "Mars",
        signId: 1, // Aries
        degree: 12.8,
        house: null, // No API house, will use derived
        shadbala: null // No shadbala data
      }
    ],
    vimshottari: [
      {
        name: "Sun",
        lord: "Sun",
        start: "2020-01-01T00:00:00.000Z",
        end: "2026-01-01T00:00:00.000Z",
        level: "MAHA",
        children: [
          {
            name: "Moon",
            lord: "Moon",
            start: "2020-01-01T00:00:00.000Z",
            end: "2021-01-01T00:00:00.000Z",
            level: "ANTAR"
          },
          {
            name: "Mars",
            lord: "Mars",
            start: "2021-01-01T00:00:00.000Z",
            end: "2022-01-01T00:00:00.000Z",
            level: "ANTAR"
          }
        ]
      }
    ],
    yogini: [
      {
        name: "Sankata",
        lord: "Rahu",
        start: "2020-01-01T00:00:00.000Z",
        end: "2021-01-01T00:00:00.000Z",
        level: "YOGINI"
      }
    ],
    lang: "en"
  };

  // Process the input through the pipeline
  const output = buildAstroOutput(sampleInput);

  console.log("=== DETERMINISTIC ASTROLOGY PIPELINE OUTPUT ===");
  console.log("\n1. BASIC INFO:");
  console.log(`Ascendant: ${output.ascSignLabel} (House ${output.ascSignId})`);
  console.log(`Language: ${output.lang}`);

  console.log("\n2. PLANET POSITIONS:");
  const planetRows = getPlanetRows(output);
  planetRows.forEach(planet => {
    console.log(`${planet.planet}: ${planet.signLabel} (House ${planet.house}) - ${planet.degree}° - Shadbala: ${planet.shadbalaTotal || 'N/A'}`);
  });

  console.log("\n3. HOUSE MISMATCHES:");
  if (output.mismatches.length > 0) {
    output.mismatches.forEach(mismatch => {
      console.log(`${mismatch.planet}: API house ${mismatch.apiHouse} vs Derived house ${mismatch.derivedHouse}`);
    });
  } else {
    console.log("No house mismatches detected");
  }

  console.log("\n4. SHADBALA TABLE:");
  output.shadbalaTable.forEach(row => {
    console.log(`${row.planet}: Total=${row.total}, Sthana=${row.sthana}, Dig=${row.dig}, Kala=${row.kala}, Cheshta=${row.chestha}, Naisargika=${row.naisargika}`);
  });

  console.log("\n5. VIMSHOTTARI DASHA:");
  const vimshottariLevels = getVimshottariLevels(output);
  vimshottariLevels.forEach(level => {
    console.log(`\n${level.level} Level:`);
    level.blocks.forEach(block => {
      console.log(`  ${block.name} (${block.lord}): ${block.start} to ${block.end}`);
    });
  });

  console.log("\n6. YOGINI DASHA:");
  const yoginiLevels = getYoginiLevels(output);
  yoginiLevels.forEach(level => {
    console.log(`\n${level.level} Level:`);
    level.blocks.forEach(block => {
      console.log(`  ${block.name} (${block.lord}): ${block.start} to ${block.end}`);
    });
  });

  console.log("\n7. DASHA FIXES:");
  if (output.dashaFixes.length > 0) {
    output.dashaFixes.forEach(fix => {
      console.log(`- ${fix}`);
    });
  } else {
    console.log("No dasha fixes applied");
  }

  console.log("\n8. JSON SERIALIZATION TEST:");
  try {
    const serialized = JSON.stringify(output);
    console.log("✅ Output is JSON-serializable");
    console.log(`Size: ${serialized.length} characters`);
  } catch (error) {
    console.log("❌ JSON serialization failed:", error);
  }

  return output;
}

// Run the demonstration
if (require.main === module) {
  demonstratePipeline();
}
