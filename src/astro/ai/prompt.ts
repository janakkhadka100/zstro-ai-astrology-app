// src/astro/ai/prompt.ts
// AI consistency guard and prompt system

import { AstroFactSheet } from '../facts';
import { EvaluatedYogas } from '../rules';

export type VerifiedOutline = {
  summary: {
    lagna: string;
    lagnaLord: string;
  };
  positions: Array<{
    planet: string;
    sign: string;
    house: number;
    lordOf: number[];
    dignity?: string;
  }>;
  yogas: {
    panchMahapurush: Array<{
      key: string;
      planet: string;
      kendra: number;
      dignity: string;
    }>;
    vipareetaRajyoga: Array<{
      key: string;
      lordOf: number;
      placedIn: number;
      planet: string;
    }>;
    other: Array<{
      key: string;
      reason: string;
    }>;
  };
  dashas: {
    current: {
      maha: string;
      antar?: string;
      pratyantar?: string;
    };
    notes: string;
  };
  shadbala: Array<{
    planet: string;
    band: string;
  }>;
};

export const SYSTEM_PROMPT = `You are an expert Vedic astrologer (Jyotish) with deep knowledge of classical texts. Your task is to provide accurate, data-grounded astrological analysis using ONLY the provided fact sheet and evaluated yogas.

## CRITICAL RULES:
1. Use **ONLY** the supplied \`AstroFactSheet\` + \`EvaluatedYogas\` JSON data
2. When stating any claim, **cite the JSON path** in \`(facts.path)\` or \`(rules.key)\`
3. **Shasha Yoga is ONLY by Saturn** - never mention Moon for Shasha
4. **Never swap houses** (e.g., don't say 7th when facts say 8th)
5. If a field is **missing**, write 'Data unavailable'
6. **Vipareeta Rajyoga** only occurs when dusthana lords (6/8/12) are placed in another dusthana house

## ANALYSIS FRAMEWORK:
1. **Basic Chart Summary**: Lagna sign, lord, and key planetary positions
2. **Planetary Analysis**: Each planet's sign, house, lordship, and dignity
3. **Yoga Analysis**: Panch-Mahapurush, Vipareeta Rajyoga, and other yogas with citations
4. **Dasha Analysis**: Current period with house/lordship effects
5. **Shadbala Strength**: Strong/medium/weak planetary analysis
6. **Divisional Charts**: Navamsha/D10 insights if available
7. **Summary**: Key strengths, challenges, and remedies

## OUTPUT FORMAT:
Structure your response with clear headings and citations. Use emojis for visual appeal. Always cite your sources using the format \`(facts.planets[i])\` or \`(rules.PMP_Shasha)\`.

## LANGUAGE:
Respond in the user's preferred language (Nepali, Hindi, or English) with proper cultural context.`;

export function buildUserPrompt(
  facts: AstroFactSheet, 
  yogas: EvaluatedYogas, 
  question: string = '',
  language: string = 'en'
): string {
  const langPrefix = language === 'ne' ? 'नेपालीमा' : language === 'hi' ? 'हिंदी में' : 'in English';
  
  return `Please analyze this horoscope ${langPrefix} and provide a comprehensive Vedic astrology report.

**User Question:** ${question || 'General horoscope analysis'}

**Astrological Facts (Source of Truth):**
\`\`\`json
${JSON.stringify(facts, null, 2)}
\`\`\`

**Evaluated Yogas & Doshas:**
\`\`\`json
${JSON.stringify(yogas, null, 2)}
\`\`\`

**Analysis Requirements:**
1. Start with basic chart summary (Lagna, planets, lordships) - cite \`(facts.ascendant)\`
2. Analyze each planet's position and effects - cite \`(facts.planets[i])\`
3. Identify and explain all yogas with proper citations - cite \`(rules.PMP_Shasha)\` etc.
4. Provide detailed dasha analysis with house/lordship effects
5. Analyze Shadbala strengths - cite \`(rules.shadbala)\`
6. Include divisional chart insights if available
7. Give final synthesis with predictions and remedies

**Important Notes:**
- Use ONLY the provided data - do not invent any planetary positions
- If any data is missing, mention "Data unavailable" for that specific aspect
- Provide specific timing predictions where possible
- Include practical remedies and recommendations
- Use proper Vedic astrology terminology with explanations
- **Shasha Yoga is ONLY by Saturn, never Moon**
- **Vipareeta Rajyoga only when dusthana lords are in dusthana houses**

Please provide a detailed, structured analysis that covers all aspects of the horoscope with proper citations.`;
}

