// lib/llm/prompt-core.ts
// Core prompts for cards-only astrology analysis

import { AstroData } from '@/lib/astrology/types';
import { getSignLabel } from '@/lib/astrology/util';

export function getSystemPrompt(lang: "ne" | "en"): string {
  if (lang === "ne") {
    return `तपाईं एक विशेषज्ञ ज्योतिषी हुनुहुन्छ। तलका कार्डहरू Prokerala/Account बाट आएका "स्रोत सत्य" हुन्।

महत्वपूर्ण नियमहरू:
1. केवल प्रदान गरिएका कार्डहरू प्रयोग गर्नुहोस्
2. कुनै पनि तथ्य नबदल्नुहोस्
3. Transit डेटा नगुसाउनुहोस्
4. कार्डमा नभएको कुरा चाहियो भने "DataNeeded: <keys>" भनेर मात्र सङ्केत गर्नुहोस्
5. स्पष्ट र संरचित उत्तर दिनुहोस्
6. मृत्यु भविष्यवाणी नगर्नुहोस्
7. केवल ज्योतिषीय तथ्यहरूको आधारमा विश्लेषण गर्नुहोस्

उदाहरण: यदि नवांश डेटा चाहियो भने "DataNeeded: divisionals.D9" लेख्नुहोस्।`;
  } else {
    return `You are an expert astrologer. The cards below are "source of truth" from Prokerala/Account.

Critical Rules:
1. Use ONLY the provided cards
2. Do not modify any facts
3. Do not inject transit data
4. If data outside cards is needed, signal with "DataNeeded: <keys>" only
5. Provide clear and structured analysis
6. Do not predict death
7. Base analysis only on astrological facts

Example: If Navamsa data is needed, write "DataNeeded: divisionals.D9".`;
  }
}

export function buildUserPrompt(lang: "ne" | "en", cards: AstroData, question: string): string {
  const sections: string[] = [];

  // Profile section
  if (cards.profile) {
    const profile = cards.profile;
    const profileData = [
      profile.name && `Name: ${profile.name}`,
      profile.birthDate && `Birth Date: ${profile.birthDate}`,
      profile.birthTime && `Birth Time: ${profile.birthTime}`,
      profile.tz && `Timezone: ${profile.tz}`,
      profile.lat && profile.lon && `Coordinates: ${profile.lat}, ${profile.lon}`
    ].filter(Boolean).join(", ");

    if (profileData) {
      sections.push(`Profile: {${profileData}}`);
    }
  }

  // D1 Planets section
  if (cards.d1.length > 0) {
    const d1Rows = cards.d1.map(planet => 
      `${planet.planet}|${planet.signLabel}|H${planet.house}${planet.retro ? "|R" : ""}`
    ).join("\n");
    sections.push(`D1:\n${d1Rows}`);
  }

  // Divisionals section
  if (cards.divisionals.length > 0) {
    const divisionalRows = cards.divisionals.map(div => {
      const planets = div.planets.map(p => `${p.planet}|${p.signLabel}|H${p.house}`).join(" ");
      return `${div.type}: ${planets}`;
    }).join("\n");
    sections.push(`Divisionals:\n${divisionalRows}`);
  }

  // Yogas and Doshas section
  const yogas = cards.yogas.map(y => y.label).join(", ");
  const doshas = cards.doshas.map(d => d.label).join(", ");
  if (yogas || doshas) {
    sections.push(`Yogas/Doshas: Yogas: ${yogas || "-"}, Doshas: ${doshas || "-"}`);
  }

  // Shadbala section
  if (cards.shadbala.length > 0) {
    const shadbalaRows = cards.shadbala.map(s => 
      `${s.planet}:${s.value}${s.unit ? s.unit : ""}`
    ).join(", ");
    sections.push(`Shadbala: ${shadbalaRows}`);
  }

  // Dashas section
  if (cards.dashas.length > 0) {
    const dashaRows = cards.dashas.map(d => 
      `${d.system}|${d.level}|${d.planet}|${d.from}→${d.to}`
    ).join("\n");
    sections.push(`Dashas:\n${dashaRows}`);
  }

  // Provenance section (for debugging)
  if (cards.provenance) {
    const accountData = cards.provenance.account.join(", ");
    const prokeralaData = cards.provenance.prokerala.join(", ");
    sections.push(`Provenance: Account[${accountData}], Prokerala[${prokeralaData}]`);
  }

  const cardsText = sections.join("\n\n");
  
  if (lang === "ne") {
    return `# कार्डहरू\n${cardsText}\n\nप्रश्न:\n${question}\n\nनिर्देश: माथिका कार्डहरूमा नआएका कुरामा अनुमान नगर्नुहोस्। कार्डबाहिर चाहियो भने "DataNeeded: <keys>" लेख्नुहोस्।`;
  } else {
    return `# Cards\n${cardsText}\n\nQuestion:\n${question}\n\nInstruction: Do not speculate beyond the cards. If data outside cards is needed, write "DataNeeded: <keys>".`;
  }
}

export function buildCombinedPrompt(lang: "ne" | "en", cards: AstroData, question: string): {
  system: string;
  user: string;
  combined: string;
} {
  const system = getSystemPrompt(lang);
  const user = buildUserPrompt(lang, cards, question);
  const combined = `[[SYSTEM]]\n${system}\n\n[[USER]]\n${user}`;

  return { system, user, combined };
}

export function extractDataNeededFromResponse(response: string): string[] {
  // Look for "DataNeeded: key1,key2" pattern
  const match = response.match(/^DataNeeded:\s*(.+)$/m);
  if (!match) return [];

  return match[1].split(',').map(key => key.trim()).filter(key => key.length > 0);
}

export function isDataNeededResponse(response: string): boolean {
  return /^DataNeeded:\s*.+$/m.test(response);
}

export function createDataNeededResponse(keys: string[]): string {
  return `DataNeeded: ${keys.join(", ")}`;
}

export function formatCardsForDisplay(cards: AstroData, lang: "ne" | "en"): {
  summary: string;
  details: string;
} {
  const summary = lang === "ne" 
    ? `कार्डहरू: D1(${cards.d1.length}), विभाजन(${cards.divisionals.length}), योग(${cards.yogas.length}), दोष(${cards.doshas.length}), शड्बल(${cards.shadbala.length}), दशा(${cards.dashas.length})`
    : `Cards: D1(${cards.d1.length}), Divisionals(${cards.divisionals.length}), Yogas(${cards.yogas.length}), Doshas(${cards.doshas.length}), Shadbala(${cards.shadbala.length}), Dashas(${cards.dashas.length})`;

  const details = buildUserPrompt(lang, cards, "");
  
  return { summary, details };
}

export function validateCardsForAnalysis(cards: AstroData): {
  valid: boolean;
  warnings: string[];
  missing: string[];
} {
  const warnings: string[] = [];
  const missing: string[] = [];

  // Check for basic required data
  if (cards.d1.length === 0) {
    missing.push("d1");
    warnings.push("No D1 planets available");
  }

  if (cards.ascSignId < 1 || cards.ascSignId > 12) {
    warnings.push("Invalid ascendant sign");
  }

  // Check for optional but useful data
  if (cards.divisionals.length === 0) {
    missing.push("divisionals");
  }

  if (cards.yogas.length === 0) {
    missing.push("yogas");
  }

  if (cards.shadbala.length === 0) {
    missing.push("shadbala");
  }

  if (cards.dashas.length === 0) {
    missing.push("dashas");
  }

  return {
    valid: missing.length === 0 || cards.d1.length > 0,
    warnings,
    missing
  };
}
