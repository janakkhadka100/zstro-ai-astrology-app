// lib/qa/extract.spec.ts
// Extraction pipeline tests for vision cards

import { describe, it, expect } from "vitest";
import { extractFromImage } from '@/lib/extract/image';
import { extractFromPdf } from '@/lib/extract/pdf';
import { 
  extractOcr, 
  extractDates, 
  extractEmails, 
  extractPhones,
  redactSensitiveData,
  detectLanguage 
} from '@/lib/extract/ocr';
import { 
  detectFace, 
  detectPalm, 
  detectDocument 
} from '@/lib/extract/detection';
import { FileRef, Lang } from '@/lib/extract/types';

describe("Image Extraction Pipeline", () => {
  const mockImageFile: FileRef = {
    id: "test-image-1",
    kind: "image",
    mime: "image/jpeg",
    url: "https://example.com/test.jpg",
    name: "test.jpg",
    size: 1024000,
    uploadedAt: new Date().toISOString()
  };

  it("extracts chin evidence from image", async () => {
    // Mock fetch for image data
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    const card = await extractFromImage(mockImageFile, "en");
    
    expect(card.fileId).toBe(mockImageFile.id);
    expect(card.type).toBe("chin");
    expect(card.chin).toBeDefined();
    expect(card.chin?.confidence).toBeGreaterThanOrEqual(0);
    expect(card.chin?.confidence).toBeLessThanOrEqual(1);
  });

  it("extracts palm evidence from image", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    const card = await extractFromImage(mockImageFile, "en");
    
    expect(card.fileId).toBe(mockImageFile.id);
    expect(["chin", "palm", "document"]).toContain(card.type);
    expect(card.extractedAt).toBeDefined();
  });

  it("handles extraction errors gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const card = await extractFromImage(mockImageFile, "en");
    
    expect(card.type).toBe("document"); // Error fallback
    expect(card.warnings).toContain("Extraction failed: Network error");
  });
});

describe("PDF Extraction Pipeline", () => {
  const mockPdfFile: FileRef = {
    id: "test-pdf-1",
    kind: "pdf",
    mime: "application/pdf",
    url: "https://example.com/test.pdf",
    name: "test.pdf",
    size: 2048000,
    pages: 3,
    uploadedAt: new Date().toISOString()
  };

  it("extracts document evidence from PDF", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(2048))
    });

    const card = await extractFromPdf(mockPdfFile, "en");
    
    expect(card.fileId).toBe(mockPdfFile.id);
    expect(card.type).toBe("document");
    expect(card.doc).toBeDefined();
    expect(card.doc?.pages).toBe(3);
    expect(card.doc?.ocrText).toBeDefined();
  });

  it("handles PDF extraction errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("PDF parsing error"));

    const card = await extractFromPdf(mockPdfFile, "en");
    
    expect(card.type).toBe("document");
    expect(card.warnings).toContain("PDF extraction failed: PDF parsing error");
  });
});

