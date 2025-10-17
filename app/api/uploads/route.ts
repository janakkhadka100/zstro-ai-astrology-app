// app/api/uploads/route.ts
// File upload endpoint with multipart form data support

import { NextRequest, NextResponse } from 'next/server';
import { createStorageProvider, generateFilePath, validateFile, sanitizeFileName } from '@/lib/uploads/storage';
import { FileRef, UploadResponse } from '@/lib/extract/types';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs'; // Required for file uploads

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const lang = formData.get('lang') as string || 'ne';
    
    // Validate file count
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, errors: ['No files provided'] },
        { status: 400 }
      );
    }
    
    if (files.length > 5) {
      return NextResponse.json(
        { success: false, errors: ['Maximum 5 files allowed'] },
        { status: 400 }
      );
    }
    
    const storage = createStorageProvider();
    const fileRefs: FileRef[] = [];
    const errors: string[] = [];
    
    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.errors.join(', ')}`);
          continue;
        }
        
        // Generate file path
        const fileKind = file.type.startsWith('image/') ? 'image' : 'pdf';
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = generateFilePath(sanitizedName, fileKind);
        
        // Upload file
        const url = await storage.upload(file, filePath);
        
        // Create file reference
        const fileRef: FileRef = {
          id: uuidv4(),
          kind: fileKind,
          mime: file.type,
          url,
          name: sanitizedName,
          size: file.size,
          pages: fileKind === 'pdf' ? 1 : undefined, // Will be updated during extraction
          uploadedAt: new Date().toISOString()
        };
        
        fileRefs.push(fileRef);
        
        console.log(`Uploaded file: ${file.name} -> ${url}`);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }
    
    // Return response
    const response: UploadResponse = {
      success: fileRefs.length > 0,
      files: fileRefs,
      errors: errors.length > 0 ? errors : undefined
    };
    
    return NextResponse.json(response, { 
      status: fileRefs.length > 0 ? 200 : 400 
    });
    
  } catch (error) {
    console.error('Upload API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
