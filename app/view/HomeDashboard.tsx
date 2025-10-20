"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { flags } from "@/lib/flags";
import LangSwitcher from "@/components/LangSwitcher";
import UploadBox from "@/components/UploadBox";
import SaveMenu from "@/components/SaveMenu";

type UserLite = { id: string; name?: string | null; email?: string | null };

function StreakChip(){
  if(!flags.show_streaks) return null;
  const [streak,setStreak]=useState(1);
  useEffect(()=>{
    const today = new Date().toISOString().slice(0,10);
    const last = localStorage.getItem("zstro:lastActive") || today;
    let s = Number(localStorage.getItem("zstro:streak")||"1");
    if (last !== today) {
      const d = (Date.parse(today)-Date.parse(last))/(1000*60*60*24);
      s = d===1 ? s+1 : 1;
    }
    localStorage.setItem("zstro:lastActive", today);
    localStorage.setItem("zstro:streak", String(s));
    setStreak(s);
  },[]);
  return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm">🔥 {streak}-day streak</span>;
}

function DailyFocusCard({tip, transit}:{tip:string; transit:string}){
  return (
    <div className="rounded-2xl p-4 shadow bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
      <div className="text-sm font-semibold">Today’s Focus</div>
      <div className="text-sm mt-1">Transit: {transit}</div>
      <div className="text-sm mt-1">Do this: {tip}</div>
    </div>
  );
}

function QuickActions({onUpload,onEdit,onRecompute}:{onUpload:()=>void;onEdit:()=>void;onRecompute:()=>void;}){
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onUpload} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-sm">Upload Docs</button>
      <button onClick={onEdit} className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-sm">Update Birth Data</button>
      <button onClick={onRecompute} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm">Recompute</button>
    </div>
  );
}

function CardShell({id, title, children}:{id:string; title:string; children:React.ReactNode}){
  return (
    <section id={id} className="rounded-2xl shadow bg-white p-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </section>
  );
}

function MemoryMiniTimeline(){
  if(!flags.show_memory_timeline) return null;
  const [items,setItems]=useState<Array<{date?:string,type?:string,desc?:string}>>([]);
  useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch('/api/memory/events');
        const j=await r.json();
        if(j?.data){
          const mapped=(j.data as any[]).slice(0,3).map(m=>({date:m.eventDate, type:m.eventType, desc:m.eventDescription}));
          setItems(mapped);
        }
      }catch{/* ignore */}
    })();
  },[]);
  return (
    <CardShell id="card-memory" title="Recent Events">
      <div className="space-y-2">
        {items.length===0 && <div className="text-xs text-slate-500">No recent events</div>}
        {items.map((it,i)=>(
          <div key={i} className="text-sm">
            <span className="text-slate-500 mr-2">{it.date||'-'}</span>
            <span className="font-medium mr-2">{it.type||'event'}</span>
            <span className="text-slate-700">{it.desc}</span>
          </div>
        ))}
        <div className="pt-2">
          <button className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-sm">+ Add Event</button>
        </div>
      </div>
    </CardShell>
  );
}

function ChatFeed(){
  return <div className="min-h-[200px] text-sm text-slate-600">Chat will appear here…</div>;
}

function ChatComposer({disabled, onSend}:{disabled:boolean; onSend:(t:string)=>void}){
  const [v,setV]=useState("");
  return (
    <div className="sticky bottom-2 bg-white/70 backdrop-blur rounded-2xl shadow p-2 flex gap-2">
      <input value={v} onChange={e=>setV(e.target.value)} placeholder={disabled?"Scroll to unlock chat":"Type your question…"} className="flex-1 px-3 py-2 rounded-xl border" disabled={disabled}/>
      <button onClick={()=>{ if(!disabled && v.trim()){ onSend(v); setV(""); } }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white" disabled={disabled}>Send</button>
    </div>
  );
}

export default function HomeDashboard({ user }:{ user: UserLite }){
  const unlockRef = useRef<HTMLDivElement|null>(null);
  const [unlocked,setUnlocked]=useState(false);
  useEffect(()=>{
    const el=unlockRef.current; if(!el) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting) setUnlocked(true); });
    },{ rootMargin: '0px', threshold: 0.3 });
    io.observe(el);
    return ()=>{ io.disconnect(); };
  },[]);

  const handleSend = async (text:string)=>{
    try{ await fetch('/api/memory/process',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: text }) }); }catch{}
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <header className="flex items-center justify-between">
          <div className="text-xl font-semibold">Welcome {user?.name || 'there'}</div>
          <div className="flex items-center gap-3">
            <StreakChip/>
            <SaveMenu targetSelector="main"/>
            <LangSwitcher/>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DailyFocusCard tip="Keep communications clear and kind." transit="Moon trine Mercury"/>
          <QuickActions onUpload={()=>{}} onEdit={()=>{}} onRecompute={()=>{}}/>
        </div>

        <div className="space-y-3">
          <UploadBox onUploaded={()=>{}}/>
          <CardShell id="card-birth" title="Birth Details">Your birth data card…</CardShell>
          <CardShell id="card-overview" title="Overview">High-level summary…</CardShell>
          <CardShell id="card-planets" title="Planets">Planet positions…</CardShell>
          <CardShell id="card-charts" title="Charts">D1 / D9 …</CardShell>
          <CardShell id="card-vim" title="Vimshottari">Current maha/antar…</CardShell>
          <CardShell id="card-yogini" title="Yogini">Timeline…</CardShell>
          <CardShell id="card-transits" title="Transits">Today’s highlights…</CardShell>
          <CardShell id="card-analysis" title="Analysis">AI insights…</CardShell>
          <CardShell id="card-suggest" title="Suggestions">Suggested questions…</CardShell>

          <MemoryMiniTimeline/>

          <div ref={unlockRef} className="h-10"/>

          <ChatFeed/>
        </div>

        <ChatComposer disabled={!unlocked} onSend={handleSend}/>
      </div>
    </main>
  );
}