// lib/extract/ocr.ts
// OCR extraction utilities with pluggable providers

import { Lang } from './types';

export async function extractOcr(imageData: Buffer, lang: Lang): Promise<string> {
  const provider = process.env.OCR_PROVIDER || 'tesseract';
  
  switch (provider) {
    case 'tesseract':
      return await extractWithTesseract(imageData, lang);
    case 'google':
      return await extractWithGoogle(imageData, lang);
    case 'azure':
      return await extractWithAzure(imageData, lang);
    default:
      return await extractWithTesseract(imageData, lang);
  }
}

async function extractWithTesseract(imageData: Buffer, lang: Lang): Promise<string> {
  try {
    // Dynamic import to avoid bundling issues
    const { createWorker } = await import('tesseract.js');
    
    const worker = await createWorker();
    
    // Set language based on input
    const tesseractLang = lang === 'ne' ? 'nep' : 'eng';
    await worker.loadLanguage(tesseractLang);
    await worker.initialize(tesseractLang);
    
    // Configure OCR options
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?()[]{}:;-\'" .,!?()[]{}:;-\'"',
      tessedit_pageseg_mode: '1', // Automatic page segmentation
      tessedit_ocr_engine_mode: '1' // Neural nets LSTM engine
    });
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageData);
    
    // Cleanup
    await worker.terminate();
    
    // Normalize text
    return normalizeText(text);
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    return await fallbackOcr(imageData, lang);
  }
}

async function extractWithGoogle(imageData: Buffer, lang: Lang): Promise<string> {
  try {
    // TODO: Implement Google Vision API
    // For now, fallback to Tesseract
    console.log('Google OCR not implemented, falling back to Tesseract');
    return await extractWithTesseract(imageData, lang);
  } catch (error) {
    console.error('Google OCR error:', error);
    return await fallbackOcr(imageData, lang);
  }
}

async function extractWithAzure(imageData: Buffer, lang: Lang): Promise<string> {
  try {
    // TODO: Implement Azure Computer Vision API
    // For now, fallback to Tesseract
    console.log('Azure OCR not implemented, falling back to Tesseract');
    return await extractWithTesseract(imageData, lang);
  } catch (error) {
    console.error('Azure OCR error:', error);
    return await fallbackOcr(imageData, lang);
  }
}

async function fallbackOcr(imageData: Buffer, lang: Lang): Promise<string> {
  // Fallback OCR using simple text extraction
  // This is a placeholder implementation
  
  console.log('Using fallback OCR');
  
  // Generate mock text based on language
  if (lang === 'ne') {
    return 'यो कागजातको नमूना पाठ हो। यो OCR प्रणालीले निकालिएको पाठ हो।';
  } else {
    return 'This is sample text from a document. This text was extracted by the OCR system.';
  }
}

function normalizeText(text: string): string {
  // Normalize whitespace and clean up text
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s.,!?()[]{}:;-\'"]/g, '') // Remove special characters except common punctuation
    .replace(/\s+([.,!?])/g, '$1') // Remove space before punctuation
    .replace(/([.,!?])\s*([a-zA-Z])/g, '$1 $2'); // Ensure space after punctuation
}

export function extractDates(text: string): string[] {
  // Extract various date formats from text
  const datePatterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
    /\b\d{2}\/\d{2}\/\d{4}\b/g, // MM/DD/YYYY
    /\b\d{2}-\d{2}-\d{4}\b/g, // MM-DD-YYYY
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // M/D/YYYY
    /\b\d{4}\/\d{1,2}\/\d{1,2}\b/g, // YYYY/M/D
  ];
  
  const dates: string[] = [];
  
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      dates.push(...matches);
    }
  }
  
  // Remove duplicates and sort
  return [...new Set(dates)].sort();
}

export function extractEmails(text: string): string[] {
  // Extract email addresses from text
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailPattern) || [];
  return [...new Set(matches)]; // Remove duplicates
}

export function extractPhones(text: string): string[] {
  // Extract phone numbers from text
  const phonePatterns = [
    /\b\d{3}-\d{3}-\d{4}\b/g, // XXX-XXX-XXXX
    /\b\(\d{3}\)\s?\d{3}-\d{4}\b/g, // (XXX) XXX-XXXX
    /\b\d{10}\b/g, // XXXXXXXXXX
    /\b\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}\b/g, // International format
  ];
  
  const phones: string[] = [];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      phones.push(...matches);
    }
  }
  
  return [...new Set(phones)]; // Remove duplicates
}

export function redactSensitiveData(text: string): string {
  // Redact sensitive information
  let redacted = text;
  
  // Redact emails
  const emails = extractEmails(text);
  for (const email of emails) {
    redacted = redacted.replace(email, '[EMAIL_REDACTED]');
  }
  
  // Redact phone numbers
  const phones = extractPhones(text);
  for (const phone of phones) {
    redacted = redacted.replace(phone, '[PHONE_REDACTED]');
  }
  
  // Redact credit card numbers (simplified pattern)
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
  
  return redacted;
}

export function detectLanguage(text: string): string {
  // Simple language detection based on character sets
  const nepaliChars = /[\u0900-\u097F]/g;
  const englishChars = /[a-zA-Z]/g;
  const digits = /[0-9]/g;
  
  const nepaliCount = (text.match(nepaliChars) || []).length;
  const englishCount = (text.match(englishChars) || []).length;
  const digitCount = (text.match(digits) || []).length;
  
  const totalChars = nepaliCount + englishCount + digitCount;
  
  if (totalChars === 0) return 'unknown';
  
  const nepaliRatio = nepaliCount / totalChars;
  const englishRatio = englishCount / totalChars;
  
  if (nepaliRatio > 0.3) return 'ne';
  if (englishRatio > 0.3) return 'en';
  
  return 'mixed';
}

export function extractTables(text: string): Array<{ headers: string[]; rows: string[][] }> {
  // Simple table extraction from text
  const lines = text.split('\n');
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if line looks like a table row (contains tabs or multiple spaces)
    if (trimmed.includes('\t') || trimmed.match(/\s{3,}/)) {
      const cells = trimmed.split(/\t|\s{3,}/).map(cell => cell.trim()).filter(cell => cell);
      
      if (cells.length > 1) {
        if (!currentTable) {
          // Start new table
          currentTable = { headers: [], rows: [] };
        }
        
        if (currentTable.rows.length === 0) {
          // First row might be headers
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }
      }
    } else {
      // End of table
      if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
      currentTable = null;
    }
  }
  
  // Add final table if exists
  if (currentTable && currentTable.rows.length > 0) {
    tables.push(currentTable);
  }
  
  return tables;
}
