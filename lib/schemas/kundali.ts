import { z } from "zod";

export const PlanetZ = z.object({
  planet: z.string(),
  signId: z.number(),
  signLabel: z.string(),
  house: z.number(),
  retro: z.boolean().optional().default(false),
});

export const YogaZ = z.object({
  key: z.string(),
  label: z.string(),
  factors: z.array(z.string()).default([]),
});

export const DoshaZ = YogaZ;

export const KundaliResultZ = z.object({
  ascSignId: z.number(),
  ascSignLabel: z.string(),
  d1: z.array(PlanetZ),
  yogas: z.array(YogaZ).default([]),
  doshas: z.array(DoshaZ).default([]),
  lang: z.enum(["ne", "en"]).default("ne"),
});

export type KundaliResult = z.infer<typeof KundaliResultZ>;
