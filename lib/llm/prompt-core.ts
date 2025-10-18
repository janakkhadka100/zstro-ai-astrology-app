// lib/llm/prompt-core.ts
// Core LLM prompting system for cards-only reasoning

import { AstroData } from '@/lib/astrology/types';
import { getHouseSignificance, isKendra, isKona, isTrik } from '@/lib/astrology/derive';

export const systemPrompt = (lang: "ne" | "en") => lang === "ne"
  ? `तलका कार्डहरू (D1, घर/मालिक/राशी, दृष्टि, सम्बन्ध, बल, दशा, योग/दोष) "स्रोत सत्य" हुन्। यिनै तथ्यबाट मात्र उत्तर देऊ। कुनै तथ्य कार्डमा नभए "DataNeeded: <scopes>" भनेर पहिलो लाइनमा लेख।

निर्देश:
- प्रश्नसँग सम्बन्धित घर/मालिक/राशी/दृष्टि/बल/सम्बन्ध उद्धृत गर्दै step-by-step कारण देऊ
- राजयोग/दोषको स्पष्ट "किन?" कारण बताऊ
- कार्डबाहिर कुनै अनुमान नगर
- केवल दिइएका तथ्यहरूबाट मात्र विश्लेषण गर`
  : `Cards below are the only source of truth. Answer strictly from them. If something is missing, first line "DataNeeded: <scopes>".

Instructions:
- Quote relevant houses/lords/signs/aspects/strengths/relations step-by-step
- Explain WHY for Rajyogas/Doshas clearly
- No speculation beyond card facts
- Analyze only from provided facts`;

export function userPrompt(lang: "ne" | "en", data: AstroData, question: string): string {
  const isNepali = lang === "ne";
  
  // D1 Planets
  const d1 = data.d1.map(r => 
    `${r.planet}|${r.signLabel}|H${r.house}${r.retro ? "|R" : ""}`
  ).join("\n");

  // House Analysis
  const houses = data.derived?.houses?.map(h => {
    const significance = getHouseSignificance(h.house, lang);
    const type = isKendra(h.house) ? (isNepali ? "केन्द्र" : "Kendra") :
                 isKona(h.house) ? (isNepali ? "कोण" : "Kona") :
                 isTrik(h.house) ? (isNepali ? "त्रिक" : "Trik") : "";
    
    return `H${h.house}:${h.signLabel} lord=${h.lord} occ=[${h.occupants.join(",") || "-"}] asp=[${h.aspectsFrom.map(a => a.planet).join(",") || "-"}] pow=${h.aspectPower.toFixed(1)} ${type} (${significance})`;
  }).join("\n") || "";

  // Planetary Strengths
  const strengths = data.derived?.strengths?.map(s => 
    `${s.planet}:${s.normalized || ""}/${s.dignity || ""}${s.shadbala ? ` (${s.shadbala.toFixed(1)})` : ""}`
  ).join(", ") || "";

  // Planetary Relations
  const relations = data.derived?.relations?.map(r => 
    `${r.a}↔${r.b}:${r.natural}${r.contextual ? `(${r.contextual})` : ""}`
  ).join(", ") || "";

  // Yogas with WHY
  const yogas = (data.yogas || []).map((y: any) => 
    y.why ? `${y.label} (किन: ${y.why})` : y.label
  ).join("; ");

  // Doshas with WHY
  const doshas = (data.doshas || []).map((d: any) => 
    d.why ? `${d.label} (किन: ${d.why})` : d.label
  ).join("; ");

  // Dashas (short)
  const dashas = data.dashas?.slice(0, 6).map((d: any) => 
    `${d.system || "Vimshottari"}|${d.level || "Maha"}|${d.planet}|${d.from}→${d.to}`
  ).join("\n") || "";

  const header = isNepali
    ? `# D1 ग्रहहरू
${d1}

# घर/मालिक/दृष्टि
${houses}

# ग्रह बल
${strengths}

# ग्रह सम्बन्ध
${relations}

# योग/दोष
${yogas}
${doshas ? `\n${doshas}` : ""}

# दशा (छोटो)
${dashas}

प्रश्न:
${question}

निर्देश: प्रश्नसँग सम्बन्धित घर/मालिक/राशी/दृष्टि/बल/सम्बन्ध उद्धृत गर्दै step-by-step कारण देऊ; कार्डबाहिर नजाऊ।`
    : `# D1 Planets
${d1}

# House/Lord/Aspects
${houses}

# Planetary Strengths
${strengths}

# Planetary Relations
${relations}

# Yogas/Doshas
${yogas}
${doshas ? `\n${doshas}` : ""}

# Dashas (short)
${dashas}

Question:
${question}

Instructions: Quote relevant houses/lords/signs/aspects/strengths/relations step-by-step; stay within cards.`;

  return header;
}

