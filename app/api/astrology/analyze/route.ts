import { NextResponse } from "next/server";
import { buildAstroPrompt } from "@/lib/astro-prompt";

// Vedic Astrology Analysis System Prompt
const VEDIC_ANALYSIS_PROMPT = `You are a Vedic astrology analyst. 
STRICT RULES — FOLLOW EXACTLY:

1) INPUT FORMAT (JSON you'll receive):
{
  "ascSignId": 1-12,                    // Ascendant sign id (1=Aries ... 12=Pisces)
  "ascSignLabel": "मेष" | "वृष" | ...,
  "planets": [                          // D1 positions
    {
      "planet": "Sun"|"Moon"|"Mars"|"Mercury"|"Jupiter"|"Venus"|"Saturn"|"Rahu"|"Ketu",
      "signId": 1-12,                   // Rashi id of the planet
      "signLabel": "राशि-नाम",
      "degree": number,                 // optional
      "house": 1-12 | null              // may be null; if null you must compute from ascSignId+signId
    },
    ...
  ],
  "yogas": [ { "key": string, "label": string, "factors": string[] } ],
  "doshas": [ { "key": string, "label": string, "factors": string[] } ],
  "lang": "ne" | "en"
}

2) HOUSE COMPUTATION:
- Always use \`planet.house\` if provided and 1..12.
- If \`planet.house\` is missing or invalid, compute RELATIVE HOUSE from ascendant:
  // house = ((signId - ascSignId + 12) % 12) + 1
- Never equate sign == house. Use the above formula when needed.

3) REPORTING POLICY:
- Your analysis MUST be from house-based placement (e.g., "Sun in 8th house (Dhanu)").
- NEVER invent yogas/doshas not derivable from the provided data. 
- If a yoga/dosha is listed, explain it concisely and only once.
- When placements contradict (e.g., house computed ≠ provided), state "API mismatch detected" and prefer the computed house.

4) OUTPUT STRUCTURE (depending on lang):
- If lang==="ne": respond in Nepali; else English.
- Headings: Lagna, Moon sign, Planet placements (as a table-like bullet list), Yog/Dosh summary, Dasha overview (optional if not provided), Guidance.
- For each planet: "ग्रह — राशि (घर नम्बर)" e.g., "सूर्य — धनु (८औँ घर)".
- Keep it factual, concise, and strictly data-driven.

5) STYLE:
- No astrological claims beyond data (no hallucinations).
- If any key fields missing, clearly say what is missing (e.g., birth time) and limit conclusions.

6) EXAMPLE LINE:
- "सूर्य — धनु (८औँ घर): रूपान्तरण, गहिरो अनुसन्धान, ऋण/विमा/कर सम्बन्धी चेतना।"`;

export async function POST(request: Request) {
  try {
    const rawApiData = await request.json();
    
    // Normalize the data and build AI prompt
    const { aiInput, mismatches } = buildAstroPrompt(rawApiData);
    
    // For now, return the normalized data and mismatches
    // In a real implementation, you would send this to an AI service
    return NextResponse.json({
      success: true,
      normalizedData: aiInput,
      mismatches,
      analysis: {
        // This would be the AI-generated analysis
        lagna: `${aiInput.ascSignLabel} (${aiInput.ascSignId})`,
        moonSign: aiInput.planets.find(p => p.planet === "Moon")?.signLabel || "Unknown",
        planetPlacements: aiInput.planets.map(p => ({
          planet: p.planet,
          sign: p.signLabel,
          house: p.house,
          description: `${p.planet} in ${p.house}th house (${p.signLabel})`
        })),
        yogas: aiInput.yogas,
        doshas: aiInput.doshas,
        hasMismatches: mismatches.length > 0
      }
    });
  } catch (error) {
    console.error("Error in astrology analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze astrology data" },
      { status: 500 }
    );
  }
}
