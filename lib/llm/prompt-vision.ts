// lib/llm/prompt-vision.ts
// Vision-specific LLM prompts for evidence cards

import { EvidenceBundle, Lang } from '@/lib/extract/types';

export const systemVision = (lang: "ne"|"en") => lang === "ne"
  ? `तलका Evidence Cards (chin/palm/document) लाई "स्रोत सत्य" मान। यिनै तथ्यबाट मात्र व्याख्या गर; अनुमान नगर्नु। गुणस्तर कम भए चेतावनी उल्लेख गर, तर तथ्य नबनाऊ।

महत्वपूर्ण नियमहरू:
1. केवल प्रदान गरिएका Evidence Cards प्रयोग गर्नुहोस्
2. कुनै पनि विवरण अनुमान नगर्नुहोस्
3. गुणस्तर कम भए चेतावनी दिनुहोस्
4. तथ्य नबनाउनुहोस्
5. स्पष्ट र संरचित उत्तर दिनुहोस्`
  : `Treat the Evidence Cards (chin/palm/document) as the only source of truth. Analyze strictly from them; do not invent details. If quality is low, surface that limitation.

Critical Rules:
1. Use ONLY the provided Evidence Cards
2. Do not guess any details
3. Warn about low quality data
4. Do not fabricate facts
5. Provide clear and structured analysis`;

// Flatten cards into compact, tabular text
export function serializeEvidence(bundle: EvidenceBundle): string {
  const L: string[] = [];
  
  for (const card of bundle.cards) {
    if (card.type === "chin" && card.chin) {
      L.push(`CHIN|file=${card.fileId}|jawDeg=${card.chin.jawAngleDeg ?? ""}|width%=${card.chin.chinWidthPct ?? ""}|depth%=${card.chin.chinDepthPct ?? ""}|dimple=${card.chin.dimpleLikely ?? ""}|beard=${card.chin.beardCoverage ?? ""}|lighting=${card.chin.lightingOk ?? ""}|quality=${card.chin.qualityNote ?? ""}`);
    }
    if (card.type === "palm" && card.palm) {
      L.push(`PALM|file=${card.fileId}|lineQ=${card.palm.lineQuality}|heart=${card.palm.heartLineShape ?? ""}|head=${card.palm.headLineShape ?? ""}|life=${card.palm.lifeLineShape ?? ""}|fate=${card.palm.fateLinePresent ?? ""}|mounts=${(card.palm.mountsStrong ?? []).join("+")}|hand=${card.palm.handednessGuess ?? ""}|quality=${card.palm.qualityNote ?? ""}`);
    }
    if (card.type === "document" && card.doc) {
      L.push(`DOC|file=${card.fileId}|pages=${card.doc.pages}|textLen=${card.doc.ocrText.length}|dates=${(card.doc.containsDates ?? []).join(",")}|tables=${card.doc.hasTables ?? ""}|lang=${card.doc.language ?? ""}|quality=${card.doc.qualityNote ?? ""}`);
    }
  }
  
  return L.join("\n");
}

export function userVision(lang: "ne"|"en", ev: EvidenceBundle, question: string) {
  const head = lang === "ne"
    ? `# Evidence Cards\n${serializeEvidence(ev)}\n\nप्रश्न:\n${question}\n\nनिर्देश: माथिका कार्डहरूमा नआएका कुरामा अनुमान नगर्नु। केवल प्रदान गरिएका तथ्यहरू प्रयोग गर।`
    : `# Evidence Cards\n${serializeEvidence(ev)}\n\nQuestion:\n${question}\n\nInstruction: Do not speculate beyond the cards. Use only the provided facts.`;
  
  return head;
}

export function buildVisionPrompt(lang: "ne"|"en", ev: EvidenceBundle, question: string): { system: string; user: string; combined: string } {
  const system = systemVision(lang);
  const user = userVision(lang, ev, question);
  const combined = `[[SYSTEM]]\n${system}\n\n[[USER]]\n${user}`;
  
  return { system, user, combined };
}

