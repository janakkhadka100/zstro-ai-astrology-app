"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";

export default function FileCards({
  items, onSendToChat
}:{ items:{ url:string; type:string; name:string; text?:string; meta?:any }[];
   onSendToChat:(t:string)=>void }) {
  const { lang } = useLang();
  if (!items?.length) return null;
  return (
    <div className="grid gap-4">
      {items.map((it,i)=>(
        <Card key={i} className="rounded-2xl">
          <CardHeader className="pb-2 font-medium">{it.name}</CardHeader>
          <CardContent className="space-y-2 text-sm">
            {it.type.startsWith("image/") ? (
              <img src={it.url} className="max-h-40 rounded-lg border" alt={it.name}/>
            ) : (
              <div className="text-xs opacity-70">{getString("pdf_file", lang)}</div>
            )}
            <div className="whitespace-pre-wrap max-h-40 overflow-auto border rounded-lg p-2">
              {(it.text && it.text.length > 0) ? it.text.slice(0,600) : getString("no_text", lang)}
              {(it.text && it.text.length > 600) ? "…" : ""}
            </div>
            <div className="flex gap-3 items-center">
              <a href={it.url} target="_blank" className="underline text-xs">{getString("open", lang)}</a>
              <Button size="sm" onClick={()=>onSendToChat(it.text || "")}>{getString("send_to_chat", lang)}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}