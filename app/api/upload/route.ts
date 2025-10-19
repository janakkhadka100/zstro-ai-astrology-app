export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    // Check content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid content type. Expected multipart/form-data" 
      }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Validate file has content
    if (file.size === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "File is empty" 
      }, { status: 400 });
    }

    // Validate file size
    const limitMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "20");
    if (file.size > limitMb * 1024 * 1024) {
      return NextResponse.json({ 
        ok: false, 
        error: `File too large. Maximum size is ${limitMb}MB` 
      }, { status: 413 });
    }

    // Validate file type
    const type = file.type;
    const allowedTypes = [
      "application/pdf",
      "image/png", 
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];
    
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ 
        ok: false, 
        error: "Unsupported file type. Only PDF and images (PNG, JPEG, WebP) are allowed" 
      }, { status: 415 });
    }

    // Sanitize filename and prevent directory traversal
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.\./g, '_') // Prevent directory traversal
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 100); // Limit length
    
    const timestamp = Date.now();
    const filename = `uploads/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const arrayBuffer = await file.arrayBuffer();
    const blob = await put(filename, Buffer.from(arrayBuffer), {
      access: "public",
      contentType: type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      ok: true,
      file: {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        type,
        name: file.name
      }
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || "Upload failed" 
    }, { status: 500 });
  }
}
