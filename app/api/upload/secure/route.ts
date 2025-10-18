// app/api/upload/secure/route.ts
// Secure file upload with security scanning

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/config/features';
import { createSecurityMiddleware, SECURITY_CONFIGS, secureResponse } from '@/lib/security/middleware';
import { UploadScanner } from '@/lib/security/upload-scanner';
import { FileUploadSchema } from '@/lib/security/validators';
import { z } from 'zod';

export const runtime = 'nodejs';

// Extended validation schema for uploads
const SecureUploadSchema = FileUploadSchema.extend({
  category: z.enum(['chin', 'palm', 'document']),
  scanForThreats: z.boolean().optional().default(true),
  stripMetadata: z.boolean().optional().default(true)
});

export async function POST(req: NextRequest) {
  try {
    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware(SECURITY_CONFIGS.upload);
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // Check if upload feature is enabled
    if (!isFeatureEnabled('export')) { // Using export flag for uploads
      return NextResponse.json(
        { success: false, errors: ['File upload feature is disabled'] },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const scanForThreats = formData.get('scanForThreats') === 'true';
    const stripMetadata = formData.get('stripMetadata') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, errors: ['No file provided'] },
        { status: 400 }
      );
    }

    // Validate request data
    const validationResult = SecureUploadSchema.safeParse({
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      },
      category,
      scanForThreats,
      stripMetadata
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          errors: ['Invalid request data'],
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileMetadata = {
      size: file.size,
      type: file.type,
      buffer,
      filename: file.name
    };

    // Security scanning
    let scanResult;
    if (scanForThreats) {
      scanResult = await UploadScanner.scanFile(fileMetadata);
      
      if (!scanResult.safe) {
        return NextResponse.json(
          {
            success: false,
            errors: ['File failed security scan'],
            threats: scanResult.threats,
            metadata: scanResult.metadata
          },
          { status: 400 }
        );
      }
    }

    // Clean metadata if requested
    let cleanedFile = fileMetadata;
    if (stripMetadata) {
      cleanedFile = UploadScanner.cleanMetadata(fileMetadata);
    }

    // Additional image validation for specific categories
    if (category === 'chin' || category === 'palm') {
      const imageValidation = await UploadScanner.validateImageMetadata(cleanedFile.buffer);
      if (!imageValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            errors: ['Image validation failed'],
            threats: imageValidation.threats
          },
          { status: 400 }
        );
      }
    }

    // Generate secure filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'bin';
    const secureFilename = `${category}_${timestamp}_${randomId}.${extension}`;

    // In a real implementation, you would save the file to storage here
    // For now, we'll just return the metadata
    const response = {
      success: true,
      data: {
        filename: secureFilename,
        originalName: file.name,
        size: cleanedFile.size,
        type: cleanedFile.type,
        category,
        uploadedAt: new Date().toISOString(),
        scanResult: scanResult ? {
          safe: scanResult.safe,
          threats: scanResult.threats,
          scanTime: scanResult.metadata.scanTime
        } : null,
        metadata: {
          stripped: stripMetadata,
          scanned: scanForThreats
        }
      }
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'no-cache'
    });

  } catch (error) {
    console.error('Secure upload API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for upload status/health
export async function GET(req: NextRequest) {
  try {
    const response = {
      success: true,
      data: {
        status: 'healthy',
        features: {
          scanning: true,
          metadataStripping: true,
          imageValidation: true
        },
        limits: {
          maxFileSize: '10MB',
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
          categories: ['chin', 'palm', 'document']
        }
      }
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'public-short'
    });

  } catch (error) {
    console.error('Upload health check error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Health check failed'] 
      },
      { status: 500 }
    );
  }
}
