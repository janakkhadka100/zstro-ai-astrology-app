// src/astro/ai/prompt.ts
// AI consistency guard and prompt system

import { AstroFactSheet } from '../facts';
import { EvaluatedYogas } from '../rules';
import { getEthicalSystemPrompt, buildEthicalUserPrompt } from './ethical-prompt';
import { getComprehensiveSystemPrompt, buildComprehensiveUserPrompt } from './comprehensive-prompt';

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

export const SYSTEM_PROMPT = getEthicalSystemPrompt('en');

export function buildUserPrompt(
  facts: AstroFactSheet, 
  yogas: EvaluatedYogas, 
  question: string = '',
  language: string = 'en'
): string {
  return buildEthicalUserPrompt(facts, yogas, question, language);
}

export function getSystemPrompt(analysisType: string = 'comprehensive', language: string = 'en'): string {
  switch (analysisType) {
    case 'comprehensive':
      return getComprehensiveSystemPrompt();
    case 'ethical':
    default:
      return getEthicalSystemPrompt(language);
  }
}

export function buildUserPromptAdvanced(
  astroData: any,
  question: string = '',
  language: string = 'en',
  analysisType: string = 'comprehensive'
): string {
  switch (analysisType) {
    case 'comprehensive':
      return buildComprehensiveUserPrompt(astroData, question, language);
    case 'ethical':
    default:
      return buildEthicalUserPrompt(astroData, astroData.yogas || {}, question, language);
  }
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
