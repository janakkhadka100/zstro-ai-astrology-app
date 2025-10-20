"use client";
import { useLang } from "@/hooks/useLang";

export default function LangSwitcher(){
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center gap-1 text-sm">
      <button onClick={()=>setLang("en")} className={`px-2 py-1 rounded ${lang==='en'?'bg-slate-900 text-white':'bg-slate-100 text-slate-800'}`}>EN</button>
      <button onClick={()=>setLang("ne")} className={`px-2 py-1 rounded ${lang==='ne'?'bg-slate-900 text-white':'bg-slate-100 text-slate-800'}`}>ने</button>
      <button onClick={()=>setLang("hi")} className={`px-2 py-1 rounded ${lang==='hi'?'bg-slate-900 text-white':'bg-slate-100 text-slate-800'}`}>हि</button>
    </div>
  );
}