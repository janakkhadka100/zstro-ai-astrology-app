"use client";
import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import FileCards from "@/components/FileCards";
import ResultSummaryCard from "@/components/astro/ResultSummaryCard";
import PlanetTableCard from "@/components/astro/PlanetTableCard";
import YogDoshGrid from "@/components/astro/YogDoshGrid";
import PDFButtonCard from "@/components/astro/PDFButtonCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";

type Item = { url:string; type:string; name:string; text?:string; meta?:any };

export default function ClientChatView() {
  const [items, setItems] = useState<Item[]>([]);
  const { lang } = useLang();
  
  const append = (t:string) => {
    const ta = document.getElementById("chat-composer") as HTMLTextAreaElement | null;
    if (ta) ta.value = `${ta.value}\n\n[FILE SNIPPET]\n${t}`;
    else alert("Composer not found");
  };

  const data = {
    ascSignLabel: "वृष",
    moonSignLabel: "मकर",
    planets: [
      { 
        planet:"Sun", 
        signLabel:"धनु", 
        house:8, 
        degree:null,
        shadbala: { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65 }
      },
      { 
        planet:"Mars",
        signLabel:"धनु", 
        house:8, 
        degree:null,
        shadbala: { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45 }
      },
      { 
        planet:"Saturn",
        signLabel:"कुम्भ", 
        house:10, 
        degree:null,
        shadbala: { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3 }
      },
    ],
    yogas: [{label:"गजकेसरी", factors:["Jupiter","Moon"]}],
    doshas: [{label:"मंगल दोष", factors:["Mars"]}],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          <UploadBox onUploaded={(it)=>setItems(prev=>[it, ...prev])} />
          <PDFButtonCard onClick={()=>alert("PDF generation coming soon!")} />
          <textarea id="chat-composer" className="w-full h-24 rounded-xl border p-2 text-sm" placeholder={getString("composer", lang)}/>
        </div>

        <ErrorBoundary>
          <div className="space-y-4">
            <ResultSummaryCard asc={data.ascSignLabel} moon={data.moonSignLabel} />
            <FileCards items={items} onSendToChat={append} />
            <PlanetTableCard rows={data.planets}/>
            <YogDoshGrid yogas={data.yogas} doshas={data.doshas}/>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
