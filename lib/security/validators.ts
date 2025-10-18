// lib/security/validators.ts
// Zod validators for API security

import { z } from 'zod';

// User profile validation
export const ProfileSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  birthPlace: z.object({
    name: z.string().min(1).max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.object({
      id: z.string().min(1).max(100),
      offset: z.number().min(-12).max(14)
    })
  }),
  timezone: z.object({
    id: z.string().min(1).max(100),
    offset: z.number().min(-12).max(14)
  })
});

// Chat message validation
export const ChatMessageSchema = z.object({
  content: z.string().min(1).max(10000).trim(),
  role: z.enum(['user', 'assistant', 'system']),
  metadata: z.record(z.any()).optional()
});

// Analysis request validation
export const AnalysisRequestSchema = z.object({
  question: z.string().min(1).max(1000).trim(),
  lang: z.enum(['ne', 'en']),
  includeCharts: z.boolean().optional().default(false),
  includeSnapshots: z.boolean().optional().default(false)
});

// File upload validation
export const FileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1).max(255),
    size: z.number().min(1).max(10 * 1024 * 1024), // 10MB max
    type: z.string().regex(/^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/, 'Invalid file type'),
    lastModified: z.number().optional()
  }),
  category: z.enum(['chin', 'palm', 'document']),
  metadata: z.record(z.any()).optional()
});

// Fetch request validation
export const FetchRequestSchema = z.object({
  profile: ProfileSchema,
  plan: z.array(z.object({
    kind: z.string().min(1).max(50),
    levels: z.array(z.number()).optional(),
    list: z.array(z.string()).optional(),
    detail: z.boolean().optional()
  })).min(1).max(10),
  lang: z.enum(['ne', 'en'])
});

// Export request validation
export const ExportRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  analysis: z.string().min(1).max(50000),
  cards: z.record(z.any()),
  title: z.string().max(200).optional(),
  lang: z.enum(['ne', 'en']),
  includeCharts: z.boolean().optional().default(false),
  includeSnapshots: z.boolean().optional().default(false)
});

// History request validation
export const HistoryRequestSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  includeStats: z.boolean().optional().default(false)
});

// Session creation validation
export const SessionCreateSchema = z.object({
  title: z.string().min(1).max(200).trim()
});

// User preferences validation
export const UserPreferencesSchema = z.object({
  language: z.enum(['ne', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.record(z.any()).optional(),
  astrologySettings: z.record(z.any()).optional()
});

// API key validation
export const ApiKeySchema = z.object({
  key: z.string().min(32).max(128).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid API key format')
});

// Rate limit validation
export const RateLimitSchema = z.object({
  identifier: z.string().min(1).max(100),
  action: z.string().min(1).max(50),
  limit: z.number().int().min(1).max(10000),
  window: z.number().int().min(60).max(86400) // 1 minute to 24 hours
});

// Security headers validation
export const SecurityHeadersSchema = z.object({
  'content-security-policy': z.string().optional(),
  'x-frame-options': z.enum(['DENY', 'SAMEORIGIN']).optional(),
  'x-content-type-options': z.enum(['nosniff']).optional(),
  'referrer-policy': z.enum(['no-referrer', 'no-referrer-when-downgrade', 'same-origin', 'origin', 'strict-origin', 'origin-when-cross-origin', 'strict-origin-when-cross-origin', 'unsafe-url']).optional(),
  'permissions-policy': z.string().optional()
});

// File type validation helpers
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB for PDFs

// Validation helper functions
export function validateFileType(type: string): boolean {
  return ALLOWED_FILE_TYPES.includes(type);
}

export function validateFileSize(size: number, type: string): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(type)) {
    return size <= MAX_IMAGE_SIZE;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(type)) {
    return size <= MAX_PDF_SIZE;
  }
  return false;
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
}

// Type exports for TypeScript
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type AnalysisRequestInput = z.infer<typeof AnalysisRequestSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type FetchRequestInput = z.infer<typeof FetchRequestSchema>;
export type ExportRequestInput = z.infer<typeof ExportRequestSchema>;
export type HistoryRequestInput = z.infer<typeof HistoryRequestSchema>;
export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
export type ApiKeyInput = z.infer<typeof ApiKeySchema>;
export type RateLimitInput = z.infer<typeof RateLimitSchema>;
export type SecurityHeadersInput = z.infer<typeof SecurityHeadersSchema>;
