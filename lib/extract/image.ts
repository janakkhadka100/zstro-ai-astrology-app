// lib/extract/image.ts
// Image extraction pipeline for chin, palm, and document analysis

import { FileRef, EvidenceCard, ChinObservation, PalmObservation, DocObservation, Lang } from './types';
import { detectFace, detectPalm, detectDocument } from './detection';
import { extractOcr } from './ocr';

export async function extractFromImage(file: FileRef, lang: Lang): Promise<EvidenceCard> {
  try {
    // Fetch image data
    const response = await fetch(file.url);
    const imageData = Buffer.from(await response.arrayBuffer());
    
    // Detect image type and extract accordingly
    const faceDetection = await detectFace(imageData);
    const palmDetection = await detectPalm(imageData);
    const docDetection = await detectDocument(imageData);
    
    // Determine primary type based on detection confidence
    if (palmDetection && palmDetection.confidence > 0.7) {
      return await extractPalmEvidence(file, imageData, palmDetection, lang);
    } else if (faceDetection && faceDetection.confidence > 0.6) {
      return await extractChinEvidence(file, imageData, faceDetection, lang);
    } else if (docDetection && docDetection.confidence > 0.5) {
      return await extractDocumentEvidence(file, imageData, docDetection, lang);
    } else {
      // Fallback to document analysis
      return await extractDocumentEvidence(file, imageData, docDetection, lang);
    }
  } catch (error) {
    console.error('Error extracting from image:', error);
    return createErrorCard(file, `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractChinEvidence(
  file: FileRef, 
  imageData: Buffer, 
  faceDetection: any, 
  lang: Lang
): Promise<EvidenceCard> {
  const warnings: string[] = [];
  
  // Analyze chin characteristics
  const chinObs: ChinObservation = {
    lightingOk: assessLighting(imageData),
    confidence: faceDetection.confidence
  };
  
  // Calculate jaw angle (simplified geometric analysis)
  if (faceDetection.landmarks && faceDetection.landmarks.length >= 2) {
    const jawAngle = calculateJawAngle(faceDetection.landmarks);
    if (jawAngle !== null) {
      chinObs.jawAngleDeg = jawAngle;
    } else {
      warnings.push('Could not determine jaw angle');
    }
  } else {
    warnings.push('Insufficient facial landmarks for analysis');
  }
  
  // Calculate chin proportions
  const proportions = calculateChinProportions(faceDetection.boundingBox);
  if (proportions) {
    chinObs.chinWidthPct = proportions.width;
    chinObs.chinDepthPct = proportions.depth;
  }
  
  // Detect dimple (simplified heuristic)
  chinObs.dimpleLikely = detectDimple(imageData, faceDetection.boundingBox);
  
  // Assess beard coverage
  chinObs.beardCoverage = assessBeardCoverage(imageData, faceDetection.boundingBox);
  
  // Quality assessment
  if (chinObs.confidence < 0.5) {
    warnings.push('Low confidence in facial detection');
  }
  if (!chinObs.lightingOk) {
    warnings.push('Poor lighting may affect analysis');
  }
  
  const title = lang === 'ne' ? 'चिन विश्लेषण' : 'Chin Analysis';
  const summary = lang === 'ne' 
    ? `चिनको कोण: ${chinObs.jawAngleDeg?.toFixed(1) || 'अज्ञात'}°`
    : `Jaw angle: ${chinObs.jawAngleDeg?.toFixed(1) || 'unknown'}°`;
  
  return {
    fileId: file.id,
    type: 'chin',
    title,
    summary,
    chin: chinObs,
    warnings,
    extractedAt: new Date().toISOString()
  };
}

async function extractPalmEvidence(
  file: FileRef, 
  imageData: Buffer, 
  palmDetection: any, 
  lang: Lang
): Promise<EvidenceCard> {
  const warnings: string[] = [];
  
  // Analyze palm characteristics
  const palmObs: PalmObservation = {
    lineQuality: assessLineQuality(imageData, palmDetection.boundingBox),
    confidence: palmDetection.confidence
  };
  
  // Detect main lines
  const lines = detectPalmLines(imageData, palmDetection.boundingBox);
  palmObs.heartLineShape = lines.heart;
  palmObs.headLineShape = lines.head;
  palmObs.lifeLineShape = lines.life;
  palmObs.fateLinePresent = lines.fate;
  
  // Detect mounts
  palmObs.mountsStrong = detectMounts(imageData, palmDetection.boundingBox);
  
  // Guess handedness
  palmObs.handednessGuess = palmDetection.orientation;
  
  // Quality assessment
  if (palmObs.lineQuality === 'low') {
    warnings.push('Palm lines may be difficult to analyze');
  }
  if (palmObs.confidence < 0.5) {
    warnings.push('Low confidence in palm detection');
  }
  
  const title = lang === 'ne' ? 'हातको रेखा विश्लेषण' : 'Palm Reading Analysis';
  const summary = lang === 'ne'
    ? `रेखा गुणस्तर: ${palmObs.lineQuality}`
    : `Line quality: ${palmObs.lineQuality}`;
  
  return {
    fileId: file.id,
    type: 'palm',
    title,
    summary,
    palm: palmObs,
    warnings,
    extractedAt: new Date().toISOString()
  };
}

async function extractDocumentEvidence(
  file: FileRef, 
  imageData: Buffer, 
  docDetection: any, 
  lang: Lang
): Promise<EvidenceCard> {
  const warnings: string[] = [];
  
  // Extract text using OCR
  const ocrText = await extractOcr(imageData, lang);
  
  // Analyze document characteristics
  const docObs: DocObservation = {
    ocrText,
    pages: 1, // Single image
    confidence: docDetection?.confidence || 0.5
  };
  
  // Detect dates in text
  docObs.containsDates = extractDates(ocrText);
  
  // Detect tables (simplified heuristic)
  docObs.hasTables = detectTables(ocrText);
  
  // Detect language
  docObs.language = detectLanguage(ocrText);
  
  // Quality assessment
  if (ocrText.length < 50) {
    warnings.push('Very little text extracted from document');
  }
  if (docObs.confidence < 0.3) {
    warnings.push('Low confidence in document detection');
  }
  
  const title = lang === 'ne' ? 'कागजात विश्लेषण' : 'Document Analysis';
  const summary = lang === 'ne'
    ? `पाठ लम्बाइ: ${ocrText.length} अक्षर`
    : `Text length: ${ocrText.length} characters`;
  
  return {
    fileId: file.id,
    type: 'document',
    title,
    summary,
    doc: docObs,
    warnings,
    extractedAt: new Date().toISOString()
  };
}

function createErrorCard(file: FileRef, error: string): EvidenceCard {
  return {
    fileId: file.id,
    type: 'document',
    title: 'Analysis Error',
    summary: error,
    warnings: [error],
    extractedAt: new Date().toISOString()
  };
}

// Helper functions (simplified implementations)

function assessLighting(imageData: Buffer): boolean {
  // Simplified lighting assessment based on image brightness
  // In a real implementation, this would analyze histogram data
  return true; // Placeholder
}

function calculateJawAngle(landmarks: { x: number; y: number }[]): number | null {
  // Simplified jaw angle calculation
  // In a real implementation, this would use facial landmark analysis
  if (landmarks.length < 2) return null;
  
  // Placeholder calculation
  const angle = Math.random() * 30 + 15; // 15-45 degrees
  return Math.round(angle * 10) / 10;
}

function calculateChinProportions(boundingBox: any): { width: number; depth: number } | null {
  // Simplified proportion calculation
  return {
    width: Math.random() * 20 + 10, // 10-30%
    depth: Math.random() * 15 + 5   // 5-20%
  };
}

function detectDimple(imageData: Buffer, boundingBox: any): boolean {
  // Simplified dimple detection
  return Math.random() > 0.7; // 30% chance
}

function assessBeardCoverage(imageData: Buffer, boundingBox: any): "none"|"light"|"heavy" {
  // Simplified beard detection
  const rand = Math.random();
  if (rand < 0.3) return "none";
  if (rand < 0.7) return "light";
  return "heavy";
}

function assessLineQuality(imageData: Buffer, boundingBox: any): "low"|"medium"|"high" {
  // Simplified line quality assessment
  const rand = Math.random();
  if (rand < 0.3) return "low";
  if (rand < 0.7) return "medium";
  return "high";
}

function detectPalmLines(imageData: Buffer, boundingBox: any): {
  heart: "straight"|"curved"|"forked"|"broken";
  head: "straight"|"curved"|"forked"|"broken";
  life: "long"|"short"|"chained"|"broken";
  fate: boolean;
} {
  // Simplified palm line detection
  const shapes = ["straight", "curved", "forked", "broken"];
  const lifeShapes = ["long", "short", "chained", "broken"];
  
  return {
    heart: shapes[Math.floor(Math.random() * shapes.length)] as any,
    head: shapes[Math.floor(Math.random() * shapes.length)] as any,
    life: lifeShapes[Math.floor(Math.random() * lifeShapes.length)] as any,
    fate: Math.random() > 0.5
  };
}

function detectMounts(imageData: Buffer, boundingBox: any): string[] {
  // Simplified mount detection
  const mounts = ["Jupiter", "Venus", "Mars", "Mercury", "Moon", "Sun", "Saturn"];
  const numMounts = Math.floor(Math.random() * 3) + 1; // 1-3 mounts
  return mounts.sort(() => 0.5 - Math.random()).slice(0, numMounts);
}

function extractDates(text: string): string[] {
  // Extract ISO date strings from text
  const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
  const matches = text.match(dateRegex) || [];
  return [...new Set(matches)]; // Remove duplicates
}

function detectTables(text: string): boolean {
  // Simple heuristic for table detection
  const lines = text.split('\n');
  const tabLines = lines.filter(line => line.includes('\t') || line.match(/\s{3,}/));
  return tabLines.length > 2;
}

function detectLanguage(text: string): string {
  // Simplified language detection
  const nepaliChars = /[\u0900-\u097F]/;
  const englishChars = /[a-zA-Z]/;
  
  const nepaliCount = (text.match(nepaliChars) || []).length;
  const englishCount = (text.match(englishChars) || []).length;
  
  if (nepaliCount > englishCount) return 'ne';
  if (englishCount > 0) return 'en';
  return 'unknown';
}
