"use client";
import { useLang } from "@/hooks/useLang"; 
import { strings } from "@/utils/strings";

export default function LangSwitcher(){ 
  const {lang,setLang}=useLang(); 
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="opacity-60">{strings[lang].lang}:</span>
      <select value={lang} onChange={e=>setLang(e.target.value as any)} className="border rounded-lg p-1 bg-white">
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ne">नेपाली</option>
      </select>
    </div>
  ); 
}