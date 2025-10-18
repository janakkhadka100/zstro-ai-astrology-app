// lib/ai/prompts-enhanced.ts
// Enhanced AI prompting with DataNeeded detection

import { AstroData, DataNeeded } from '@/lib/astrology/types';
import { getString, type Lang } from '@/lib/utils/i18n';

interface PromptContext {
  astroData: AstroData;
  question: string;
  lang: Lang;
  evidenceCards?: any[];
  sessionHistory?: string[];
}

interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
  dataNeeded?: DataNeeded;
  confidence: number;
}

export class EnhancedPromptBuilder {
  private lang: Lang;
  private context: PromptContext;

  constructor(context: PromptContext) {
    this.context = context;
    this.lang = context.lang;
  }

  // Build comprehensive system prompt
  buildSystemPrompt(): string {
    const { astroData, evidenceCards, sessionHistory } = this.context;
    
    const baseInstructions = this.getBaseInstructions();
    const dataInstructions = this.getDataInstructions(astroData);
    const evidenceInstructions = evidenceCards ? this.getEvidenceInstructions(evidenceCards) : '';
    const historyInstructions = sessionHistory ? this.getHistoryInstructions(sessionHistory) : '';
    const safetyInstructions = this.getSafetyInstructions();
    const responseFormatInstructions = this.getResponseFormatInstructions();

    return [
      baseInstructions,
      dataInstructions,
      evidenceInstructions,
      historyInstructions,
      safetyInstructions,
      responseFormatInstructions
    ].filter(Boolean).join('\n\n');
  }

  // Build user prompt with question analysis
  buildUserPrompt(): { prompt: string; dataNeeded?: DataNeeded } {
    const { question, astroData } = this.context;
    
    // Analyze question for missing data requirements
    const dataNeeded = this.analyzeDataRequirements(question, astroData);
    
    const questionAnalysis = this.analyzeQuestion(question);
    const contextInfo = this.getContextInfo(astroData);
    const evidenceInfo = this.context.evidenceCards ? this.getEvidenceInfo() : '';
    
    const prompt = [
      questionAnalysis,
      contextInfo,
      evidenceInfo,
      this.getQuestionInstructions(question)
    ].filter(Boolean).join('\n\n');

    return { prompt, dataNeeded };
  }

