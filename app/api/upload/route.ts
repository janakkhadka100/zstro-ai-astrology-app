export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED = ["application/pdf","image/png","image/jpeg","image/webp"];
const LIMIT_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "20");

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(()=>null);
    if (!form) return NextResponse.json({ ok:false, error:"FormData parsing failed" }, { status:400 });
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ ok:false, error:'No "file" field' }, { status:400 });

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok:false, error:`Unsupported type: ${file.type}` }, { status:415 });
    }
    if (file.size > LIMIT_MB * 1024 * 1024) {
      return NextResponse.json({ ok:false, error:`Max ${LIMIT_MB}MB exceeded` }, { status:413 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ ok:false, error:"Missing BLOB_READ_WRITE_TOKEN" }, { status:500 });

    const arrayBuffer = await file.arrayBuffer();
    const pathnameSafe = `uploads/${Date.now()}-${(file.name || "file").replace(/[^\w.\-]+/g, "_")}`;

    const blob = await put(
      pathnameSafe,
      Buffer.from(arrayBuffer),
      { access: "public", contentType: file.type, token }
    );

    return NextResponse.json({
      ok: true,
      file: { url: blob.url, pathname: blob.pathname, size: file.size, type: file.type, name: file.name }
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || "upload-failed" }, { status:500 });
  }
}