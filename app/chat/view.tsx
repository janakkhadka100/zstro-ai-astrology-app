"use client";
import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import FileCards from "@/components/FileCards";
import ResultSummaryCard from "@/components/astro/ResultSummaryCard";
import PlanetTableCard from "@/components/astro/PlanetTableCard";
import YogDoshGrid from "@/components/astro/YogDoshGrid";
import PDFButtonCard from "@/components/astro/PDFButtonCard";
import ShadbalaCard from "@/components/astro/ShadbalaCard";
import AshtakavargaCard from "@/components/astro/AshtakavargaCard";
import DashaTreeCard from "@/components/astro/DashaTreeCard";
import VargaTiles from "@/components/astro/VargaTiles";
import ConditionWatchCard from "@/components/astro/ConditionWatchCard";
import TransitTodayCard from "@/components/astro/TransitTodayCard";
import PanchangaCard from "@/components/astro/PanchangaCard";
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
        combust: false,
        retro: false,
        shadbala: { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 }
      },
      { 
        planet:"Mars",
        signLabel:"धनु", 
        house:8, 
        degree:null,
        combust: false,
        retro: true,
        shadbala: { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 }
      },
      { 
        planet:"Saturn",
        signLabel:"कुम्भ", 
        house:10, 
        degree:null,
        combust: true,
        retro: false,
        shadbala: { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 }
      },
    ],
    shadbala: {
      "Sun": { total: 150.25, sthana: 45.5, dig: 30.2, kala: 25.8, chestha: 20.1, naisargika: 28.65, drik: 0 },
      "Mars": { total: 120.45, sthana: 40.1, dig: 25.3, kala: 20.2, chestha: 15.4, naisargika: 19.45, drik: 0 },
      "Saturn": { total: 140.6, sthana: 42.8, dig: 28.5, kala: 24.1, chestha: 18.9, naisargika: 26.3, drik: 0 }
    },
    ashtakavarga: {
      sav: [
        { house: 1, points: 6 },
        { house: 2, points: 4 },
        { house: 3, points: 5 },
        { house: 4, points: 7 },
        { house: 5, points: 3 },
        { house: 6, points: 4 },
        { house: 7, points: 6 },
        { house: 8, points: 2 },
        { house: 9, points: 5 },
        { house: 10, points: 8 },
        { house: 11, points: 4 },
        { house: 12, points: 3 }
      ],
      bav: [
        { planet: "Sun", house: 1, points: 5 },
        { planet: "Moon", house: 2, points: 4 },
        { planet: "Mars", house: 3, points: 6 }
      ]
    },
    dasha: {
      vimshottari: [
        {
          name: "Ketu",
          lord: "Ketu",
          start: "2020-01-01T00:00:00Z",
          end: "2027-01-01T00:00:00Z",
          level: "MAHA",
          children: [
            {
              name: "Venus",
              lord: "Venus",
              start: "2023-01-01T00:00:00Z",
              end: "2024-01-01T00:00:00Z",
              level: "ANTAR"
            }
          ]
        }
      ],
      yogini: null
    },
    vargas: [
      { id: "D9", title: "Navamsa", keyHints: ["Marriage", "Spiritual growth"], verdict: "Strong 9th house" },
      { id: "D10", title: "Dasamsa", keyHints: ["Career", "Profession"], verdict: "Good career prospects" }
    ],
    transits: [
      { date: "2024-01-20", highlights: ["Jupiter enters Aries", "Mars aspects 7th house"] },
      { date: "2024-02-15", highlights: ["Saturn direct motion", "Venus conjunct Sun"] }
    ],
    panchanga: {
      tithi: "Purnima",
      vara: "Sunday",
      nakshatra: "Rohini",
      yoga: "Siddhi",
      karana: "Vishti"
    },
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
          <div className="space-y-6">
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ResultSummaryCard asc={data.ascSignLabel} moon={data.moonSignLabel} />
              <FileCards items={items} onSendToChat={append} />
            </div>

            {/* Strength Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ShadbalaCard data={data.shadbala} />
              <AshtakavargaCard data={data.ashtakavarga} />
            </div>

            {/* Dasha Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DashaTreeCard title={getString("dasha_v", lang)} tree={data.dasha.vimshottari} />
              {data.dasha.yogini && (
                <DashaTreeCard title={getString("dasha_y", lang)} tree={data.dasha.yogini} />
              )}
            </div>

            {/* Varga & Conditions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VargaTiles items={data.vargas} />
              <ConditionWatchCard planets={data.planets} />
            </div>

            {/* Transits & Panchanga */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TransitTodayCard transits={data.transits} />
              <PanchangaCard panchanga={data.panchanga} />
            </div>

            {/* Traditional Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PlanetTableCard rows={data.planets}/>
              <YogDoshGrid yogas={data.yogas} doshas={data.doshas}/>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
