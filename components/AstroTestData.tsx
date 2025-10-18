"use client";
import { buildAstroPrompt } from "@/lib/astro-prompt";
import { HouseMismatchNotice } from "./HouseMismatchNotice";

export function AstroTestData() {
  // Test data: सूर्य/मङ्गल ८औँ, शनि १०औँ
  const testData = {
    ascSignId: 2, // वृष
    ascSignLabel: "वृष",
    d1: [
      { planet: "Sun",   signId: 9, signLabel: "धनु",  house: null },
      { planet: "Mars",  signId: 9, signLabel: "धनु",  house: null },
      { planet: "Saturn",signId: 11,signLabel: "कुम्भ", house: null },
      { planet: "Moon",  signId: 10,signLabel: "मकर",  house: null },
    ],
    lang: "ne",
  };

  const { aiInput, mismatches } = buildAstroPrompt(testData);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Data Results:</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Ascendant:</strong> {aiInput.ascSignLabel} ({aiInput.ascSignId})</div>
        <div><strong>Planets:</strong></div>
        <ul className="ml-4 space-y-1">
          {aiInput.planets.map((p, i) => (
            <li key={i}>
              {p.planet} — {p.signLabel} ({p.house}औँ घर)
            </li>
          ))}
        </ul>
        <HouseMismatchNotice mismatches={mismatches} />
      </div>
    </div>
  );
}
