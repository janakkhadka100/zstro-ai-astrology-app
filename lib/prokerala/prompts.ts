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
