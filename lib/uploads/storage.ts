// lib/uploads/storage.ts
// File storage abstraction with local/S3 support

import { StorageProvider } from '@/lib/extract/types';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath: string = '/tmp/uploads') {
    this.basePath = basePath;
  }

  async upload(file: File, path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    const dir = dirname(fullPath);
    
    // Ensure directory exists
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file
    await writeFile(fullPath, buffer);
    
    // Return local URL
    return `/_uploads/${path}`;
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    try {
      await unlink(fullPath);
    } catch (error) {
      // File might not exist, ignore error
      console.warn(`Failed to delete file ${fullPath}:`, error);
    }
  }

  getUrl(path: string): string {
    return `/_uploads/${path}`;
  }
}

export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;

  constructor(bucket: string, region: string = 'us-east-1') {
    this.bucket = bucket;
    this.region = region;
  }

  async upload(file: File, path: string): Promise<string> {
    // TODO: Implement S3 upload
    // For now, fallback to local storage
    const localProvider = new LocalStorageProvider();
    return localProvider.upload(file, path);
  }

  async delete(path: string): Promise<void> {
    // TODO: Implement S3 delete
    console.log(`Would delete S3 object: ${path}`);
  }

  getUrl(path: string): string {
    // TODO: Generate presigned URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}

export function createStorageProvider(): StorageProvider {
  const provider = process.env.UPLOAD_PROVIDER || 'local';
  
  switch (provider) {
    case 's3':
      return new S3StorageProvider(
        process.env.S3_BUCKET || 'zstro-uploads',
        process.env.S3_REGION || 'us-east-1'
      );
    case 'local':
    default:
      return new LocalStorageProvider(
        process.env.UPLOAD_PATH || '/tmp/uploads'
      );
  }
}

export function generateFilePath(originalName: string, kind: 'image' | 'pdf'): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = uuidv4();
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${timestamp}/${kind}/${uuid}.${ext}`;
}

export function validateFile(file: File): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size (20MB max)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 20MB limit`);
  }
  
  // Check file type
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedPdfTypes = ['application/pdf'];
  const allowedTypes = [...allowedImageTypes, ...allowedPdfTypes];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not supported. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // Check for HEIC (not supported)
  if (file.name.toLowerCase().includes('.heic')) {
    errors.push('HEIC files not supported. Please convert to JPEG or PNG');
  }
  
  // Warnings for large files
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Large file may take longer to process');
  }
  
  // Warnings for unusual file names
  if (file.name.length > 100) {
    warnings.push('Very long filename may cause issues');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function sanitizeFileName(name: string): string {
  // Remove dangerous characters and normalize
  return name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

export function stripExifData(buffer: Buffer): Buffer {
  // TODO: Implement EXIF stripping for privacy
  // For now, return buffer as-is
  return buffer;
}