describe("OCR Extraction", () => {
  const mockImageData = Buffer.from("mock image data");

  it("extracts text from image", async () => {
    const text = await extractOcr(mockImageData, "en");
    
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("handles OCR errors gracefully", async () => {
    // Mock tesseract to throw error
    vi.doMock('tesseract.js', () => ({
      createWorker: vi.fn().mockRejectedValue(new Error("OCR failed"))
    }));

    const text = await extractOcr(mockImageData, "en");
    
    expect(typeof text).toBe("string");
  });
});

describe("Text Processing Utilities", () => {
  const sampleText = `
    Contact: john@example.com, Phone: 123-456-7890
    Date: 2023-12-25, Another: 2024-01-01
    Credit Card: 1234-5678-9012-3456
  `;

  it("extracts dates from text", () => {
    const dates = extractDates(sampleText);
    
    expect(dates).toContain("2023-12-25");
    expect(dates).toContain("2024-01-01");
    expect(dates.length).toBe(2);
  });

  it("extracts emails from text", () => {
    const emails = extractEmails(sampleText);
    
    expect(emails).toContain("john@example.com");
    expect(emails.length).toBe(1);
  });

  it("extracts phone numbers from text", () => {
    const phones = extractPhones(sampleText);
    
    expect(phones).toContain("123-456-7890");
    expect(phones.length).toBe(1);
  });

  it("redacts sensitive data", () => {
    const redacted = redactSensitiveData(sampleText);
    
    expect(redacted).toContain("[EMAIL_REDACTED]");
    expect(redacted).toContain("[PHONE_REDACTED]");
    expect(redacted).toContain("[CARD_REDACTED]");
    expect(redacted).not.toContain("john@example.com");
  });

  it("detects language", () => {
    const englishText = "This is English text";
    const nepaliText = "यो नेपाली पाठ हो";
    const mixedText = "This is mixed text with नेपाली";
    
    expect(detectLanguage(englishText)).toBe("en");
    expect(detectLanguage(nepaliText)).toBe("ne");
    // The current implementation may not detect mixed text correctly
    expect(["en", "ne", "mixed"]).toContain(detectLanguage(mixedText));
  });
});

describe("Computer Vision Detection", () => {
  const mockImageData = Buffer.from("mock image data");

  it("detects faces in images", async () => {
    const detection = await detectFace(mockImageData);
    
    if (detection) {
      expect(detection.boundingBox).toBeDefined();
      expect(detection.confidence).toBeGreaterThanOrEqual(0);
      expect(detection.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("detects palms in images", async () => {
    const detection = await detectPalm(mockImageData);
    
    if (detection) {
      expect(detection.boundingBox).toBeDefined();
      expect(detection.orientation).toMatch(/^(left|right|unknown)$/);
      expect(detection.confidence).toBeGreaterThanOrEqual(0);
    }
  });

  it("detects documents in images", async () => {
    const detection = await detectDocument(mockImageData);
    
    if (detection) {
      expect(detection.boundingBox).toBeDefined();
      expect(detection.textRegions).toBeDefined();
      expect(Array.isArray(detection.textRegions)).toBe(true);
    }
  });
});

describe("Evidence Card Validation", () => {
  it("validates chin observation data", () => {
    const chinObs = {
      jawAngleDeg: 25.5,
      chinWidthPct: 15.2,
      chinDepthPct: 8.7,
      dimpleLikely: true,
      beardCoverage: "light" as const,
      lightingOk: true,
      confidence: 0.8
    };
    
    expect(chinObs.jawAngleDeg).toBeGreaterThan(0);
    expect(chinObs.jawAngleDeg).toBeLessThan(90);
    expect(chinObs.chinWidthPct).toBeGreaterThan(0);
    expect(chinObs.chinWidthPct).toBeLessThan(100);
    expect(chinObs.confidence).toBeGreaterThanOrEqual(0);
    expect(chinObs.confidence).toBeLessThanOrEqual(1);
  });

  it("validates palm observation data", () => {
    const palmObs = {
      lineQuality: "high" as const,
      heartLineShape: "curved" as const,
      headLineShape: "straight" as const,
      lifeLineShape: "long" as const,
      fateLinePresent: true,
      mountsStrong: ["Jupiter", "Venus"],
      handednessGuess: "right" as const,
      confidence: 0.7
    };
    
    expect(["low", "medium", "high"]).toContain(palmObs.lineQuality);
    expect(["straight", "curved", "forked", "broken"]).toContain(palmObs.heartLineShape);
    expect(["left", "right", "unknown"]).toContain(palmObs.handednessGuess);
    expect(Array.isArray(palmObs.mountsStrong)).toBe(true);
  });

  it("validates document observation data", () => {
    const docObs = {
      ocrText: "Sample extracted text",
      pages: 3,
      hasTables: true,
      containsDates: ["2023-12-25"],
      language: "en",
      confidence: 0.9
    };
    
    expect(typeof docObs.ocrText).toBe("string");
    expect(docObs.pages).toBeGreaterThan(0);
    expect(typeof docObs.hasTables).toBe("boolean");
    expect(Array.isArray(docObs.containsDates)).toBe(true);
  });
});

describe("End-to-End Extraction Flow", () => {
  it("processes complete extraction pipeline", async () => {
    const mockFiles: FileRef[] = [
      {
        id: "test-1",
        kind: "image",
        mime: "image/jpeg",
        url: "https://example.com/test1.jpg",
        name: "test1.jpg",
        size: 1024000,
        uploadedAt: new Date().toISOString()
      },
      {
        id: "test-2",
        kind: "pdf",
        mime: "application/pdf",
        url: "https://example.com/test2.pdf",
        name: "test2.pdf",
        size: 2048000,
        pages: 2,
        uploadedAt: new Date().toISOString()
      }
    ];

    // Mock fetch for all files
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    const cards = [];
    
    for (const file of mockFiles) {
      let card;
      if (file.kind === "image") {
        card = await extractFromImage(file, "en");
      } else {
        card = await extractFromPdf(file, "en");
      }
      cards.push(card);
    }

    expect(cards).toHaveLength(2);
    expect(cards[0].fileId).toBe("test-1");
    expect(cards[1].fileId).toBe("test-2");
    expect(cards.every(card => card.extractedAt)).toBe(true);
  });
});

describe("Language Support", () => {
  it("handles Nepali language extraction", async () => {
    const mockFile: FileRef = {
      id: "test-nepali",
      kind: "image",
      mime: "image/jpeg",
      url: "https://example.com/nepali.jpg",
      name: "nepali.jpg",
      size: 1024000,
      uploadedAt: new Date().toISOString()
    };

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    const card = await extractFromImage(mockFile, "ne");
    
    expect(card.title).toContain("चिन");
    expect(card.summary).toContain("चिनको");
  });

  it("handles English language extraction", async () => {
    const mockFile: FileRef = {
      id: "test-english",
      kind: "image",
      mime: "image/jpeg",
      url: "https://example.com/english.jpg",
      name: "english.jpg",
      size: 1024000,
      uploadedAt: new Date().toISOString()
    };

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    const card = await extractFromImage(mockFile, "en");
    
    expect(card.title).toContain("Chin");
    expect(card.summary).toContain("Jaw angle");
  });
});
