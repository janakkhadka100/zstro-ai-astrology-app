export const runtime = "nodejs";
import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { url, type } = await req.json();
    
    if (!url || !type) {
      return NextResponse.json({ 
        ok: false, 
        error: "Missing url or type in request body" 
      }, { status: 400 });
    }

    // Download file from Blob
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: "Failed to fetch file from storage" 
      }, { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (type === "application/pdf") {
      // Extract text from PDF
      const data = await pdfParse.default(buffer);
      const text = (data.text || "").trim();
      
      return NextResponse.json({
        ok: true,
        content: {
          kind: "pdf",
          text,
          meta: {
            pages: data.numpages,
            info: data.info
          },
          url
        }
      });

    } else if (["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(type)) {
      // Extract metadata from image
      const metadata = await sharp(buffer).metadata();
      
      return NextResponse.json({
        ok: true,
        content: {
          kind: "image",
          text: "(image uploaded — OCR not enabled)",
          meta: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size,
            density: metadata.density
          },
          url
        }
      });

    } else {
      return NextResponse.json({ 
        ok: false, 
        error: "Unsupported file type for extraction" 
      }, { status: 415 });
    }

  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || "Content extraction failed" 
    }, { status: 500 });
  }
}