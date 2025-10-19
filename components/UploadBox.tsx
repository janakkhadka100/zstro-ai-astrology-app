"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type UploadedItem = { url:string; type:string; name:string; text?:string; meta?:any };

export default function UploadBox({ onUploaded }:{ onUploaded:(it:UploadedItem)=>void }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "20");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);            // IMPORTANT: field name "file"
      const up = await fetch("/api/upload", { method:"POST", body: fd });
      const uj = await up.json();
      if (!uj.ok) throw new Error(uj.error || "upload failed");

      const ex = await fetch("/api/extract", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ url: uj.file.url, type: uj.file.type })
      });
      const ej = await ex.json();
      if (!ej.ok) throw new Error(ej.error || "extract failed");

      onUploaded({ url: uj.file.url, type: uj.file.type, name: uj.file.name, text: ej.content?.text, meta: ej.content?.meta });
    } catch (e:any) {
      setErr(e?.message || "Upload error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ""; // allow re-select same file
    }
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm mb-2">Upload PDF/Image (max {maxMb}MB)</div>
      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={(e)=>{ e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="h-28 rounded-xl border-2 border-dashed grid place-items-center text-sm opacity-80"
      >
        Drag & drop here
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          hidden
          onChange={(e)=>handleFiles(e.target.files)}
        />
        <Button onClick={()=>inputRef.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Choose File"}</Button>
        {err && <div className="text-xs text-red-600">{err}</div>}
      </div>
    </div>
  );
}