import React from 'react';
import VedicExplainer from '../components/astro/VedicExplainer';

// Example pipeline output data matching the EXACT format
const samplePipelineData = {
  ascSignId: 2 as const, // Taurus
  ascSignLabel: "Taurus",
  planets: [
    {
      planet: "Sun" as const,
      signId: 9 as const, // Sagittarius
      signLabel: "Sagittarius",
      degree: 245.5,
      house: 7, // API says 7, but derived should be 8
      safeHouse: 8 as const, // CORRECTED house from pipeline (use this!)
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
      planet: "Moon" as const,
      signId: 4 as const, // Cancer
      signLabel: "Cancer",
      degree: 95.3,
      house: 3, // Matches derived
      safeHouse: 3 as const,
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
      planet: "Mars" as const,
      signId: 1 as const, // Aries
      signLabel: "Aries",
      degree: 12.8,
      house: null, // No API house
      safeHouse: 12 as const, // Derived house
      shadbala: null // No shadbala data
    }
  ],
  vimshottariTree: [
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
  yoginiTree: [
    {
      name: "Sankata",
      lord: "Rahu",
      start: "2020-01-01T00:00:00.000Z",
      end: "2021-01-01T00:00:00.000Z",
      level: "YOGINI"
    }
  ],
  lang: "ne" as const,
  mismatches: [
    {
      planet: "Sun",
      apiHouse: 7,
      derivedHouse: 8
    }
  ],
  dashaFixes: [
    "Trimmed children of Sun to fit parent bounds"
  ]
};

export default function VedicExplainerDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Vedic Astrology Explainer Demo
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Strict Rules Applied:
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✅ Always use <code>safeHouse</code> for house-based reading</li>
            <li>✅ Never invent dasha; list exactly as provided</li>
            <li>✅ Planet lines format: "ग्रह — राशि (घर नम्बर) | डिग्री: X° | षड्बल: Total=…"</li>
            <li>✅ API house mismatch note when applicable</li>
            <li>✅ Organized headings: लग्न, ग्रह-स्थिती, षड्बल सारांश, विम्शोत्तरी दशा, योगिनी दशा, टिप्पणी</li>
            <li>✅ No claims beyond data; no date changes; no dasha additions</li>
          </ul>
        </div>

        <VedicExplainer data={samplePipelineData} />
      </div>
    </div>
  );
}
