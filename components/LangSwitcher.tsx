"use client";
import { useLang } from "@/hooks/useLang";

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <select value={lang} onChange={(e)=>setLang(e.target.value as any)} className="border rounded-lg p-1 text-sm">
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="ne">नेपाली</option>
    </select>
  );
}
