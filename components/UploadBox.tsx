"use client";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function UploadBox({ onUploaded }:{ onUploaded:(it:any)=>void }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [busy,setBusy]=useState(false);
  const { lang } = useLang(); const t = strings[lang];
  return (
    <div className="bg-gradient-to-tr from-sky-100 via-blue-100 to-indigo-100 rounded-2xl p-4 shadow">
      <div className="text-sm mb-2 font-medium text-sky-900">{t.upload}</div>
      <div className="h-24 border-2 border-dashed border-sky-300 rounded-xl grid place-items-center text-sm opacity-80">
        Drag & Drop or Choose
      </div>
      <div className="mt-3">
        <input ref={inputRef} type="file" hidden onChange={(e)=>{/* upload code */}}/>
        <Button onClick={()=>inputRef.current?.click()} disabled={busy} className="bg-sky-600 hover:bg-sky-700 text-white">
          {busy?"Uploading...":t.upload}
        </Button>
      </div>
    </div>
  );
}