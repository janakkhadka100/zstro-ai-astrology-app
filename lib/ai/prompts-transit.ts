// lib/ai/prompts-transit.ts
// Age-aware transit interpretation prompts

import { detectLanguage } from "./prompts";

export const gocharPrompt = `
You are a seasoned Vedic astrologer specializing in transit (Gochar) analysis.

RULES
- Always mention CURRENT DATE and the USER'S AGE exactly as given.
- Use Whole-Sign houses relative to natal Ascendant.
- Use only provided transits (do NOT compute ephemeris).
- Prioritize period rulers (Mahadasha/Antar) when interpreting transits.
- If a transit aspects natal planets (provided), mention those links briefly.
- Keep tone human and practical; 1–3 short suggestions max; no fear-language.

STRUCTURE (NE/HI/EN auto):
1) One-liner: "On <date>, at age <Y years M months>, your main transits are…"
2) 3–5 key transits with WS house meanings (career/home/relationship/health/money).
3) Dasha synergy: "Since you're in <Maha> / <Antar>, these themes are amplified/tempered…"
4) Practical note for next 7–14 days. If no strong transit → say "steady period".
`;

export const transitInterpretationPrompt = (
  contextData: any,
  query: string,
  lang: 'en' | 'ne' | 'hi' = 'en'
) => {
  const langText = {
    ne: {
      title: '🕉️ गोचर विश्लेषण',
      intro: 'दिनांक',
      age: 'आयु',
      transits: 'गोचर',
      dasha: 'दशा',
      analysis: 'विश्लेषण',
      effects: 'प्रभाव',
      suggestions: 'सुझाव',
      periodRulers: 'दशा स्वामी'
    },
    hi: {
      title: '🕉️ गोचर विश्लेषण',
      intro: 'दिनांक',
      age: 'आयु',
      transits: 'गोचर',
      dasha: 'दशा',
      analysis: 'विश्लेषण',
      effects: 'प्रभाव',
      suggestions: 'सुझाव',
      periodRulers: 'दशा स्वामी'
    },
    en: {
      title: '🕉️ Transit Analysis',
      intro: 'Date',
      age: 'Age',
      transits: 'Transits',
      dasha: 'Dasha',
      analysis: 'Analysis',
      effects: 'Effects',
      suggestions: 'Suggestions',
      periodRulers: 'Period Rulers'
    }
  };

  const t = langText[lang];
  const { date, age, dashaChain, transits, periodRulers } = contextData;

  return `
${t.title} — ${date}

${t.intro}: ${date}
${t.age}: ${age.years} years ${age.months} months

**${t.dasha}**: ${dashaChain.maha} → ${dashaChain.antar} → ${dashaChain.pratyantar}
**${t.periodRulers}**: ${periodRulers.join(', ')}

${t.transits}:
${transits.slice(0, 8).map((t: any) => 
  `• ${t.planet} in ${t.sign} (WS House ${t.houseWS})${t.isPeriodRuler ? ' • period ruler' : ''}${t.isBenefic ? ' (benefic)' : ''}`
).join('\n')}

${t.analysis}:
Analyze the current planetary transits considering:

1. **Age Context**: At ${age.years} years old, focus on age-appropriate life themes
2. **Period Rulers**: ${periodRulers.join(', ')} have enhanced influence during this dasha period
3. **House Meanings**: Interpret WS house positions for practical life areas
4. **Dasha Synergy**: How transits interact with current ${dashaChain.maha}/${dashaChain.antar} period

${t.effects}:
- Explain how each key transit affects different life areas
- Consider the user's current age and life stage
- Highlight any significant aspects or house placements
- Mention if period rulers are prominently placed

${t.suggestions}:
- Provide 1-3 practical suggestions for the next 7-14 days
- Focus on opportunities or areas to be cautious about
- Consider the user's age and current dasha period
- Keep advice realistic and actionable

Remember: Always reference the user's exact age and current date. Use Whole-Sign houses and prioritize period rulers in your interpretation.
`;
};

export const getTransitPromptForQuery = async (
  query: string,
  userId: string,
  date?: string
): Promise<string> => {
  try {
    // Fetch transit context
    const url = date ? `/api/transits?date=${date}` : '/api/transits/today';
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.success) {
      return `Unable to fetch transit data: ${result.error}`;
    }
    
    const contextData = result.data;
    const lang = detectLanguage(query);
    
    return transitInterpretationPrompt(contextData, query, lang);
    
  } catch (error) {
    console.error('Error getting transit prompt:', error);
    return `Error preparing transit analysis: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const getTransitSummaryForContext = (contextData: any): string => {
  const { date, age, dashaChain, transits, periodRulers } = contextData;
  
  const ageStr = `${age.years}y ${age.months}m`;
  const periodRulersStr = periodRulers.join(', ');
  
  let summary = `📍Transits (${date}, age ${ageStr})\n`;
  summary += `Period Rulers: ${periodRulersStr}\n`;
  summary += `Dasha: ${dashaChain.maha} → ${dashaChain.antar} → ${dashaChain.pratyantar}\n\n`;
  
  // Add key transits
  const keyTransits = transits.slice(0, 8);
  summary += "Key Transits:\n";
  
  for (const transit of keyTransits) {
    const rulerFlag = transit.isPeriodRuler ? " • period ruler" : "";
    const beneficFlag = transit.isBenefic ? " (benefic)" : "";
    summary += `• ${transit.planet} in ${transit.sign} (WS House ${transit.houseWS})${rulerFlag}${beneficFlag}\n`;
  }
  
  return summary;
};
