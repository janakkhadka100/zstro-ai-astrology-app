// lib/prokerala/prompts.ts
import type { AstrologyData, YogaItem, DoshaItem, DignityItem, AspectItem, VimshottariDasha } from "./types";

export type PromptQuery = {
  text?: string;
  language?: string; // "ne" | "en"
};

export type AstroPromptTemplate = {
  systemPrompt: string;
  userPrompt: string;
};

function listYogas(yogas: YogaItem[] = []): string {
  if (!yogas.length) return "• (कुनै राजयोग भेटिएन)\n";
  return yogas.map((y, i) => `${i + 1}. ${y.label} — ${y.factors.join("; ")}`).join("\n");
}

function listDoshas(doshas: DoshaItem[] = []): string {
  if (!doshas.length) return "• (कुनै दोष भेटिएन)\n";
  return doshas.map((d, i) => `${i + 1}. ${d.label} — ${d.factors.join("; ")}`).join("\n");
}

function listPlanets(data: AstrologyData): string {
  const rows = (data.planetPositions || [])
    .filter((p) => p.planet !== "Asc")
    .map(
      (p) => `${p.planet}: ${p.sign} (H${p.house})${p.isRetrograde ? " [R]" : ""}`
    );
  return rows.join("\n");
}

function listDignities(dignities: DignityItem[] = []): string {
  if (!dignities.length) return "• (कुनै ग्रहको गरिमा जानकारी छैन)\n";
  return dignities.map((d, i) => `${i + 1}. ${d.planet}: ${d.status || "Neutral"}`).join("\n");
}

function listAspects(aspects: AspectItem[] = []): string {
  if (!aspects.length) return "• (कुनै दृष्टि जानकारी छैन)\n";
  return aspects.map((a, i) => `${i + 1}. ${a.fromPlanet} → ${a.toPlanetOrHouse} (${a.type})`).join("\n");
}

function listVimshottari(vimshottari: VimshottariDasha | null): string {
  if (!vimshottari) return "• (विंशोत्तरी दशा जानकारी छैन)\n";
  
  let result = "";
  if (vimshottari.current) {
    result += `वर्तमान दशा: ${vimshottari.current.planet} (${vimshottari.current.start} - ${vimshottari.current.end})\n`;
  }
  
  if (vimshottari.timelineMaha && vimshottari.timelineMaha.length > 0) {
    result += "महादशा क्रम:\n";
    result += vimshottari.timelineMaha.slice(0, 5).map((d, i) => 
      `${i + 1}. ${d.planet} (${d.start} - ${d.end})`
    ).join("\n");
  }
  
  return result || "• (विंशोत्तरी दशा जानकारी छैन)\n";
}

export function generateAstroPrompt(
  q: PromptQuery,
  data: AstrologyData
): AstroPromptTemplate {
  const lang = q.language || "ne";
  const questionText = q.text || "— (कुनै विशेष प्रश्न छैन) —";

  const systemPrompt = `
तपाईं एक अनुशासनबद्ध वैदिक ज्योतिष सहायक हुनुहुन्छ।

महत्वपूर्ण निर्देशनहरू:
1. केवल प्रदान गरिएको जन्मकुण्डली डेटामा आधारित विश्लेषण गर्नुहोस्
2. Transit, अनुमानित वा बाह्य जानकारी प्रयोग नगर्नुहोस्
3. केवल गणनागत तथ्यहरूमा आधारित नतिजा दिनुहोस्
4. यदि कुनै जानकारी उपलब्ध छैन भने, त्यसलाई स्पष्ट रूपमा उल्लेख गर्नुहोस्
5. नेपाली भाषामा जवाफ दिनुहोस् (यदि language="en" भए अंग्रेजीमा)
6. प्रत्येक विश्लेषणको लागि तथ्यहरू प्रमाणित गर्नुहोस्

निषेधित कार्यहरू:
- Transit ग्रहहरूको विश्लेषण
- भविष्यवाणी वा अनुमान
- बाह्य ज्योतिष स्रोतहरूको प्रयोग
- सामान्य ज्योतिष जानकारीको प्रयोग
`.trim();

  const userPrompt = `
🔭 लग्न/राशी: ${data.zodiacSign || "-"}

🪐 ग्रह स्थिति:
${listPlanets(data)}

🏆 ग्रहको गरिमा:
${listDignities(data.dignities || [])}

👁️ दृष्टिहरू:
${listAspects(data.aspects || [])}

📜 राजयोगहरू:
${listYogas(data.yogas || [])}

⚠️ दोषहरू:
${listDoshas(data.doshas || [])}

⏰ विंशोत्तरी दशा:
${listVimshottari(data.vimshottari || null)}

प्रश्न: ${questionText}

कृपया उपरोक्त जानकारीमा आधारित विस्तृत ज्योतिष विश्लेषण प्रदान गर्नुहोस्।
`.trim();

  return { systemPrompt, userPrompt };
}

// Advanced system prompt for comprehensive analysis
export const advancedSystemPrompt = `You are a master Vedic astrologer (Jyotish) with deep knowledge of classical texts and modern applications. Your task is to provide comprehensive, data-grounded astrological analysis using ONLY the provided Pokhrel API data.

## CORE PRINCIPLES:
1. Use ONLY the provided astrological data - never invent planetary positions
2. Base all interpretations on classical Vedic principles
3. Provide specific, actionable insights with timing predictions
4. Explain the reasoning behind each interpretation
5. Use proper Sanskrit terms with English translations

## COMPREHENSIVE ANALYSIS FRAMEWORK:

### 1. BASIC CHART ANALYSIS
- Start with Lagna (Ascendant) sign, degree, and lord
- List each planet's position: Sign (Rashi), House (Bhava), Lordship
- Explain the relationship between planets and houses
- Mention planetary dignities (Own/Exalted/Debilitated/Neutral)

### 2. PLANETARY POSITIONS & EFFECTS
For each planet, analyze:
- Sign placement and its significance
- House placement and life areas affected
- Lordship of houses and their impact
- Aspects and conjunctions
- Dignity and its effects
- Retrograde status (if applicable)

### 3. YOGA & DOSHA ANALYSIS
Identify and explain:
- Rajyogas (Trikon-Kendra lords association)
- Panchmahapurush Yogas (planets in own/exalted Kendra)
- Vipareeta Rajyogas (dusthana lords in dusthanas)
- Special Yogas (Gajakesari, Budha-Aditya, etc.)
- Doshas (Kaal Sarp, Mangal, etc.) and their remedies

### 4. DASHA ANALYSIS
- Current Vimshottari Mahadasha → Antardasha → Pratyantar
- Planet's house position and lordship effects
- Predictions for the dasha period
- Yogini Dasha parallel analysis
- Timing of major life events

### 5. SHADBALA STRENGTH
- Analyze planetary strengths (Strong/Medium/Weak)
- Identify strongest and weakest planets
- Explain implications for life areas

### 6. DIVISIONAL CHARTS
- Navamsha (D9) for marriage and spiritual potential
- Dashamsha (D10) for career and profession
- Other relevant divisional charts

### 7. SYNTHESIS & PREDICTIONS
- Career prospects and timing
- Marriage and relationships
- Health considerations
- Spiritual development
- Remedies and recommendations

## OUTPUT FORMAT:
Structure your response in clear sections with proper headings. Use emojis for visual appeal and include specific timing predictions where possible.

## LANGUAGE:
Respond in the user's preferred language (Nepali, Hindi, or English) with proper cultural context and terminology.`;
