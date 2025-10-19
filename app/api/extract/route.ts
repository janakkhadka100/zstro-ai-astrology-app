export const runtime = "nodejs";
import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { url, type } = await req.json();
    if (!url || !type) return NextResponse.json({ ok:false, error:"Bad body" }, { status:400 });

    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok:false, error:`Fetch failed: ${res.status}` }, { status:502 });
    const buf = Buffer.from(await res.arrayBuffer());

    if (type === "application/pdf") {
      const data = await pdfParse.default(buf);
      return NextResponse.json({
        ok: true,
        content: { kind:"pdf", text: (data.text || "").trim(), meta:{ pages: data.numpages }, url }
      });
    }
    if (["image/png","image/jpeg","image/webp"].includes(type)) {
      const meta = await sharp(buf).metadata();
      return NextResponse.json({
        ok: true,
        content: { kind:"image", text:"(image uploaded — OCR not enabled)", meta, url }
      });
    }
    return NextResponse.json({ ok:false, error:"Unsupported type" }, { status:415 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || "extract-failed" }, { status:500 });
  }
}