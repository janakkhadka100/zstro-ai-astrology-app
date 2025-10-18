// app/(chat)/api/astrology/route.ts
import { NextResponse } from "next/server";
import openai from "@/lib/ai/openaiClient";
import prokeralaService from "@/lib/prokerala/service";

import type {
  AstrologyData,
  UserQuery,
  DivisionalChart,
} from "@/lib/prokerala/types";

import { generateAstroPrompt, type PromptQuery } from "@/lib/prokerala/prompts";
import { detectYogas } from "@/lib/astro/yoga-detectors";
import detectDoshas from "@/lib/astro/dosha-detectors";
import { buildEnhancedPrompts, detectDataNeeded, isDataSufficientForQuestion } from '@/lib/ai/prompts-enhanced';
import { analyzeDataRequirements } from '@/lib/ai/data-needed-detector';


export const dynamic = "force-dynamic";

/** optional helper for divisional reinforcement */
function evaluateDivisionalSupport(divs?: DivisionalChart[] | null) {
  if (!divs?.length) return null;
  const notes: string[] = [];
  const benefics = ["Jupiter", "Venus", "Mercury"];
  for (const d of divs) {
    const ok = (d.planets || []).some(
      (p) => benefics.includes(p.planet) && [1, 4, 7, 10].includes(p.house ?? 0)
    );
    if (ok) notes.push(`${d.type} chart shows benefic in Kendra`);
  }
  return notes.length ? notes : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Body may include extra UI fields; we only pluck what we need.
    const {
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      timezone,
      question,
      language,
    } = (body || {}) as Partial<UserQuery> & {
      question?: string;
      language?: string | null;
    };

    // 1) Fetch core astrology data
    const astrologyData: AstrologyData = await prokeralaService.getAstrologyData({
      name: name ?? undefined,
      gender: (gender as any) ?? undefined,
      birthDate: String(birthDate),
      birthTime: String(birthTime),
      birthPlace: String(birthPlace),
      timezone: timezone ?? undefined,
    });

    // 2) Derivations for yogas/doshas
    const chartD1 = astrologyData.planetPositions || [];
    const dignities = astrologyData.dignities || [];
    const aspects = astrologyData.aspects || [];
    const vims = astrologyData.vimshottari || null;
    const divisionals = astrologyData.divisionals || null;

    const yogas = detectYogas(chartD1, dignities, aspects, vims);
    const doshas = detectDoshas(chartD1, vims);
    const divSupport = evaluateDivisionalSupport(divisionals);

    // 3) Enhanced Prompting with DataNeeded Detection
    const lang = (language === 'ne' || language === 'en') ? language : 'ne';
    const questionText = question ?? "";
    
    // Convert to AstroData format for enhanced prompting
    const astroData = {
      d1: chartD1,
      divisionals: divisionals?.map(d => ({
        chart: d.type,
        planets: d.planets || []
      })) || [],
      yogas: yogas,
      doshas: doshas,
      shadbala: [], // Would need to be fetched
      dashas: vims ? [vims] : [],
      transits: [], // Would need to be fetched
      aspects: aspects,
      houses: [], // Would need to be calculated
      nakshatras: [], // Would need to be calculated
      profile: {
        birthDate: String(birthDate),
        birthTime: String(birthTime),
        birthPlace: {
          name: String(birthPlace),
          latitude: 0, // Would need to be geocoded
          longitude: 0,
          timezone: { id: timezone || 'UTC', offset: 0 }
        },
        timezone: { id: timezone || 'UTC', offset: 0 }
      },
      provenance: {
        account: true,
        prokerala: ['d1', 'divisionals', 'yogas', 'doshas', 'dashas']
      }
    };

    // Check if data is sufficient for the question
    const dataAnalysis = analyzeDataRequirements(questionText, astroData, lang);
    
    // If data is not sufficient, return DataNeeded response
    if (!dataAnalysis.sufficient) {
      return NextResponse.json({
        success: true,
        answer: lang === 'ne' 
          ? `अधिक ज्योतिषीय डेटा आवश्यक छ। कृपया प्रतीक्षा गर्नुहोस्...`
          : `More astrological data is needed. Please wait...`,
        dataNeeded: dataAnalysis.missing,
        recommendations: dataAnalysis.recommendations,
        confidence: dataAnalysis.confidence,
        astroData: astrologyData,
        yogas,
        doshas,
        divSupport,
      });
    }

    // Build enhanced prompts
    const promptContext = {
      astroData,
      question: questionText,
      lang,
      evidenceCards: [], // Would be provided if available
      sessionHistory: [] // Would be provided if available
    };

    const { systemPrompt, userPrompt, dataNeeded, confidence } = buildEnhancedPrompts(promptContext);

    // 4) Call OpenAI with enhanced prompts
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const answer =
      chat.choices?.[0]?.message?.content ??
      (lang === 'ne' ? "क्षमा गर्नुहोस्, कुनै उत्तर उपलब्ध छैन।" : "Sorry, no answer available.");

    return NextResponse.json({
      success: true,
      answer,
      dataNeeded: dataNeeded || null,
      confidence,
      astroData: astrologyData,
      yogas,
      doshas,
      divSupport,
    });
  } catch (err: any) {
    console.error("Astrology API Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