  // Analyze question to determine what data is needed
  private analyzeDataRequirements(question: string, astroData: AstroData): DataNeeded | undefined {
    const requirements: DataNeeded = {
      divisionals: [],
      shadbala: false,
      dashas: false,
      yogas: false,
      doshas: false,
      transits: false,
      aspects: false,
      houses: false,
      nakshatras: false
    };

    const questionLower = question.toLowerCase();
    const isNepali = this.lang === 'ne';

    // Check for divisional chart requirements
    const divisionalKeywords = isNepali 
      ? ['नवांश', 'दशमांश', 'द्वादशांश', 'त्रिंशांश', 'षष्ठांश', 'अष्टमांश', 'नवमांश', 'दशांश']
      : ['navamsa', 'dashamsha', 'dwadashamsha', 'trimsamsha', 'sashtamsha', 'ashtamsha', 'navamsha', 'dashamsha'];

    for (const keyword of divisionalKeywords) {
      if (questionLower.includes(keyword)) {
        if (keyword.includes('navamsha') || keyword.includes('नवांश')) {
          requirements.divisionals.push('D9');
        } else if (keyword.includes('dashamsha') || keyword.includes('दशमांश')) {
          requirements.divisionals.push('D10');
        } else if (keyword.includes('dwadashamsha') || keyword.includes('द्वादशांश')) {
          requirements.divisionals.push('D12');
        } else if (keyword.includes('trimsamsha') || keyword.includes('त्रिंशांश')) {
          requirements.divisionals.push('D30');
        } else if (keyword.includes('sashtamsha') || keyword.includes('षष्ठांश')) {
          requirements.divisionals.push('D60');
        } else if (keyword.includes('ashtamsha') || keyword.includes('अष्टमांश')) {
          requirements.divisionals.push('D8');
        } else if (keyword.includes('navamsha') || keyword.includes('नवमांश')) {
          requirements.divisionals.push('D9');
        } else if (keyword.includes('dashamsha') || keyword.includes('दशांश')) {
          requirements.divisionals.push('D10');
        }
      }
    }

    // Check for other data requirements
    const shadbalaKeywords = isNepali 
      ? ['षड्बल', 'बल', 'शक्ति', 'शुभ', 'अशुभ']
      : ['shadbala', 'strength', 'power', 'benefic', 'malefic'];

    const dashaKeywords = isNepali 
      ? ['दशा', 'अंतर्दशा', 'प्रत्यंतर', 'महादशा', 'विम्शोत्तरी', 'योगिनी']
      : ['dasha', 'antardasha', 'pratyantar', 'mahadasha', 'vimshottari', 'yogini'];

    const yogaKeywords = isNepali 
      ? ['योग', 'राजयोग', 'धनयोग', 'विवाह', 'संतान', 'करियर']
      : ['yoga', 'rajyoga', 'dhanayoga', 'marriage', 'children', 'career'];

    const doshaKeywords = isNepali 
      ? ['दोष', 'कालसर्प', 'मंगल', 'केतु', 'राहु', 'शनि']
      : ['dosha', 'kalsarpa', 'mangal', 'ketu', 'rahu', 'shani'];

    const transitKeywords = isNepali 
      ? ['गोचर', 'ट्रांजिट', 'वर्तमान', 'भविष्य', 'आगामी']
      : ['gochar', 'transit', 'current', 'future', 'upcoming'];

    const aspectKeywords = isNepali 
      ? ['दृष्टि', 'अस्पेक्ट', 'युति', 'संयोग']
      : ['drishti', 'aspect', 'conjunction', 'yuti'];

    const houseKeywords = isNepali 
      ? ['घर', 'भाव', 'प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश']
      : ['house', 'bhava', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

    const nakshatraKeywords = isNepali 
      ? ['नक्षत्र', 'तारा', 'सितारा']
      : ['nakshatra', 'star', 'constellation'];

    // Check requirements
    if (shadbalaKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.shadbala = true;
    }

    if (dashaKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.dashas = true;
    }

    if (yogaKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.yogas = true;
    }

    if (doshaKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.doshas = true;
    }

    if (transitKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.transits = true;
    }

    if (aspectKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.aspects = true;
    }

    if (houseKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.houses = true;
    }

    if (nakshatraKeywords.some(keyword => questionLower.includes(keyword))) {
      requirements.nakshatras = true;
    }

    // Check if any requirements are needed
    const hasRequirements = requirements.divisionals.length > 0 || 
      requirements.shadbala || requirements.dashas || requirements.yogas || 
      requirements.doshas || requirements.transits || requirements.aspects || 
      requirements.houses || requirements.nakshatras;

    return hasRequirements ? requirements : undefined;
  }

  // Check if current data satisfies requirements
  private checkDataAvailability(requirements: DataNeeded, astroData: AstroData): boolean {
    // Check divisional charts
    if (requirements.divisionals.length > 0) {
      const availableDivisionals = astroData.divisionals?.map(d => d.chart) || [];
      const missingDivisionals = requirements.divisionals.filter(req => 
        !availableDivisionals.includes(req)
      );
      if (missingDivisionals.length > 0) return false;
    }

    // Check other requirements
    if (requirements.shadbala && !astroData.shadbala?.length) return false;
    if (requirements.dashas && !astroData.dashas?.length) return false;
    if (requirements.yogas && !astroData.yogas?.length) return false;
    if (requirements.doshas && !astroData.doshas?.length) return false;
    if (requirements.transits && !astroData.transits?.length) return false;
    if (requirements.aspects && !astroData.aspects?.length) return false;
    if (requirements.houses && !astroData.houses?.length) return false;
    if (requirements.nakshatras && !astroData.nakshatras?.length) return false;

    return true;
  }

  // Get base instructions
  private getBaseInstructions(): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `आप एक अनुभवी ज्योतिषी हैं जो केवल प्रदान किए गए कार्ड डेटा के आधार पर विश्लेषण करते हैं। आपको कभी भी काल्पनिक या अनुमानित जानकारी नहीं देनी चाहिए।`
      : `You are an experienced astrologer who analyzes based only on the provided card data. You must never provide fictional or speculative information.`;
  }

  // Get data-specific instructions
  private getDataInstructions(astroData: AstroData): string {
    const isNepali = this.lang === 'ne';
    
    let instructions = isNepali 
      ? `उपलब्ध डेटा:\n`
      : `Available Data:\n`;

    if (astroData.d1?.length) {
      instructions += isNepali 
        ? `- D1 ग्रह स्थिति: ${astroData.d1.length} ग्रह\n`
        : `- D1 Planet Positions: ${astroData.d1.length} planets\n`;
    }

    if (astroData.divisionals?.length) {
      const charts = astroData.divisionals.map(d => d.chart).join(', ');
      instructions += isNepali 
        ? `- विभाजन चार्ट: ${charts}\n`
        : `- Divisional Charts: ${charts}\n`;
    }

    if (astroData.yogas?.length) {
      const yogaDetails = astroData.yogas.map(y => 
        y.why ? `${y.label} (${y.why})` : y.label
      ).join('; ');
      instructions += isNepali 
        ? `- योग: ${yogaDetails}\n`
        : `- Yogas: ${yogaDetails}\n`;
    }

    if (astroData.doshas?.length) {
      instructions += isNepali 
        ? `- दोष: ${astroData.doshas.length} दोष\n`
        : `- Doshas: ${astroData.doshas.length} doshas\n`;
    }

    if (astroData.shadbala?.length) {
      instructions += isNepali 
        ? `- षड्बल: ${astroData.shadbala.length} ग्रह\n`
        : `- Shadbala: ${astroData.shadbala.length} planets\n`;
    }

    if (astroData.dashas?.length) {
      instructions += isNepali 
        ? `- दशा: ${astroData.dashas.length} दशा\n`
        : `- Dashas: ${astroData.dashas.length} dashas\n`;
    }

    return instructions;
  }

