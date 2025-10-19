"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang"; 
import { strings } from "@/utils/strings";

export default function ResultSummaryCard({asc,moon,loading}:{asc?:string;moon?:string;loading?:boolean}){
  const {lang}=useLang(); 
  const s=strings[lang];
  if(loading) return <Card className="rounded-2xl h-24 bg-gradient-to-r from-indigo-100 to-sky-100 animate-pulse"/>;
  return (
    <Card className="rounded-2xl shadow-md bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200">
      <CardHeader className="text-center font-semibold text-indigo-800">{s.summary}</CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/75 p-3 text-center">
          <div className="text-xs opacity-70">{s.asc}</div>
          <div className="font-bold text-indigo-700">{asc||"—"}</div>
        </div>
        <div className="rounded-xl bg-white/75 p-3 text-center">
          <div className="text-xs opacity-70">{s.moon}</div>
          <div className="font-bold text-indigo-700">{moon||"—"}</div>
        </div>
      </CardContent>
    </Card>
  );
}