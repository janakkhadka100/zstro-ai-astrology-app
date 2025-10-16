// app/api/astrology/route.ts
import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

import prokeralaService from "@/lib/prokerala/service";
import { detectYogas } from "@/lib/astro/yoga-detectors";
import { detectDoshas } from "@/lib/astro/dosha-detectors";
import { evaluateDivisionalSupport } from "@/lib/astro/divisional-yoga";
import { generateAstroPrompt, type PromptQuery } from "@/lib/prokerala/prompts";
import type { AstrologyData, UserQuery } from "@/lib/prokerala/types";
import { rateLimitMiddlewares } from "@/lib/middleware/rateLimit";
import { logger } from "@/lib/services/logger";
import envConfig from "@/lib/config/env";

export const runtime = "nodejs";

const openai = createOpenAI({ apiKey: envConfig.OPENAI_API_KEY });

// Input validation schema
const astrologyRequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  birthPlace: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  question: z.string().optional().default(""),
  language: z.enum(["ne", "en"]).optional().default("ne"),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 
    Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddlewares.astrology(req, async () => {
      const body = await req.json();
      
      // Validate input
      const validationResult = astrologyRequestSchema.safeParse(body);
      if (!validationResult.success) {
        logger.warn('Invalid astrology request', {
          requestId,
          errors: validationResult.error.errors,
        });
        
        return NextResponse.json(
          { 
            error: "Invalid input", 
            details: validationResult.error.errors 
          },
          { status: 400 }
        );
      }

      const {
        birthDate,
        birthTime,
        birthPlace,
        lat,
        lon,
        question,
        language,
      } = validationResult.data;

      // Validate location requirement
      if (!birthPlace && (lat == null || lon == null)) {
        return NextResponse.json(
          { error: "Either birthPlace or lat/lon coordinates are required" },
          { status: 400 }
        );
      }

      logger.info('Processing astrology request', {
        requestId,
        birthDate,
        birthTime,
        birthPlace,
        hasCoordinates: !!(lat && lon),
        language,
      });

      // 1) Fetch full astro data
      const astrologyData = await prokeralaService.getAstrologyData({
        question,
        birthDate,
        birthTime,
        birthPlace,
        lat,
        lon,
      } as UserQuery);

      // 2) Core detections from D1
      const chartD1 = astrologyData.planetPositions || [];
      const dignD1 = astrologyData.dignities || [];
      const aspects = astrologyData.aspects || [];
      const vims = astrologyData.vimshottari || null;

      const yogas = detectYogas(chartD1, dignD1, aspects, vims);
      const doshas = detectDoshas(chartD1, vims);

      // 3) Divisional reinforcement (if available)
      const charts: Record<string, any[]> = {};
      if (astrologyData.divisionals?.length) {
        for (const d of astrologyData.divisionals) charts[d.type] = d.planets || [];
      }
      const divSupport = evaluateDivisionalSupport(
        yogas,
        chartD1,
        { D9: charts["D9"] || [], D10: charts["D10"] || [], D7: charts["D7"] || [], D2: charts["D2"] || [] },
        dignD1,
        { D9: [], D10: [], D7: [], D2: [] }
      );
      const allYogas = [...yogas, ...divSupport];

      // 4) Build prompt (map route inputs -> PromptQuery)
      const promptQuery: PromptQuery = {
        text: (question ?? "").toString(),
        language: (language ?? "ne").toString(),
      };

      const { systemPrompt, userPrompt } = generateAstroPrompt(
        promptQuery,
        {
          ...(astrologyData as AstrologyData),
          yogas: allYogas,
          doshas,
        } as AstrologyData
      );

      // 5) Stream LLM
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
      });

      const duration = Date.now() - startTime;
      logger.info('Astrology request completed successfully', {
        requestId,
        duration,
        yogasCount: allYogas.length,
        doshasCount: doshas.length,
      });

      return result.toDataStreamResponse();
    });

    return rateLimitResult;
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error('Astrology request failed', {
      requestId,
      duration,
      error: err?.message || String(err),
      stack: err?.stack,
    });

    return NextResponse.json(
      { 
        error: "Internal server error", 
        requestId,
        ...(envConfig.NODE_ENV === 'development' && { detail: err?.message || String(err) })
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "api/astrology" });
}
