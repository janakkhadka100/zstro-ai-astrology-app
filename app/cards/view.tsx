"use client";
import { useRef, useState, useEffect } from "react";
import LangSwitcher from "@/components/LangSwitcher";
import ResultSummaryCard from "@/components/ResultSummaryCard";
import PlanetTableCard from "@/components/PlanetTableCard";
import YogDoshGrid from "@/components/YogDoshGrid";
import { useLang } from "@/hooks/useLang"; 
import { strings } from "@/utils/strings";

export default function ClientView(){
  const { lang } = useLang(); 
  const s=strings[lang];
  const [messages,setMessages]=useState<{role:"user"|"ai"; text:string}[]>([]);
  const listRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ 
    if(listRef.current){ 
      listRef.current.scrollTop = listRef.current.scrollHeight; 
    }
  },[messages]);

  const onSend=(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("msg") as HTMLInputElement);
    const text = input.value.trim(); 
    if(!text) return;
    setMessages(m=>[...m,{role:"user",text}]); 
    input.value="";
    // mock AI echo
    setTimeout(()=> setMessages(m=>[...m,{role:"ai", text:`Echo: ${text}` }]), 300);
  };

  const data = {
    asc:"Taurus", 
    moon:"Capricorn",
    planets:[
      {planet:"Sun",signLabel:"Sagittarius",house:8},
      {planet:"Mars",signLabel:"Sagittarius",house:8},
      {planet:"Saturn",signLabel:"Aquarius",house:10},
    ],
    yogas:[{label:"Gajakesari",factors:["Jupiter","Moon"]}],
    doshas:[{label:"Mangal Dosh",factors:["Mars"]}],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">ZSTRO AI</div>
          <LangSwitcher/>
        </div>
      </div>

      {/* Scrollable Cards */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-5 space-y-5">
        <ResultSummaryCard asc={data.asc} moon={data.moon}/>
        <PlanetTableCard rows={data.planets}/>
        <YogDoshGrid yogas={data.yogas} doshas={data.doshas}/>
      </main>

      {/* Sticky Chat */}
      <section className="sticky bottom-0 z-10 bg-white/85 backdrop-blur-md border-t">
        <div ref={listRef} className="max-w-3xl mx-auto w-full max-h-48 overflow-y-auto px-4 pt-3 space-y-2">
          {messages.map((m,i)=>(
            <div key={i} className={`px-3 py-2 rounded-2xl text-sm w-fit ${m.role==="user"?"bg-indigo-600 text-white ml-auto":"bg-indigo-100 text-indigo-900"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form onSubmit={onSend} className="mx-auto max-w-3xl w-full flex items-center gap-2 p-3">
          <input name="msg" placeholder={s.chat_ph} className="flex-1 rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"/>
          <button type="submit" className="rounded-xl bg-indigo-500 text-white px-4 py-2 hover:bg-indigo-600">{s.send}</button>
        </form>
      </section>
    </div>
  );
}