// Combined prompt for Prokerala + Evidence cards
export function buildCombinedPrompt(
  lang: "ne"|"en", 
  prokeralaData: any, 
  evidenceBundle: EvidenceBundle, 
  question: string
): { system: string; user: string; combined: string } {
  
  const system = lang === "ne"
    ? `तपाईं एक विशेषज्ञ ज्योतिषी हुनुहुन्छ। तलका दुई प्रकारका कार्डहरू प्रयोग गर्नुहोस्:

1. **Prokerala Cards**: ग्रह, राशि, घर, योग, दोष, दशा - यी सबै "स्रोत सत्य" हुन्
2. **Evidence Cards**: चिन, हातको रेखा, कागजात - यी पनि "स्रोत सत्य" हुन्

महत्वपूर्ण नियमहरू:
- केवल प्रदान गरिएका कार्डहरू प्रयोग गर्नुहोस्
- कुनै पनि तथ्य अनुमान नगर्नुहोस्
- दुवै प्रकारका कार्डहरूको समन्वय गर्नुहोस्
- गुणस्तर कम भए चेतावनी दिनुहोस्
- स्पष्ट र संरचित उत्तर दिनुहोस्`
    : `You are an expert astrologer. Use the following two types of cards:

1. **Prokerala Cards**: Planets, signs, houses, yogas, doshas, dashas - these are "source of truth"
2. **Evidence Cards**: Chin, palm lines, documents - these are also "source of truth"

Critical Rules:
- Use ONLY the provided cards
- Do not guess any facts
- Coordinate both types of cards
- Warn about low quality data
- Provide clear and structured analysis`;

  const prokeralaSection = lang === "ne"
    ? `# Prokerala कार्डहरू\n${formatProkeralaData(prokeralaData, lang)}`
    : `# Prokerala Cards\n${formatProkeralaData(prokeralaData, lang)}`;

  const evidenceSection = lang === "ne"
    ? `# Evidence कार्डहरू\n${serializeEvidence(evidenceBundle)}`
    : `# Evidence Cards\n${serializeEvidence(evidenceBundle)}`;

  const user = lang === "ne"
    ? `${prokeralaSection}\n\n${evidenceSection}\n\nप्रश्न:\n${question}\n\nनिर्देश: माथिका कार्डहरूमा नआएका कुरामा अनुमान नगर्नु। केवल प्रदान गरिएका तथ्यहरू प्रयोग गर।`
    : `${prokeralaSection}\n\n${evidenceSection}\n\nQuestion:\n${question}\n\nInstruction: Do not speculate beyond the cards. Use only the provided facts.`;

  const combined = `[[SYSTEM]]\n${system}\n\n[[USER]]\n${user}`;
  
  return { system, user, combined };
}

function formatProkeralaData(data: any, lang: "ne"|"en"): string {
  if (!data) return lang === "ne" ? "कुनै Prokerala डाटा छैन" : "No Prokerala data";
  
  const sections = [];
  
  // D1 Planets
  if (data.d1 && data.d1.length > 0) {
    const planets = data.d1.map((p: any) => 
      `${p.planet}|${p.signLabel}|H${p.house}${p.retro ? "|R" : ""}`
    ).join("\n");
    sections.push(`D1: ${planets}`);
  }
  
  // Yogas
  if (data.yogas && data.yogas.length > 0) {
    const yogas = data.yogas.map((y: any) => y.label).join(", ");
    sections.push(`Yogas: ${yogas}`);
  }
  
  // Doshas
  if (data.doshas && data.doshas.length > 0) {
    const doshas = data.doshas.map((d: any) => d.label).join(", ");
    sections.push(`Doshas: ${doshas}`);
  }
  
  // Shadbala
  if (data.shadbala && data.shadbala.length > 0) {
    const shadbala = data.shadbala.map((s: any) => `${s.planet}:${s.value}`).join(", ");
    sections.push(`Shadbala: ${shadbala}`);
  }
  
  return sections.join("\n");
}

// Quality assessment for evidence cards
export function assessEvidenceQuality(bundle: EvidenceBundle): {
  overall: "low" | "medium" | "high";
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for low confidence cards
  const lowConfidenceCards = bundle.cards.filter(card => {
    const confidence = card.chin?.confidence || card.palm?.confidence || card.doc?.confidence || 0;
    return confidence < 0.5;
  });
  
  if (lowConfidenceCards.length > 0) {
    issues.push(`${lowConfidenceCards.length} cards have low confidence`);
    recommendations.push("Consider uploading higher quality images");
  }
  
  // Check for warnings
  const cardsWithWarnings = bundle.cards.filter(card => card.warnings && card.warnings.length > 0);
  if (cardsWithWarnings.length > 0) {
    issues.push(`${cardsWithWarnings.length} cards have warnings`);
    recommendations.push("Review warnings and consider re-uploading if needed");
  }
  
  // Check for empty evidence
  const emptyCards = bundle.cards.filter(card => {
    if (card.type === "document" && card.doc) {
      return card.doc.ocrText.length < 50;
    }
    return false;
  });
  
  if (emptyCards.length > 0) {
    issues.push(`${emptyCards.length} cards have minimal extracted data`);
    recommendations.push("Try uploading clearer images or different file formats");
  }
  
  // Determine overall quality
  let overall: "low" | "medium" | "high" = "high";
  if (issues.length > 2) overall = "low";
  else if (issues.length > 0) overall = "medium";
  
  return { overall, issues, recommendations };
}
