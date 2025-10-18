import { describe, it, expect } from "vitest";
import { deriveBundle } from "@/lib/astrology/derive";
import { detectAll } from "@/lib/astrology/detectors";
import { buildMockAstroData } from "@/lib/cards/compose";

describe("Bootstrap Flow Parity", () => {
  it("builds houses and detects gajakesari from normalized D1", () => {
    const asc = 2; // Taurus
    const d1 = [
      { planet: "Moon", signId: 10, signLabel: "Capricorn", house: 9, retro: false },
      { planet: "Jupiter", signId: 7, signLabel: "Libra", house: 6, retro: false }
    ] as any;
    
    const derived = deriveBundle(asc as any, d1);
    const yogas = detectAll(asc as any, d1);
    
    expect(derived.houses.length).toBe(12);
    expect(yogas.find(y => y?.key === "gajakesari")).toBeTruthy();
  });

  it("builds mock astro data with all required fields", () => {
    const params = {
      dob: "1990-01-01",
      tob: "12:00:00",
      lat: 27.7172,
      lon: 85.3240,
      tz: "Asia/Kathmandu",
      pob: "Kathmandu, Nepal"
    };

    const data = buildMockAstroData(params, "en");
    
    expect(data).toBeDefined();
    expect(data.profile?.birthDate).toBe("1990-01-01");
    expect(data.profile?.birthTime).toBe("12:00:00");
    expect(data.profile?.lat).toBe(27.7172);
    expect(data.profile?.lon).toBe(85.3240);
    expect(data.profile?.tz).toBe("Asia/Kathmandu");
    expect(data.profile?.pob).toBe("Kathmandu, Nepal");
    
    expect(data.ascSignId).toBe(1);
    expect(data.ascSignLabel).toBe("Aries");
    expect(data.d1).toHaveLength(9);
    expect(data.derived).toBeDefined();
    expect(data.derived.houses).toHaveLength(12);
    expect(data.derived.relations.length).toBeGreaterThan(0);
    expect(data.derived.strengths).toHaveLength(9);
    expect(data.yogas.length).toBeGreaterThan(0);
    expect(data.dashas.length).toBeGreaterThan(0);
    expect(data.yogini.length).toBeGreaterThan(0);
    expect(data.shadbala.length).toBeGreaterThan(0);
    expect(data.lang).toBe("en");
  });

  it("handles missing profile data gracefully", () => {
    const params = {
      dob: "",
      tob: "",
      lat: 0,
      lon: 0,
      tz: "",
      pob: ""
    };

    // This should not throw an error
    expect(() => buildMockAstroData(params, "en")).not.toThrow();
  });
});