export function validateOutline(facts: AstroFactSheet, outline: VerifiedOutline): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate summary
  if (outline.summary.lagna !== facts.ascendant.sign) {
    errors.push(`Lagna mismatch: outline says ${outline.summary.lagna}, facts say ${facts.ascendant.sign}`);
  }
  if (outline.summary.lagnaLord !== facts.ascendant.lord) {
    errors.push(`Lagna lord mismatch: outline says ${outline.summary.lagnaLord}, facts say ${facts.ascendant.lord}`);
  }
  
  // Validate positions
  for (const op of outline.positions) {
    const fp = facts.planets.find(p => p.planet === op.planet);
    if (!fp) {
      errors.push(`Planet ${op.planet} not found in facts`);
      continue;
    }
    if (fp.house !== op.house) {
      errors.push(`House mismatch for ${op.planet}: outline says ${op.house}, facts say ${fp.house}`);
    }
    if (fp.sign !== op.sign) {
      errors.push(`Sign mismatch for ${op.planet}: outline says ${op.sign}, facts say ${fp.sign}`);
    }
    if (JSON.stringify(fp.lordOf.sort()) !== JSON.stringify(op.lordOf.sort())) {
      errors.push(`Lordship mismatch for ${op.planet}: outline says [${op.lordOf.join(',')}], facts say [${fp.lordOf.join(',')}]`);
    }
  }
  
  // Validate yogas
  if (outline.yogas.panchMahapurush) {
    for (const yoga of outline.yogas.panchMahapurush) {
      if (yoga.key === 'PMP_Shasha' && yoga.planet !== 'Saturn') {
        errors.push(`Shasha Yoga can only be by Saturn, not ${yoga.planet}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildNepaliTemplate(): string {
  return `
## नेपाली ज्योतिष विश्लेषण टेम्प्लेट:

### 1. लघु सार
- **लग्न**: \`(facts.ascendant.sign)\` - \`(facts.ascendant.lord)\` को मालिकी
- **मुख्य ग्रहहरू**: \`(facts.planets.map(p => p.planet).join(', '))\`

### 2. ग्रह–राशि–घर–मालिक
प्रत्येक ग्रहको विस्तृत विश्लेषण:
- **\`(facts.planets[i].planet)\`**: \`(facts.planets[i].sign)\` राशिमा \`(facts.planets[i].house)\` घरमा
- **मालिकी**: \`(facts.planets[i].lordOf.join(', '))\` घरहरूको
- **गरिमा**: \`(facts.planets[i].dignity)\`

### 3. योग विश्लेषण
- **Panch-Mahapurush**: \`(rules.panchMahapurush)\`
- **Vipareeta Rajyoga**: \`(rules.vipareetaRajyoga)\`
- **अन्य योग**: \`(rules.other)\`

### 4. दशा विश्लेषण
- **वर्तमान महादशा**: \`(facts.dashas.vimshottari[0].maha)\`
- **अन्तरदशा**: \`(facts.dashas.vimshottari[0].antar)\`
- **प्रत्यन्तर**: \`(facts.dashas.vimshottari[0].pratyantar)\`

### 5. षड्बल शक्ति
- **बलशाली ग्रह**: \`(rules.shadbala.filter(s => s.band === 'strong').map(s => s.planet).join(', '))\`
- **कमजोर ग्रह**: \`(rules.shadbala.filter(s => s.band === 'weak').map(s => s.planet).join(', '))\`

### 6. सारांश र सुझाव
- **मुख्य शक्तिहरू**: 
- **चुनौतिहरू**: 
- **उपायहरू**: 
`;
}
