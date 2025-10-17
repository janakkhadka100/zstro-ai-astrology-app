// app/api/extract/route.ts
// Evidence extraction endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ExtractRequest, ExtractResponse, EvidenceBundle, Lang } from '@/lib/extract/types';
import { extractFromImage } from '@/lib/extract/image';
import { extractFromPdf } from '@/lib/extract/pdf';

export const runtime = 'nodejs'; // Required for file processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ExtractRequest;
    const { files, lang } = body;
    
    // Validate request
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, errors: ['No files provided'] },
        { status: 400 }
      );
    }
    
    if (!['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }
    
    console.log(`Extracting evidence from ${files.length} files in ${lang}`);
    
    const cards = [];
    const errors: string[] = [];
    
    // Process each file
    for (const file of files) {
      try {
        let card;
        
        if (file.kind === 'image') {
          card = await extractFromImage(file, lang as Lang);
        } else if (file.kind === 'pdf') {
          card = await extractFromPdf(file, lang as Lang);
        } else {
          errors.push(`Unsupported file type: ${file.kind}`);
          continue;
        }
        
        cards.push(card);
        console.log(`Extracted evidence from ${file.name}: ${card.type}`);
        
      } catch (error) {
        console.error(`Error extracting from ${file.name}:`, error);
        errors.push(`${file.name}: Extraction failed`);
      }
    }
    
    // Create evidence bundle
    const bundle: EvidenceBundle = {
      files,
      cards,
      lang: lang as Lang,
      extractedAt: new Date().toISOString()
    };
    
    // Return response
    const response: ExtractResponse = {
      success: cards.length > 0,
      bundle,
      errors: errors.length > 0 ? errors : undefined
    };
    
    return NextResponse.json(response, { 
      status: cards.length > 0 ? 200 : 400 
    });
    
  } catch (error) {
    console.error('Extract API error:', error);
    
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