// Helper function to extract DataNeeded from LLM response
export function extractDataNeeded(response: string): string[] | null {
  const lines = response.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (firstLine?.startsWith('DataNeeded:')) {
    const scopes = firstLine.replace('DataNeeded:', '').trim();
    return scopes.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  return null;
}

// Helper function to check if response contains DataNeeded
export function hasDataNeeded(response: string): boolean {
  return extractDataNeeded(response) !== null;
}

// Helper function to get house focus based on question
export function getHouseFocus(question: string, lang: "ne" | "en" = "ne"): number[] {
  const q = question.toLowerCase();
  const isNepali = lang === "ne";
  
  const houseKeywords = {
    1: isNepali ? ['आत्मा', 'शरीर', 'व्यक्तित्व', 'लग्न'] : ['self', 'body', 'personality', 'lagna'],
    2: isNepali ? ['धन', 'परिवार', 'वाणी', 'द्वितीय'] : ['wealth', 'family', 'speech', 'second'],
    3: isNepali ? ['भाइबहिनी', 'साहस', 'संचार', 'तृतीय'] : ['siblings', 'courage', 'communication', 'third'],
    4: isNepali ? ['आमा', 'घर', 'शिक्षा', 'चतुर्थ'] : ['mother', 'home', 'education', 'fourth'],
    5: isNepali ? ['सन्तान', 'बुद्धि', 'रचनात्मकता', 'पञ्चम'] : ['children', 'intelligence', 'creativity', 'fifth'],
    6: isNepali ? ['रोग', 'शत्रु', 'सेवा', 'षष्ठ'] : ['diseases', 'enemies', 'service', 'sixth'],
    7: isNepali ? ['विवाह', 'जीवनसाथी', 'साझेदारी', 'सप्तम'] : ['marriage', 'spouse', 'partnership', 'seventh'],
    8: isNepali ? ['आयु', 'परिवर्तन', 'गुप्त', 'अष्टम'] : ['longevity', 'transformation', 'occult', 'eighth'],
    9: isNepali ? ['भाग्य', 'बुबा', 'उच्च शिक्षा', 'नवम'] : ['fortune', 'father', 'higher learning', 'ninth'],
    10: isNepali ? ['कर्म', 'प्रतिष्ठा', 'अधिकार', 'दशम'] : ['career', 'reputation', 'authority', 'tenth'],
    11: isNepali ? ['लाभ', 'मित्र', 'जेठो भाइ', 'एकादश'] : ['gains', 'friends', 'elder siblings', 'eleventh'],
    12: isNepali ? ['हानि', 'खर्च', 'विदेश', 'द्वादश'] : ['losses', 'expenses', 'foreign lands', 'twelfth']
  };
  
  const focusedHouses: number[] = [];
  
  for (const [house, keywords] of Object.entries(houseKeywords)) {
    if (keywords.some(keyword => q.includes(keyword))) {
      focusedHouses.push(parseInt(house));
    }
  }
  
  return focusedHouses;
}

// Helper function to get planet focus based on question
export function getPlanetFocus(question: string, lang: "ne" | "en" = "ne"): string[] {
  const q = question.toLowerCase();
  const isNepali = lang === "ne";
  
  const planetKeywords = {
    'Sun': isNepali ? ['सूर्य', 'रवि', 'आत्मा'] : ['sun', 'surya', 'soul'],
    'Moon': isNepali ? ['चन्द्रमा', 'चन्द्र', 'मन'] : ['moon', 'chandra', 'mind'],
    'Mars': isNepali ? ['मंगल', 'भौम', 'ऊर्जा'] : ['mars', 'mangal', 'energy'],
    'Mercury': isNepali ? ['बुध', 'बुद्धि'] : ['mercury', 'budh', 'intelligence'],
    'Jupiter': isNepali ? ['बृहस्पति', 'गुरु', 'ज्ञान'] : ['jupiter', 'guru', 'knowledge'],
    'Venus': isNepali ? ['शुक्र', 'सुख', 'प्रेम'] : ['venus', 'shukra', 'love'],
    'Saturn': isNepali ? ['शनि', 'कर्म', 'अनुशासन'] : ['saturn', 'shani', 'discipline'],
    'Rahu': isNepali ? ['राहु', 'इच्छा'] : ['rahu', 'desire'],
    'Ketu': isNepali ? ['केतु', 'मोक्ष'] : ['ketu', 'moksha']
  };
  
  const focusedPlanets: string[] = [];
  
  for (const [planet, keywords] of Object.entries(planetKeywords)) {
    if (keywords.some(keyword => q.includes(keyword))) {
      focusedPlanets.push(planet);
    }
  }
  
  return focusedPlanets;
}