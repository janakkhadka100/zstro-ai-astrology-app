import { z } from 'zod';

// Core enums
export const SignIdSchema = z.number().int().min(1).max(12);
export const HouseSchema = z.number().int().min(1).max(12);

export const PlanetNameSchema = z.enum([
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
]);

export const DashaLevelSchema = z.enum([
  "MAHA", "ANTAR", "PRATYANTAR", "SUKSHMA", "PRANA"
]);

export const YoginiLevelSchema = z.enum([
  "YOGINI", "Y_ANTAR", "Y_PRATYANTAR", "Y_SUKSHMA"
]);

export const LanguageSchema = z.enum(["ne", "en"]);

// Shadbala schema
export const ShadbalaSchema = z.object({
  total: z.number().min(0),
  sthana: z.number().min(0),
  dig: z.number().min(0),
  kala: z.number().min(0),
  chestha: z.number().min(0),
  naisargika: z.number().min(0)
}).strict();

// Planet schema
export const PlanetSchema = z.object({
  planet: PlanetNameSchema,
  signId: SignIdSchema,
  signLabel: z.string().optional(),
  degree: z.number().nullable().optional(),
  house: HouseSchema.nullable().optional(),
  shadbala: ShadbalaSchema.nullable().optional()
}).strict();

// DashaBlock schema
export const DashaBlockSchema: z.ZodType<DashaBlock> = z.lazy(() => z.object({
  name: z.string(),
  lord: z.string(),
  start: z.string().datetime(), // ISO UTC
  end: z.string().datetime(),   // ISO UTC
  level: DashaLevelSchema,
  children: z.array(DashaBlockSchema).optional()
}).strict());

// YoginiDasha schema
export const YoginiDashaSchema: z.ZodType<YoginiDasha> = z.lazy(() => z.object({
  name: z.string(),
  lord: z.string(),
  start: z.string().datetime(), // ISO UTC
  end: z.string().datetime(),   // ISO UTC
  level: YoginiLevelSchema,
  children: z.array(YoginiDashaSchema).optional()
}).strict());

// Input schema
export const AstroInputSchema = z.object({
  ascSignId: SignIdSchema,
  ascSignLabel: z.string().optional(),
  d1: z.array(PlanetSchema),
  shadbala: z.record(PlanetNameSchema, ShadbalaSchema).optional(),
  vimshottari: z.array(DashaBlockSchema).optional(),
  yogini: z.array(YoginiDashaSchema).optional(),
  lang: LanguageSchema.optional().default("ne")
}).strict();

// Mismatch schema
export const MismatchSchema = z.object({
  planet: PlanetNameSchema,
  apiHouse: HouseSchema,
  derivedHouse: HouseSchema
}).strict();

// Output planet schema (with safeHouse)
export const PlanetOutputSchema = z.object({
  planet: PlanetNameSchema,
  signId: SignIdSchema,
  signLabel: z.string(),
  degree: z.number().nullable(),
  house: HouseSchema.nullable(),
  safeHouse: HouseSchema,
  shadbala: ShadbalaSchema.nullable()
}).strict();

// Shadbala table row schema
export const ShadbalaTableRowSchema = z.object({
  planet: PlanetNameSchema,
  total: z.number(),
  sthana: z.number(),
  dig: z.number(),
  kala: z.number(),
  chestha: z.number(),
  naisargika: z.number()
}).strict();

// Output schema
export const AstroOutputSchema = z.object({
  ascSignId: SignIdSchema,
  ascSignLabel: z.string(),
  planets: z.array(PlanetOutputSchema),
  shadbalaTable: z.array(ShadbalaTableRowSchema),
  vimshottariTree: z.array(DashaBlockSchema),
  yoginiTree: z.array(YoginiDashaSchema),
  mismatches: z.array(MismatchSchema),
  dashaFixes: z.array(z.string()),
  lang: LanguageSchema
}).strict();

// Type exports
export type SignId = z.infer<typeof SignIdSchema>;
export type House = z.infer<typeof HouseSchema>;
export type PlanetName = z.infer<typeof PlanetNameSchema>;
export type DashaLevel = z.infer<typeof DashaLevelSchema>;
export type YoginiLevel = z.infer<typeof YoginiLevelSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Shadbala = z.infer<typeof ShadbalaSchema>;
export type Planet = z.infer<typeof PlanetSchema>;
export type DashaBlock = z.infer<typeof DashaBlockSchema>;
export type YoginiDasha = z.infer<typeof YoginiDashaSchema>;
export type AstroInput = z.infer<typeof AstroInputSchema>;
export type Mismatch = z.infer<typeof MismatchSchema>;
export type PlanetOutput = z.infer<typeof PlanetOutputSchema>;
export type ShadbalaTableRow = z.infer<typeof ShadbalaTableRowSchema>;
export type AstroOutput = z.infer<typeof AstroOutputSchema>;
