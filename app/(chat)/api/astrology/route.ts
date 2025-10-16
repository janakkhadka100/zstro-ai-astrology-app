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

    // 3) Build Prompt (✅ use PromptQuery; normalize language null→undefined)
    const promptInput: PromptQuery = {
      text: question ?? "",
      language: language ?? undefined,
    };

    const { systemPrompt, userPrompt } = generateAstroPrompt(promptInput, {
      ...(astrologyData as AstrologyData),
      yogas,
      doshas,
    });

    // 4) Call OpenAI
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
      "क्षमा गर्नुहोस्, कुनै उत्तर उपलब्ध छैन।";

    return NextResponse.json({
      success: true,
      answer,
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
