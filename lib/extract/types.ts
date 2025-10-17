// lib/extract/types.ts
// Evidence types for visual analysis - single source of truth

export type Lang = "ne" | "en";

export interface FileRef {
  id: string;            // uuid
  kind: "image" | "pdf";
  mime: string;
  url: string;           // storage URL (signed/local)
  name: string;
  size: number;          // bytes
  pages?: number;        // for pdf
  uploadedAt: string;    // ISO timestamp
}

export interface ChinObservation {
  jawAngleDeg?: number;              // geometric
  chinWidthPct?: number;             // width/face-width
  chinDepthPct?: number;             // protrusion proxy
  dimpleLikely?: boolean;
  beardCoverage?: "none"|"light"|"heavy";
  lightingOk?: boolean;
  qualityNote?: string;              // e.g., blur/wrong angle
  confidence?: number;               // 0-1
}

export interface PalmObservation {
  lineQuality: "low"|"medium"|"high";
  heartLineShape?: "straight"|"curved"|"forked"|"broken";
  headLineShape?: "straight"|"curved"|"forked"|"broken";
  lifeLineShape?: "long"|"short"|"chained"|"broken";
  fateLinePresent?: boolean;
  mountsStrong?: string[];           // e.g., ["Jupiter","Venus"]
  handednessGuess?: "left"|"right"|"unknown";
  qualityNote?: string;
  confidence?: number;               // 0-1
}

export interface DocObservation {
  ocrText: string;                   // normalized, language-agnostic
  pages: number;
  hasTables?: boolean;
  containsDates?: string[];          // ISO strings detected
  language?: string;                 // detected language
  qualityNote?: string;
  confidence?: number;               // 0-1
}

export interface EvidenceCard {
  fileId: string;
  type: "chin" | "palm" | "document";
  title: string;                     // UI title
  summary: string;                   // one-liner
  chin?: ChinObservation;
  palm?: PalmObservation;
  doc?: DocObservation;
  warnings?: string[];               // e.g., low light, angle
  extractedAt: string;              // ISO timestamp
}

export interface EvidenceBundle {
  files: FileRef[];
  cards: EvidenceCard[];
  lang: Lang;
  extractedAt: string;
}

// Upload request/response types
export interface UploadRequest {
  files: File[];
  lang?: Lang;
}

export interface UploadResponse {
  success: boolean;
  files: FileRef[];
  errors?: string[];
}

// Extraction request/response types
export interface ExtractRequest {
  files: FileRef[];
  lang: Lang;
}

export interface ExtractResponse {
  success: boolean;
  bundle: EvidenceBundle;
  errors?: string[];
}

// Chat integration types
export interface ChatWithEvidenceRequest {
  question: string;
  lang: Lang;
  prokeralaData?: any;              // Existing astrology data
  evidenceBundle?: EvidenceBundle;  // Visual evidence
}

export interface ChatWithEvidenceResponse {
  success: boolean;
  analysis: string;
  cardsUsed: {
    prokerala: boolean;
    evidence: boolean;
  };
  warnings?: string[];
}

// File validation types
export interface FileValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Extraction pipeline types
export interface ExtractionPipeline {
  extractImage: (file: FileRef, lang: Lang) => Promise<EvidenceCard>;
  extractPdf: (file: FileRef, lang: Lang) => Promise<EvidenceCard>;
  extractOcr: (imageData: Buffer, lang: Lang) => Promise<string>;
}

// Storage provider types
export interface StorageProvider {
  upload: (file: File, path: string) => Promise<string>;
  delete: (path: string) => Promise<void>;
  getUrl: (path: string) => string;
}

// Vision detection types
export interface FaceDetection {
  boundingBox: { x: number; y: number; width: number; height: number };
  landmarks?: { x: number; y: number }[];
  confidence: number;
}

export interface PalmDetection {
  boundingBox: { x: number; y: number; width: number; height: number };
  keypoints?: { x: number; y: number }[];
  orientation: "left" | "right" | "unknown";
  confidence: number;
}

export interface DocumentDetection {
  boundingBox: { x: number; y: number; width: number; height: number };
  textRegions: { x: number; y: number; width: number; height: number }[];
  confidence: number;
}

// Quality assessment types
export interface QualityAssessment {
  overall: "low" | "medium" | "high";
  factors: {
    lighting: "poor" | "fair" | "good";
    angle: "poor" | "fair" | "good";
    resolution: "poor" | "fair" | "good";
    blur: "none" | "slight" | "significant";
  };
  recommendations: string[];
}
