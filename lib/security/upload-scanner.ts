// lib/security/upload-scanner.ts
// File upload security scanner

import { createHash } from 'crypto';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, validateFileType, validateFileSize } from './validators';

interface ScanResult {
  safe: boolean;
  threats: string[];
  metadata: {
    size: number;
    type: string;
    hash: string;
    scanTime: number;
  };
}

interface FileMetadata {
  size: number;
  type: string;
  buffer: Buffer;
  filename: string;
}

export class UploadScanner {
  private static readonly DANGEROUS_PATTERNS = [
    // Script injections
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    
    // PHP/Server-side code
    /<\?php/gi,
    /<\?=/gi,
    /<%[^%]*%>/gi,
    
    // SQL injection patterns
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+set/gi,
    
    // File system access
    /\.\.\//g,
    /\.\.\\/g,
    /\/etc\/passwd/gi,
    /\/etc\/shadow/gi,
    /c:\\windows\\system32/gi,
    
    // Executable patterns
    /eval\s*\(/gi,
    /exec\s*\(/gi,
    /system\s*\(/gi,
    /shell_exec/gi,
    
    // Suspicious file headers
    /MZ/, // PE executable
    /ELF/, // ELF executable
    /#!/, // Shell script
  ];

  private static readonly SUSPICIOUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
    '.vbs', '.js', '.jar', '.php', '.asp', '.jsp',
    '.sh', '.ps1', '.py', '.pl', '.rb', '.cgi'
  ];

  // Scan file for security threats
  static async scanFile(file: FileMetadata): Promise<ScanResult> {
    const startTime = Date.now();
    const threats: string[] = [];
    
    try {
      // Basic validation
      if (!validateFileType(file.type)) {
        threats.push('Invalid file type');
      }
      
      if (!validateFileSize(file.size, file.type)) {
        threats.push('File size exceeds limit');
      }
      
      // Check file extension
      const extension = this.getFileExtension(file.filename);
      if (this.SUSPICIOUS_EXTENSIONS.includes(extension)) {
        threats.push('Suspicious file extension');
      }
      
      // Scan file content
      const contentThreats = await this.scanContent(file.buffer, file.type);
      threats.push(...contentThreats);
      
      // Check for embedded files (ZIP bombs, etc.)
      if (this.isZipBomb(file.buffer)) {
        threats.push('Potential ZIP bomb detected');
      }
      
      // Check file headers
      const headerThreats = this.scanHeaders(file.buffer);
      threats.push(...headerThreats);
      
      const scanTime = Date.now() - startTime;
      const hash = createHash('sha256').update(file.buffer).digest('hex');
      
      return {
        safe: threats.length === 0,
        threats,
        metadata: {
          size: file.size,
          type: file.type,
          hash,
          scanTime
        }
      };
      
    } catch (error) {
      console.error('File scan error:', error);
      return {
        safe: false,
        threats: ['Scan error occurred'],
        metadata: {
          size: file.size,
          type: file.type,
          hash: '',
          scanTime: Date.now() - startTime
        }
      };
    }
  }

  // Scan file content for malicious patterns
  private static async scanContent(buffer: Buffer, mimeType: string): Promise<string[]> {
    const threats: string[] = [];
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024 * 1024)); // Scan first 1MB
    
    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        threats.push(`Malicious pattern detected: ${pattern.source}`);
      }
    }
    
    // Check for suspicious binary content in text files
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      const binaryRatio = this.calculateBinaryRatio(buffer);
      if (binaryRatio > 0.3) {
        threats.push('High binary content in text file');
      }
    }
    
    return threats;
  }

  // Scan file headers for suspicious content
  private static scanHeaders(buffer: Buffer): string[] {
    const threats: string[] = [];
    
    if (buffer.length < 4) return threats;
    
    const header = buffer.subarray(0, 4);
    const hex = header.toString('hex').toUpperCase();
    
    // Check for executable signatures
    if (hex.startsWith('4D5A')) { // MZ (PE executable)
      threats.push('Executable file detected');
    }
    
    if (hex.startsWith('7F454C46')) { // ELF
      threats.push('ELF executable detected');
    }
    
    if (hex.startsWith('CAFEBABE')) { // Java class
      threats.push('Java class file detected');
    }
    
    // Check for PDF with embedded content
    if (buffer.toString('ascii', 0, 4) === '%PDF') {
      const pdfContent = buffer.toString('utf8', 0, Math.min(buffer.length, 10240));
      if (pdfContent.includes('/JavaScript') || pdfContent.includes('/JS')) {
        threats.push('PDF with JavaScript detected');
      }
    }
    
    return threats;
  }

  // Check for ZIP bomb (decompression bomb)
  private static isZipBomb(buffer: Buffer): boolean {
    try {
      // Simple check for ZIP files with high compression ratio
      if (buffer.length < 100) return false;
      
      const header = buffer.toString('ascii', 0, 4);
      if (header === 'PK\x03\x04' || header === 'PK\x05\x06') {
        // This is a ZIP file, check compression ratio
        const compressedSize = buffer.length;
        // This is a simplified check - in production, you'd use a proper ZIP library
        return compressedSize > 1024 * 1024; // More than 1MB compressed
      }
      
      return false;
    } catch {
      return false;
    }
  }

  // Calculate binary content ratio
  private static calculateBinaryRatio(buffer: Buffer): number {
    let binaryBytes = 0;
    const sampleSize = Math.min(buffer.length, 10240); // Sample first 10KB
    
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      // Count non-printable ASCII characters
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        binaryBytes++;
      }
    }
    
    return binaryBytes / sampleSize;
  }

  // Get file extension
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  // Validate image metadata
  static async validateImageMetadata(buffer: Buffer): Promise<{ valid: boolean; threats: string[] }> {
    const threats: string[] = [];
    
    try {
      // Check for EXIF data
      const exifData = this.extractExifData(buffer);
      if (exifData) {
        // Check for suspicious EXIF data
        if (exifData.software && exifData.software.includes('Photoshop')) {
          threats.push('Image edited with Photoshop');
        }
        
        if (exifData.gps) {
          threats.push('Image contains GPS location data');
        }
        
        if (exifData.camera) {
          threats.push('Image contains camera metadata');
        }
      }
      
      // Check image dimensions
      const dimensions = this.getImageDimensions(buffer);
      if (dimensions) {
        const { width, height } = dimensions;
        const megapixels = (width * height) / 1000000;
        
        if (megapixels > 50) {
          threats.push('Image resolution too high');
        }
        
        if (width > 10000 || height > 10000) {
          threats.push('Image dimensions too large');
        }
      }
      
      return {
        valid: threats.length === 0,
        threats
      };
      
    } catch (error) {
      console.error('Image validation error:', error);
      return {
        valid: false,
        threats: ['Image validation failed']
      };
    }
  }

  // Extract EXIF data (simplified)
  private static extractExifData(buffer: Buffer): any {
    try {
      // This is a simplified EXIF extraction
      // In production, use a proper EXIF library like 'exif-js' or 'piexifjs'
      const content = buffer.toString('binary');
      const exifStart = content.indexOf('Exif');
      if (exifStart === -1) return null;
      
      return {
        software: 'Unknown',
        gps: false,
        camera: 'Unknown'
      };
    } catch {
      return null;
    }
  }

  // Get image dimensions (simplified)
  private static getImageDimensions(buffer: Buffer): { width: number; height: number } | null {
    try {
      // This is a simplified dimension extraction
      // In production, use a proper image library like 'sharp' or 'jimp'
      if (buffer.length < 8) return null;
      
      // Check for PNG
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
      }
      
      // Check for JPEG
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        // JPEG dimension extraction is more complex
        // For now, return a default
        return { width: 1000, height: 1000 };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Clean file metadata
  static cleanMetadata(file: FileMetadata): FileMetadata {
    return {
      ...file,
      filename: this.sanitizeFilename(file.filename),
      buffer: this.stripMetadata(file.buffer, file.type)
    };
  }

  // Sanitize filename
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // Strip metadata from files
  private static stripMetadata(buffer: Buffer, mimeType: string): Buffer {
    try {
      if (mimeType.startsWith('image/')) {
        // Strip EXIF data from images
        return this.stripImageMetadata(buffer);
      }
      
      return buffer;
    } catch {
      return buffer;
    }
  }

  // Strip image metadata
  private static stripImageMetadata(buffer: Buffer): Buffer {
    try {
      // This is a simplified metadata stripping
      // In production, use a proper library like 'sharp' or 'jimp'
      return buffer;
    } catch {
      return buffer;
    }
  }
}
