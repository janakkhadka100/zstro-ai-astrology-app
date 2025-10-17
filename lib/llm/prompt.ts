// lib/llm/prompt.ts
// LLM prompt system for cards-first astrology analysis

import { AstroData, D1PlanetRow } from "@/lib/astrology/types";
import { formatPlanetRow } from "@/lib/astrology/util";

export const systemPrompt = (lang: "ne"|"en") => (lang === "ne"
  ? `तलका ग्रह–राशी–घर तथ्यहरू Prokerala बाट आएका "स्रोत सत्य" हुन्। यीमा परिवर्तन/अनुमान नगर्नु। Transit घुसाउनु हुँदैन; केवल D1/D* कार्डमा देखिएको तथ्यका आधारमा विश्लेषण गर। ग्रह–घर वा राशीबारे प्रयोगकर्ताले जे भने पनि, cards facts मात्र मान्य।

महत्वपूर्ण नियमहरू:
1. केवल प्रदान गरिएका तथ्यहरू प्रयोग गर्नुहोस्
2. कुनै पनि ग्रह स्थिति अनुमान नगर्नुहोस्
3. Transit वा अन्य बाह्य जानकारी नघुसाउनुहोस्
4. यदि प्रयोगकर्ताले cards विरुद्ध कुरा भने, "cards facts prevail" भन्नुहोस्
5. Whole-sign house calculation मात्र प्रयोग गर्नुहोस्
6. स्पष्ट र संरचित उत्तर दिनुहोस्`
  : `Facts below (planet|sign|house) are the ONLY source-of-truth from Prokerala. Do not alter/guess facts. No transits. Analyze strictly from these cards.

Critical Rules:
1. Use ONLY the provided facts
2. Do not guess any planetary positions
3. Do not inject transits or external information
4. If user contradicts cards, respond "cards facts prevail"
5. Use whole-sign house calculation only
6. Provide clear and structured analysis`);

export function formatD1Rows(rows: D1PlanetRow[]): string {
  // Format: Planet|Sign|H#|R?
  return rows.map(r => formatPlanetRow(r.planet, r.signLabel, r.house, r.retro)).join("\n");
}

export function formatDivisionals(divisionals: AstroData['divisionals']): string {
  if (divisionals.length === 0) return "None";
  
  return divisionals.map(d => {
    const planets = d.planets.map(p => `${p.planet}|${p.signLabel}|H${p.house}`).join(", ");
    return `${d.type}: ${planets}`;
  }).join("\n");
}

export function formatYogas(yogas: AstroData['yogas']): string {
  if (yogas.length === 0) return "None detected";
  return yogas.map(y => `${y.label}${y.factors?.length ? ` (${y.factors.join(", ")})` : ""}`).join(", ");
}

export function formatDoshas(doshas: AstroData['doshas']): string {
  if (doshas.length === 0) return "None detected";
  return doshas.map(d => `${d.label}${d.factors?.length ? ` (${d.factors.join(", ")})` : ""}`).join(", ");
}

export function formatShadbala(shadbala: AstroData['shadbala']): string {
  if (shadbala.length === 0) return "No data";
  return shadbala.map(s => `${s.planet}:${s.value}${s.unit ? s.unit : ""}`).join(", ");
}

export function formatDashas(dashas: AstroData['dashas']): string {
  if (dashas.length === 0) return "No data";
  
  const currentDashas = dashas.filter(d => d.level === "current");
  const mahaDashas = dashas.filter(d => d.level === "maha").slice(0, 3); // Show next 3
  
  const current = currentDashas.map(d => `${d.system}: ${d.planet} (${d.from} to ${d.to})`).join(", ");
  const upcoming = mahaDashas.map(d => `${d.system}: ${d.planet} (${d.from} to ${d.to})`).join(", ");
  
  return `Current: ${current || "None"}\nUpcoming: ${upcoming || "None"}`;
}

export const userPrompt = (lang: "ne"|"en", data: AstroData, question: string) => {
  const header = lang === "ne"
    ? `# ग्रह–राशी–घर (D1)
${formatD1Rows(data.d1)}

# विभाजन चार्टहरू
${formatDivisionals(data.divisionals)}

# योगहरू
${formatYogas(data.yogas)}

# दोषहरू
${formatDoshas(data.doshas)}

# षड्बल (संक्षेप)
${formatShadbala(data.shadbala)}

# दशा
${formatDashas(data.dashas)}

प्रश्न:
${question}

निर्देश: लग्नबाट १२ भाव Whole-sign अनुसार गणना गर। तथ्य नबदल। केवल cards मा देखिएका तथ्यहरू प्रयोग गर।`
    : `# Planets D1
${formatD1Rows(data.d1)}

# Divisional Charts
${formatDivisionals(data.divisionals)}

# Yogas
${formatYogas(data.yogas)}

# Doshas
${formatDoshas(data.doshas)}

# Shadbala (Summary)
${formatShadbala(data.shadbala)}

# Dashas
${formatDashas(data.dashas)}

Question:
${question}

Instruction: Use whole-sign houses from ascendant. Do not modify facts. Use only facts visible in cards.`;

  return header;
};

export function buildPrompt(lang: "ne"|"en", data: AstroData, question: string): { system: string; user: string; combined: string } {
  const system = systemPrompt(lang);
  const user = userPrompt(lang, data, question);
  const combined = `[[SYSTEM]]\n${system}\n\n[[USER]]\n${user}`;
  
  return { system, user, combined };
}
