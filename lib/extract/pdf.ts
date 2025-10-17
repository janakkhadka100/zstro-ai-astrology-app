// lib/extract/pdf.ts
// PDF extraction pipeline

import { FileRef, EvidenceCard, DocObservation, Lang } from './types';
import { extractOcr, extractDates, detectLanguage } from './ocr';

export async function extractFromPdf(file: FileRef, lang: Lang): Promise<EvidenceCard> {
  try {
    // Fetch PDF data
    const response = await fetch(file.url);
    const pdfData = Buffer.from(await response.arrayBuffer());
    
    // Extract text using pdf-parse
    const text = await extractTextFromPdf(pdfData);
    
    // Extract images from PDF (first page only for now)
    const images = await extractImagesFromPdf(pdfData);
    
    // Perform OCR on images if text extraction was poor
    let ocrText = text;
    if (text.length < 100 && images.length > 0) {
      const imageOcrResults = await Promise.all(
        images.slice(0, 3).map(img => extractOcr(img, lang)) // Limit to first 3 pages
      );
      ocrText = imageOcrResults.join('\n\n');
    }
    
    // Analyze document
    const docObs: DocObservation = {
      ocrText: ocrText || 'No text extracted',
      pages: file.pages || 1,
      confidence: text.length > 100 ? 0.8 : 0.5
    };
    
    // Extract dates
    docObs.containsDates = extractDates(ocrText);
    
    // Detect tables
    docObs.hasTables = detectTablesInText(ocrText);
    
    // Detect language
    docObs.language = detectLanguage(ocrText);
    
    // Quality assessment
    const warnings: string[] = [];
    if (ocrText.length < 50) {
      warnings.push('Very little text extracted from PDF');
    }
    if (docObs.pages > 10) {
      warnings.push('Large PDF may take longer to process');
    }
    
    const title = lang === 'ne' ? 'PDF कागजात विश्लेषण' : 'PDF Document Analysis';
    const summary = lang === 'ne'
      ? `पृष्ठ: ${docObs.pages}, पाठ: ${ocrText.length} अक्षर`
      : `Pages: ${docObs.pages}, Text: ${ocrText.length} characters`;
    
    return {
      fileId: file.id,
      type: 'document',
      title,
      summary,
      doc: docObs,
      warnings,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting from PDF:', error);
    return createErrorCard(file, `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractTextFromPdf(pdfData: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid bundling issues
    const pdfParse = await import('pdf-parse');
    
    const data = await pdfParse.default(pdfData);
    return data.text || '';
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
}

async function extractImagesFromPdf(pdfData: Buffer): Promise<Buffer[]> {
  try {
    // For now, return empty array
    // In a real implementation, this would use pdf-poppler or similar
    // to convert PDF pages to images
    console.log('PDF image extraction not implemented');
    return [];
  } catch (error) {
    console.error('PDF image extraction error:', error);
    return [];
  }
}

function detectTablesInText(text: string): boolean {
  // Simple heuristic for table detection in text
  const lines = text.split('\n');
  const tabLines = lines.filter(line => 
    line.includes('\t') || 
    line.match(/\s{3,}/) ||
    line.match(/\|.*\|/) // Pipe-separated values
  );
  
  return tabLines.length > 2;
}

function createErrorCard(file: FileRef, error: string): EvidenceCard {
  return {
    fileId: file.id,
    type: 'document',
    title: 'PDF Analysis Error',
    summary: error,
    warnings: [error],
    extractedAt: new Date().toISOString()
  };
}

// Utility functions for PDF analysis

export function estimatePdfPages(pdfData: Buffer): number {
  // Simple estimation based on file size
  // In a real implementation, this would parse the PDF structure
  const size = pdfData.length;
  
  // Rough estimation: 50KB per page
  const estimatedPages = Math.max(1, Math.round(size / 50000));
  
  return Math.min(estimatedPages, 100); // Cap at 100 pages
}

export function isPdfValid(pdfData: Buffer): boolean {
  // Check PDF magic number
  const pdfHeader = pdfData.subarray(0, 4);
  return pdfHeader.toString() === '%PDF';
}

export function extractPdfMetadata(pdfData: Buffer): {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
} {
  // Simplified metadata extraction
  // In a real implementation, this would parse PDF metadata
  return {
    title: 'Unknown',
    author: 'Unknown',
    creationDate: new Date().toISOString()
  };
}

export function extractPdfOutline(pdfData: Buffer): Array<{
  title: string;
  page: number;
  level: number;
}> {
  // Simplified outline extraction
  // In a real implementation, this would parse PDF bookmarks
  return [];
}

export function extractPdfAnnotations(pdfData: Buffer): Array<{
  type: string;
  page: number;
  content?: string;
  position?: { x: number; y: number; width: number; height: number };
}> {
  // Simplified annotation extraction
  // In a real implementation, this would parse PDF annotations
  return [];
}

// PDF processing utilities

export async function convertPdfToImages(
  pdfData: Buffer, 
  options: {
    pages?: number[];
    dpi?: number;
    format?: 'png' | 'jpeg';
  } = {}
): Promise<Buffer[]> {
  const { pages = [1], dpi = 150, format = 'png' } = options;
  
  try {
    // TODO: Implement PDF to image conversion
    // This would use pdf-poppler or similar library
    console.log('PDF to image conversion not implemented');
    return [];
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    return [];
  }
}

export async function extractPdfTextByPage(pdfData: Buffer): Promise<string[]> {
  try {
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(pdfData);
    
    // Split text by pages (simplified)
    const pages = data.text.split('\f'); // Form feed character
    return pages.map(page => page.trim()).filter(page => page.length > 0);
  } catch (error) {
    console.error('PDF page text extraction error:', error);
    return [];
  }
}

export function analyzePdfStructure(pdfData: Buffer): {
  hasImages: boolean;
  hasText: boolean;
  hasForms: boolean;
  hasAnnotations: boolean;
  isScanned: boolean;
} {
  // Simplified PDF structure analysis
  // In a real implementation, this would parse PDF objects
  
  const text = pdfData.toString('latin1');
  
  return {
    hasImages: text.includes('/Image'),
    hasText: text.includes('/Font'),
    hasForms: text.includes('/AcroForm'),
    hasAnnotations: text.includes('/Annot'),
    isScanned: !text.includes('/Font') && text.includes('/Image')
  };
}