  // Get evidence instructions
  private getEvidenceInstructions(evidenceCards: any[]): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `प्रमाण कार्ड:\nआपको प्रदान किए गए प्रमाण कार्डों का उपयोग करना चाहिए। ये कार्ड चिन, हथेली, या दस्तावेज विश्लेषण से आते हैं।`
      : `Evidence Cards:\nYou should use the provided evidence cards. These cards come from chin, palm, or document analysis.`;
  }

  // Get history instructions
  private getHistoryInstructions(sessionHistory: string[]): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `सत्र इतिहास:\nपिछले प्रश्नों और उत्तरों का संदर्भ लें।`
      : `Session History:\nReference previous questions and answers.`;
  }

  // Get safety instructions
  private getSafetyInstructions(): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `सुरक्षा नियम:\n- मृत्यु की भविष्यवाणी न करें\n- केवल उपलब्ध डेटा का उपयोग करें\n- अनिश्चित होने पर कहें कि अधिक डेटा की आवश्यकता है\n- सकारात्मक और सहायक रहें`
      : `Safety Rules:\n- Do not predict death\n- Use only available data\n- When uncertain, say more data is needed\n- Be positive and helpful`;
  }

  // Get response format instructions
  private getResponseFormatInstructions(): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `उत्तर प्रारूप:\n- स्पष्ट और संक्षिप्त उत्तर दें\n- ज्योतिषीय तथ्यों का उल्लेख करें\n- व्यावहारिक सलाह दें\n- यदि अधिक डेटा की आवश्यकता है तो बताएं`
      : `Response Format:\n- Provide clear and concise answers\n- Mention astrological facts\n- Give practical advice\n- Indicate if more data is needed`;
  }

  // Analyze question
  private analyzeQuestion(question: string): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `प्रश्न विश्लेषण:\n"${question}"\n\nयह प्रश्न ज्योतिषीय विश्लेषण की मांग करता है।`
      : `Question Analysis:\n"${question}"\n\nThis question requires astrological analysis.`;
  }

  // Get context info
  private getContextInfo(astroData: AstroData): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `ज्योतिषीय संदर्भ:\nउपलब्ध कार्ड डेटा के आधार पर विश्लेषण करें।`
      : `Astrological Context:\nAnalyze based on available card data.`;
  }

  // Get evidence info
  private getEvidenceInfo(): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `प्रमाण जानकारी:\nप्रदान किए गए प्रमाण कार्डों का उपयोग करें।`
      : `Evidence Information:\nUse the provided evidence cards.`;
  }

  // Get question instructions
  private getQuestionInstructions(question: string): string {
    const isNepali = this.lang === 'ne';
    
    return isNepali 
      ? `कृपया इस प्रश्न का उत्तर दें:\n"${question}"`
      : `Please answer this question:\n"${question}"`;
  }
}

// Export helper functions
export function buildEnhancedPrompts(context: PromptContext): PromptResult {
  const builder = new EnhancedPromptBuilder(context);
  const systemPrompt = builder.buildSystemPrompt();
  const { prompt: userPrompt, dataNeeded } = builder.buildUserPrompt();
  
  return {
    systemPrompt,
    userPrompt,
    dataNeeded,
    confidence: dataNeeded ? 0.8 : 0.9
  };
}

// Check if data is sufficient for question
export function isDataSufficient(question: string, astroData: AstroData, lang: Lang): boolean {
  const builder = new EnhancedPromptBuilder({ astroData, question, lang });
  const { dataNeeded } = builder.buildUserPrompt();
  
  if (!dataNeeded) return true;
  
  return builder['checkDataAvailability'](dataNeeded, astroData);
}

// Get missing data requirements
export function getMissingDataRequirements(question: string, astroData: AstroData, lang: Lang): DataNeeded | null {
  const builder = new EnhancedPromptBuilder({ astroData, question, lang });
  const { dataNeeded } = builder.buildUserPrompt();
  
  if (!dataNeeded) return null;
  
  const isSufficient = builder['checkDataAvailability'](dataNeeded, astroData);
  return isSufficient ? null : dataNeeded;
}
