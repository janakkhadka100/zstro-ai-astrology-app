"use client";

import React from 'react';

/**
 * VEDIC ASTROLOGY EXPLAINER - STRICT RULES
 * 
 * RULES:
 * 1) Always use `safeHouse` for house-based reading. Ignore `house` if it conflicts.
 * 2) Never invent dasha; list exactly as provided
 * 3) Planet lines format: "ग्रह — राशि (घर नम्बर) | डिग्री: X° | षड्बल: Total=…"
 * 4) If mismatches[] is non-empty, add note: "API house mismatch पाइयो; house=derived प्रयोग गरिएको छ।"
 * 5) Organized headings: लग्न, ग्रह-स्थिती, षड्बल सारांश, विम्शोत्तरी दशा, योगिनी दशा, टिप्पणी
 * 6) DO NOT claim events beyond data; DO NOT change dates; DO NOT add/subtract dashas
 */

// Types matching the EXACT pipeline JSON structure
interface ShadbalaData {
  total: number;
  sthana: number;
  dig: number;
  kala: number;
  chestha: number;
  naisargika: number;
}

interface Planet {
  planet: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
  signId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  signLabel: string;
  degree: number | null;
  house: number | null;        // raw from API
  safeHouse: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;  // CORRECTED house from pipeline (use this!)
  shadbala: ShadbalaData | null;
}

interface DashaBlock {
  name: string;
  lord: string;
  start: string;  // ISO UTC
  end: string;    // ISO UTC
  level: string;
  children?: DashaBlock[];
}

interface Mismatch {
  planet: string;
  apiHouse: number;
  derivedHouse: number;
}

interface AstroPipelineData {
  ascSignId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  ascSignLabel: string;
  planets: Planet[];
  vimshottariTree: DashaBlock[];
  yoginiTree: DashaBlock[];
  lang: "ne" | "en";
  mismatches: Mismatch[];
  dashaFixes: string[];
}

interface VedicExplainerProps {
  data: AstroPipelineData;
}

export default function VedicExplainer({ data }: VedicExplainerProps) {
  const { ascSignId, ascSignLabel, planets, vimshottariTree, yoginiTree, lang, mismatches, dashaFixes } = data;
  const isNepali = lang === "ne";

  // Helper function to format dates
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return isNepali 
        ? date.toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' })
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return isoString; // fallback to raw string
    }
  };

  // Helper function to format planet line (STRICT RULE 3)
  const formatPlanetLine = (planet: Planet): string => {
    const { planet: name, signLabel, safeHouse, degree, shadbala } = planet;
    
    // Always use safeHouse (RULE 1)
    let line = `${name} — ${signLabel} (घर नम्बर ${safeHouse})`;
    
    if (degree !== null) {
      line += ` | डिग्री: ${degree.toFixed(2)}°`;
    }
    
    if (shadbala) {
      line += ` | षड्बल: Total=${shadbala.total.toFixed(2)}, स्थाना=${shadbala.sthana.toFixed(2)}, दिग=${shadbala.dig.toFixed(2)}, काल=${shadbala.kala.toFixed(2)}, चेष्टा=${shadbala.chestha.toFixed(2)}, नैसर्गिक=${shadbala.naisargika.toFixed(2)}`;
    } else {
      line += ` | षड्बल: उपलब्ध छैन`;
    }
    
    return line;
  };

  // Helper function to render dasha tree (STRICT RULE 2 - Never invent dasha)
  const renderDashaTree = (dashas: DashaBlock[], level: number = 0): React.ReactNode => {
    if (!dashas || dashas.length === 0) return null;

    return (
      <ul className={`ml-${level * 4} space-y-1`}>
        {dashas.map((dasha, index) => (
          <li key={index} className="text-sm">
            <span className="font-medium">{dasha.name}</span> ({dasha.lord}) — {formatDate(dasha.start)} देखि {formatDate(dasha.end)} सम्म
            {dasha.children && dasha.children.length > 0 && (
              <div className="mt-1">
                {renderDashaTree(dasha.children, level + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg" style={{ fontFamily: isNepali ? 'Noto Sans Devanagari, sans-serif' : 'Inter, sans-serif' }}>
      {/* लग्न/Ascendant (RULE 5) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isNepali ? "लग्न" : "Ascendant"}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {ascSignLabel} (घर नम्बर {ascSignId})
        </p>
      </div>

      {/* ग्रह-स्थिती/Planet Positions (RULE 5) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isNepali ? "ग्रह-स्थिती" : "Planet Positions"}
        </h3>
        <div className="space-y-2">
          {planets.map((planet, index) => (
            <div key={index} className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              {formatPlanetLine(planet)}
            </div>
          ))}
        </div>
        
        {/* RULE 4: API house mismatch note */}
        {mismatches.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
            API house mismatch पाइयो; house=derived (लग्नबाट गणना) प्रयोग गरिएको छ।
          </div>
        )}
      </div>

      {/* षड्बल सारांश/Shadbala Summary (RULE 5) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isNepali ? "षड्बल सारांश" : "Shadbala Summary"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planets.map((planet, index) => (
            <div key={index} className="border rounded p-3 bg-gray-50 dark:bg-gray-700">
              <div className="font-medium text-gray-900 dark:text-gray-100">{planet.planet}</div>
              {planet.shadbala ? (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <div>Total: {planet.shadbala.total.toFixed(2)}</div>
                  <div>स्थाना: {planet.shadbala.sthana.toFixed(2)}</div>
                  <div>दिग: {planet.shadbala.dig.toFixed(2)}</div>
                  <div>काल: {planet.shadbala.kala.toFixed(2)}</div>
                  <div>चेष्टा: {planet.shadbala.chestha.toFixed(2)}</div>
                  <div>नैसर्गिक: {planet.shadbala.naisargika.toFixed(2)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isNepali ? "षड्बल: उपलब्ध छैन" : "Shadbala: Not available"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* विम्शोत्तरी दशा/Vimshottari Dasha (RULE 5) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isNepali ? "विम्शोत्तरी दशा" : "Vimshottari Dasha"}
        </h3>
        {vimshottariTree && vimshottariTree.length > 0 ? (
          renderDashaTree(vimshottariTree)
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            {isNepali ? "विम्शोत्तरी दशा: उपलब्ध छैन" : "Vimshottari Dasha: Not available"}
          </p>
        )}
      </div>

      {/* योगिनी दशा/Yogini Dasha (RULE 5) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isNepali ? "योगिनी दशा" : "Yogini Dasha"}
        </h3>
        {yoginiTree && yoginiTree.length > 0 ? (
          renderDashaTree(yoginiTree)
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            {isNepali ? "योगिनी दशा: उपलब्ध छैन" : "Yogini Dasha: Not available"}
          </p>
        )}
      </div>

      {/* टिप्पणी/Notes (RULE 5) - Only show if there are actual issues */}
      {(mismatches.length > 0 || dashaFixes.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {isNepali ? "टिप्पणी" : "Notes"}
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {dashaFixes.length > 0 && (
              <div>
                <p className="font-medium mb-1">
                  {isNepali ? "दशा सुधारहरू:" : "Dasha fixes:"}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {dashaFixes.map((fix, index) => (
                    <li key={index}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}