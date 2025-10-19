"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function ResultSummaryCard({ asc, moon, loading }:{
  asc?:string; moon?:string; loading?:boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];
  if (loading) return (
    <Card className="bg-gradient-to-r from-sky-100 to-indigo-100 animate-pulse rounded-2xl">
      <CardContent className="h-24" />
    </Card>
  );
  return (
    <Card className="bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200 shadow-md rounded-2xl">
      <CardHeader className="font-semibold text-lg text-center text-indigo-800">{t.summary}</CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white/70 backdrop-blur-sm p-3">
          <div className="text-xs opacity-70">{t.asc}</div>
          <div className="font-bold text-lg text-indigo-700">{asc || "—"}</div>
        </div>
        <div className="rounded-xl bg-white/70 backdrop-blur-sm p-3">
          <div className="text-xs opacity-70">{t.moon}</div>
          <div className="font-bold text-lg text-indigo-700">{moon || "—"}</div>
        </div>
      </CardContent>
    </Card>
  );
}