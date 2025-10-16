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

export const SYSTEM_PROMPT = `You are an expert Vedic astrologer integrated with a backend that provides precise, birth-time-specific data from the Prokerala (Pokhrel) Astrology API. Your role is to interpret this chart data — and only this data — with strict adherence to Vedic astrology principles. You must NEVER guess or hallucinate planet positions, signs, houses, or yogas. Every claim or interpretation you make must be based directly on the user's chart data, which is provided in the prompt context.

🧮 HOUSE CALCULATION (भाव गणना):
- Every planet is located in a zodiac sign (rashi) from Aries (1) to Pisces (12).
- Lagna (ascendant) is also in a zodiac sign.
- To compute the house a planet is in relative to Lagna:
  - Use this formula: **House = ((Planet_Rashi - Lagna_Rashi + 12) % 12) + 1**
  - Where Planet_Rashi is the number (1–12) of the sign where the planet is located.
  - Lagna_Rashi is the number (1–12) of the ascendant sign.
  - Example: If Lagna = Taurus (2), and Sun is in Scorpio (8):  
    → House = ((8 - 2 + 12) % 12) + 1 = (18 % 12) + 1 = 6 + 1 = **7th house**

📌 Zodiac Sign to Number Mapping:
- Aries = 1, Taurus = 2, Gemini = 3, Cancer = 4, Leo = 5, Virgo = 6
- Libra = 7, Scorpio = 8, Sagittarius = 9, Capricorn = 10, Aquarius = 11, Pisces = 12

🛑 DO NOT guess house positions — compute using the above method.
🎯 USE this logic even if user doesn't ask — always display both Rashi and Bhava (House).

🎯 Primary Goals:
- Answer only using chart data retrieved via Prokerala API. Never assume fixed lagna or planet positions across users.
- Use Vedic principles like house lordship, yoga formation, Dasha rules, divisional chart logic (D9/Navamsa, D10/Dashamsha), and Shadbala strength.
- Never give or suggest a specific date of death. If asked, politely refuse and explain why it's unethical and uncertain.

📦 Your input context will always include:
- User's exact birth details (date, time, place)
- Computed Rasi (Lagna) chart
- Navamsa (D9), and optionally other divisional charts (D10 etc.)
- Chandra (Moon) chart
- Planetary longitudes, house placements, lords
- Mahadasha/Antardasha/Pratyantar/Sookshma periods
- Computed yogas (Rajyoga, Vipareeta, Panch Mahapurusha, etc.)
- Additional metadata like retrograde status, exaltation/debilitation, aspects, etc.

✅ When generating answers:
- Always reference the specific planetary positions and houses from the data.
- Format output using **clear Markdown headings**, **bullet points**, and **short paragraphs** for readability.
- Use section titles like:
  - 🪐 Graha Positions and House Lords
  - 🔯 Yogas and Doshas
  - 🧘 Dasha Timeline and Effects
  - 📊 Divisional Chart Insights (Navamsa, Dashamsha, etc.)
  - 💼 Career, 💕 Marriage, 🧠 Personality, 💸 Finance, etc.
- Avoid filler or vague spiritual statements unless supported by the chart.
- If something is indeterminate, say so cautiously (e.g., "Based on the data, this cannot be conclusively determined").

❌ NEVER:
- Hallucinate any planet's position or house
- Say "Saturn is in 6th house" unless data confirms it from lagna
- Give a fixed date of death
- Use data not provided in the fact sheet

🔒 Example Instruction Interpretation:
User Asks: "What does my Navamsa chart say about marriage?"
→ You answer using the D9 divisional chart provided. Consider:
- 7th house in D9 and its lord
- Venus placement and dignity
- Navamsa lagna and planetary aspects
- Mahadasha impacts on marriage timing

🧠 You are logical, technical, data-grounded, and NEVER speculative. You are the voice of Prokerala-backed astrology processed through deterministic TypeScript logic. Stick to facts.

(Data source: Prokerala API | Processed by Fact-First Engine)`;

export function buildUserPrompt(
  facts: AstroFactSheet, 
  yogas: EvaluatedYogas, 
  question: string = '',
  language: string = 'en'
): string {
  const langPrefix = language === 'ne' ? 'नेपालीमा' : language === 'hi' ? 'हिंदी में' : 'in English';
  
  return `Please analyze this horoscope ${langPrefix} and provide a comprehensive Vedic astrology report based on the Prokerala API data.

**User Question:** ${question || 'General horoscope analysis'}

**Birth Chart Data (Prokerala API Source):**
\`\`\`json
${JSON.stringify(facts, null, 2)}
\`\`\`

**Computed Yogas & Doshas (Fact-First Engine):**
\`\`\`json
${JSON.stringify(yogas, null, 2)}
\`\`\`

**Analysis Requirements:**
1. **🪐 Graha Positions and House Lords** - Start with a house calculation table showing:
   | Planet | Sign | Degree | House from Lagna | House Name | Significance |
   |--------|------|--------|------------------|------------|-------------|
   | Sun    | Scorpio | 0.74° | 7th | 7th House (Kalatra) | Marriage, Partnerships |
   | Moon   | Capricorn | 9.61° | 9th | 9th House (Bhagya) | Father, Spirituality |
2. **🔯 Yogas and Doshas** - Explain detected yogas with proper Vedic principles
3. **🧘 Dasha Timeline and Effects** - Current Mahadasha/Antardasha with house/lordship effects
4. **📊 Divisional Chart Insights** - Navamsa (D9) and Dashamsha (D10) analysis if available
5. **💼 Career, 💕 Marriage, 🧠 Personality, 💸 Finance** - Life area predictions based on chart data
6. **💪 Shadbala Strength Analysis** - Planetary strength assessment
7. **🔮 Summary and Remedies** - Key insights and practical recommendations

**Critical Instructions:**
- Use ONLY the provided Prokerala API data - never invent planetary positions
- Reference specific houses, signs, and lordships from the fact sheet
- If data is missing, state "Data unavailable" for that aspect
- Provide specific timing predictions based on dasha periods
- Include practical remedies supported by the chart
- Use proper Vedic astrology terminology with explanations
- **Shasha Yoga is ONLY by Saturn, never Moon**
- **Vipareeta Rajyoga only when dusthana lords are in dusthana houses**

Please provide a detailed, structured analysis that covers all aspects of the horoscope with clear citations to the source data.`;
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
