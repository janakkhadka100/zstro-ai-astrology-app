// lib/prompts/advanced-astrology.ts
// Advanced Vedic astrology prompt system for deep analysis

export const ADVANCED_SYSTEM_PROMPT = `You are an expert Vedic astrologer (Jyotish) with deep knowledge of classical texts and modern applications. Your task is to provide comprehensive, data-grounded astrological analysis using ONLY the provided Pokhrel API data.

## CORE PRINCIPLES:
1. Use ONLY the provided astrological data - never invent planetary positions
2. Base all interpretations on classical Vedic principles
3. Provide specific, actionable insights
4. Explain the reasoning behind each interpretation
5. Use proper Sanskrit terms with English translations

## ANALYSIS FRAMEWORK:

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

export const ADVANCED_USER_PROMPT = (astroData: any, question: string, language: string = 'en') => {
  const langPrefix = language === 'ne' ? 'नेपालीमा' : language === 'hi' ? 'हिंदी में' : 'in English';
  
  return `Please analyze this horoscope ${langPrefix} and provide a comprehensive Vedic astrology report.

**User Question:** ${question}

**Astrological Data:**
\`\`\`json
${JSON.stringify(astroData, null, 2)}
\`\`\`

**Analysis Requirements:**
1. Start with basic chart summary (Lagna, planets, lordships)
2. Analyze each planet's position and effects
3. Identify and explain all yogas and doshas
4. Provide detailed dasha analysis (current and future periods)
5. Analyze Shadbala strengths
6. Include divisional chart insights (D9, D10)
7. Give final synthesis with predictions and remedies

**Important Notes:**
- Use ONLY the provided data - do not invent any planetary positions
- If any data is missing, mention "Data not available" for that specific aspect
- Provide specific timing predictions where possible
- Include practical remedies and recommendations
- Use proper Vedic astrology terminology with explanations

Please provide a detailed, structured analysis that covers all aspects of the horoscope.`;
};

export const YOGA_ANALYSIS_PROMPT = (yogas: any[], doshas: any[]) => {
  return `**Yoga & Dosha Analysis:**

**Detected Yogas:**
${yogas.map(yoga => `
- **${yoga.label}** (${yoga.type})
  - Factors: ${yoga.factors.join(', ')}
  - Strength: ${yoga.strength}
  - Effects: ${yoga.effects.join(', ')}
`).join('\n')}

**Detected Doshas:**
${doshas.map(dosha => `
- **${dosha.label}** (${dosha.type})
  - Severity: ${dosha.severity}
  - Factors: ${dosha.factors.join(', ')}
  - Remedies: ${dosha.remedies.join(', ')}
`).join('\n')}

Please analyze these yogas and doshas in detail, explaining their significance and impact on the native's life.`;
};

export const DASHA_ANALYSIS_PROMPT = (dashaData: any) => {
  return `**Dasha Analysis:**

**Current Vimshottari Dasha:**
- Mahadasha: ${dashaData.current?.mahadasha || 'N/A'}
- Antardasha: ${dashaData.current?.antardasha || 'N/A'}
- Pratyantar: ${dashaData.current?.pratyantar || 'N/A'}
- Period: ${dashaData.current?.start || 'N/A'} to ${dashaData.current?.end || 'N/A'}

**Yogini Dasha:**
- Current Yogini: ${dashaData.yogini?.current?.yogini || 'N/A'}
- Planet: ${dashaData.yogini?.current?.planet || 'N/A'}

Please provide detailed analysis of the current dasha periods and their effects on the native's life.`;
};

export const SHADBALA_ANALYSIS_PROMPT = (shadbalaData: any) => {
  const planets = Object.keys(shadbalaData);
  const sortedPlanets = planets.sort((a, b) => shadbalaData[b].total - shadbalaData[a].total);
  
  return `**Shadbala Analysis:**

**Planetary Strengths (Strongest to Weakest):**
${sortedPlanets.map(planet => `
- **${planet}**: ${shadbalaData[planet].total.toFixed(2)} (${shadbalaData[planet].strength})
  - Sthana: ${shadbalaData[planet].sthana.toFixed(2)}
  - Kala: ${shadbalaData[planet].kala.toFixed(2)}
  - Cheshta: ${shadbalaData[planet].cheshta.toFixed(2)}
  - Naisargika: ${shadbalaData[planet].naisargika.toFixed(2)}
  - Drik: ${shadbalaData[planet].drik.toFixed(2)}
  - Bhava: ${shadbalaData[planet].bhava.toFixed(2)}
`).join('\n')}

Please analyze the planetary strengths and their implications for the native's life.`;
};

export const DIVISIONAL_CHART_PROMPT = (divisionalData: any) => {
  return `**Divisional Charts Analysis:**

**Navamsha (D9) - Marriage & Spirituality:**
${divisionalData.D9 ? `
- Ascendant: ${divisionalData.D9.ascendant || 'N/A'}
- Key planets: ${divisionalData.D9.keyPlanets || 'N/A'}
` : 'Data not available'}

**Dashamsha (D10) - Career & Profession:**
${divisionalData.D10 ? `
- Ascendant: ${divisionalData.D10.ascendant || 'N/A'}
- Key planets: ${divisionalData.D10.keyPlanets || 'N/A'}
` : 'Data not available'}

Please analyze the divisional charts and their significance for marriage, career, and spiritual development.`;
};

export const FINAL_SYNTHESIS_PROMPT = (summary: any) => {
  return `**Final Synthesis & Predictions:**

Based on the comprehensive analysis, please provide:

1. **Overall Life Summary** - Key strengths and challenges
2. **Career Predictions** - Best career paths and timing
3. **Marriage & Relationships** - Timing and compatibility
4. **Health Considerations** - Areas to watch and maintain
5. **Spiritual Development** - Path and timing
6. **Remedies & Recommendations** - Specific actions to take
7. **Important Periods** - Key dates and periods to watch

Please provide a clear, actionable summary that the native can use to improve their life.`;
};