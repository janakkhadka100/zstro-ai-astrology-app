// Jest test file
import { buildAstroOutput, getPlanetRows, getVimshottariLevels, getYoginiLevels } from '../../lib/astrology/pipeline';
import { computeHouseFromAsc, processPlanetHouses } from '../../lib/astrology/house-derivation';
import { normalizeShadbala } from '../../lib/astrology/shadbala-normalization';
import { processVimshottariTree, processYoginiTree } from '../../lib/astrology/dasha-trees';
import { getSignLabel } from '../../lib/astrology/labels';
import type { AstroInput } from '../../lib/astrology/schemas';

describe('Astrology Pipeline', () => {
  describe('House Derivation', () => {
    it('should compute correct houses for Taurus ascendant', () => {
      // Taurus asc (2), Sun/Mars in Sagittarius (9) -> house 8
      const house = computeHouseFromAsc(9, 2);
      expect(house).toBe(8);
    });

    it('should compute correct houses for Saturn in Aquarius with Taurus asc', () => {
      // Taurus asc (2), Saturn in Aquarius (11) -> house 10
      const house = computeHouseFromAsc(11, 2);
      expect(house).toBe(10);
    });

    it('should track mismatches when API house differs from derived', () => {
      const planets = [
        { planet: "Sun" as const, signId: 9 as const, house: 7 }, // API says house 7, derived would be 8
        { planet: "Moon" as const, signId: 4 as const, house: 3 }  // API matches derived (house 3)
      ];
      
      const { mismatches } = processPlanetHouses(planets, 2); // Taurus asc
      
      expect(mismatches).toHaveLength(1);
      expect(mismatches[0]).toEqual({
        planet: "Sun",
        apiHouse: 7,
        derivedHouse: 8
      });
    });

    it('should use derived house when API house is invalid', () => {
      const planets = [
        { planet: "Sun" as const, signId: 9 as const, house: null },
        { planet: "Moon" as const, signId: 4 as const, house: 15 } // Invalid house
      ];
      
      const { processedPlanets } = processPlanetHouses(planets, 2);
      
      expect(processedPlanets[0].safeHouse).toBe(8); // Derived
      expect(processedPlanets[1].safeHouse).toBe(3); // Derived
    });
  });

  describe('Shadbala Normalization', () => {
    it('should round values to 2 decimal places', () => {
      const input = {
        total: 150.256789,
        sthana: 45.123456,
        dig: 30.987654,
        kala: 25.111111,
        chestha: 20.999999,
        naisargika: 28.000001
      };
      
      const result = normalizeShadbala(input, "Sun");
      
      expect(result?.total).toBe(150.26);
      expect(result?.sthana).toBe(45.12);
      expect(result?.dig).toBe(30.99);
    });

    it('should clamp negative values to 0', () => {
      const input = {
        total: -10,
        sthana: -5,
        dig: 30,
        kala: 25,
        chestha: 20,
        naisargika: 28
      };
      
      const result = normalizeShadbala(input, "Sun");
      
      expect(result?.total).toBe(0);
      expect(result?.sthana).toBe(0);
      expect(result?.dig).toBe(30);
    });

    it('should compute total when missing', () => {
      const input = {
        sthana: 45,
        dig: 30,
        kala: 25,
        chestha: 20,
        naisargika: 28
      };
      
      const result = normalizeShadbala(input, "Sun");
      
      expect(result?.total).toBe(148); // Sum of subscores
    });
  });

  describe('Dasha Tree Processing', () => {
    it('should validate ISO timestamps', () => {
      const validBlock = {
        name: "Test",
        lord: "Sun",
        start: "2020-01-01T00:00:00.000Z",
        end: "2021-01-01T00:00:00.000Z",
        level: "MAHA" as const
      };
      
      const fixes: string[] = [];
      const result = processVimshottariTree([validBlock], fixes);
      
      expect(result).toHaveLength(1);
      expect(fixes).toHaveLength(0);
    });

    it('should handle invalid timestamps', () => {
      const invalidBlock = {
        name: "Test",
        lord: "Sun",
        start: "invalid-date",
        end: "2021-01-01T00:00:00.000Z",
        level: "MAHA" as const
      };
      
      const fixes: string[] = [];
      const result = processVimshottariTree([invalidBlock], fixes);
      
      expect(result).toHaveLength(0);
      expect(fixes.length).toBeGreaterThan(0);
    });

    it('should trim children to fit parent bounds', () => {
      const parent = {
        name: "Parent",
        lord: "Sun",
        start: "2020-01-01T00:00:00.000Z",
        end: "2021-01-01T00:00:00.000Z",
        level: "MAHA" as const,
        children: [
          {
            name: "Child1",
            lord: "Moon",
            start: "2019-12-01T00:00:00.000Z", // Before parent
            end: "2020-06-01T00:00:00.000Z",
            level: "ANTAR" as const
          },
          {
            name: "Child2",
            lord: "Mars",
            start: "2020-06-01T00:00:00.000Z",
            end: "2022-01-01T00:00:00.000Z", // After parent
            level: "ANTAR" as const
          }
        ]
      };
      
      const fixes: string[] = [];
      const result = processVimshottariTree([parent], fixes);
      
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(2);
      expect(fixes.length).toBeGreaterThan(0);
      
      // Check that children were trimmed
      const child1 = result[0].children![0];
      const child2 = result[0].children![1];
      expect(child1.start).toBe("2020-01-01T00:00:00.000Z"); // Trimmed to parent start
      expect(child2.end).toBe("2021-01-01T00:00:00.000Z"); // Trimmed to parent end
    });
  });

  describe('Label Generation', () => {
    it('should generate English labels', () => {
      expect(getSignLabel(1, "en")).toBe("Aries");
      expect(getSignLabel(12, "en")).toBe("Pisces");
    });

    it('should generate Nepali labels', () => {
      expect(getSignLabel(1, "ne")).toBe("मेष");
      expect(getSignLabel(12, "ne")).toBe("मीन");
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should process complete astro input', () => {
      const input: AstroInput = {
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
            house: 3 // Matches derived
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

      const output = buildAstroOutput(input);

      // Verify basic structure
      expect(output.ascSignId).toBe(2);
      expect(output.ascSignLabel).toBe("Taurus");
      expect(output.planets).toHaveLength(2);
      expect(output.vimshottariTree).toHaveLength(1);
      expect(output.yoginiTree).toHaveLength(1);

      // Verify house derivation
      expect(output.planets[0].safeHouse).toBe(7); // API house (valid)
      expect(output.planets[1].safeHouse).toBe(3); // Matches API

      // Verify mismatch tracking
      expect(output.mismatches).toHaveLength(1);
      expect(output.mismatches[0].planet).toBe("Sun");
      expect(output.mismatches[0].apiHouse).toBe(7);
      expect(output.mismatches[0].derivedHouse).toBe(8);

      // Verify Shadbala processing
      expect(output.shadbalaTable).toHaveLength(1);
      expect(output.shadbalaTable[0].planet).toBe("Sun");
      expect(output.shadbalaTable[0].total).toBe(150.25);

      // Verify JSON serialization
      expect(() => JSON.stringify(output)).not.toThrow();
    });

    it('should handle empty input gracefully', () => {
      const input: AstroInput = {
        ascSignId: 1,
        d1: [],
        lang: "en"
      };

      const output = buildAstroOutput(input);

      expect(output.ascSignId).toBe(1);
      expect(output.ascSignLabel).toBe("Aries");
      expect(output.planets).toHaveLength(0);
      expect(output.shadbalaTable).toHaveLength(0);
      expect(output.vimshottariTree).toHaveLength(0);
      expect(output.yoginiTree).toHaveLength(0);
      expect(output.mismatches).toHaveLength(0);
      expect(output.dashaFixes).toHaveLength(0);
    });
  });

  describe('Helper Functions', () => {
    it('should generate planet rows for display', () => {
      const output = buildAstroOutput({
        ascSignId: 1,
        d1: [
          {
            planet: "Sun",
            signId: 1,
            degree: 15.5,
            shadbala: {
              total: 150.25,
              sthana: 45.5,
              dig: 30.2,
              kala: 25.8,
              chestha: 20.1,
              naisargika: 28.65
            }
          }
        ],
        lang: "en"
      });

      const planetRows = getPlanetRows(output);

      expect(planetRows).toHaveLength(1);
      expect(planetRows[0]).toEqual({
        planet: "Sun",
        signLabel: "Aries",
        house: 1,
        degree: 15.5,
        shadbalaTotal: 150.25
      });
    });

    it('should generate dasha levels for rendering', () => {
      const output = buildAstroOutput({
        ascSignId: 1,
        d1: [],
        vimshottari: [
          {
            name: "Sun",
            lord: "Sun",
            start: "2020-01-01T00:00:00.000Z",
            end: "2026-01-01T00:00:00.000Z",
            level: "MAHA"
          }
        ],
        lang: "en"
      });

      const vimshottariLevels = getVimshottariLevels(output);

      expect(vimshottariLevels).toHaveLength(1);
      expect(vimshottariLevels[0].level).toBe("MAHA");
      expect(vimshottariLevels[0].blocks).toHaveLength(1);
      expect(vimshottariLevels[0].blocks[0].name).toBe("Sun");
    });
  });
});
