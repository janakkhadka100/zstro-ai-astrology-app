export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (url) {
      // Get file metadata from Blob
      try {
        const blob = await head(url, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        
        return NextResponse.json({
          ok: true,
          file: {
            url: blob.url,
            pathname: blob.pathname,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            contentType: blob.contentType
          }
        });
      } catch (error) {
        return NextResponse.json({ 
          ok: false, 
          error: "File not found" 
        }, { status: 404 });
      }
    }

    // For now, return empty list since we can't list all files from Blob
    // In a real app, you'd maintain a registry in a database
    return NextResponse.json({
      ok: true,
      files: []
    });

  } catch (error: any) {
    console.error("Files API error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || "Failed to fetch files" 
    }, { status: 500 });
  }
}
