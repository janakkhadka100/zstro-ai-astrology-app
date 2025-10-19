"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function YogDoshGrid({ yogas, doshas }:{
  yogas:any[]; doshas:any[];
}) {
  const { lang } = useLang(); const t = strings[lang];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gradient-to-tr from-green-100 via-emerald-100 to-lime-100 rounded-2xl shadow-md">
        <CardHeader className="font-semibold text-emerald-800">{t.yog}</CardHeader>
        <CardContent className="space-y-2 text-sm">
          {yogas?.length ? yogas.map((y,i)=>
            <div key={i} className="p-2 rounded-lg bg-white/70">{y.label} — {y.factors.join(", ")}</div>
          ) : <div className="text-xs opacity-70">No Yogas</div>}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-tr from-yellow-100 via-amber-100 to-orange-100 rounded-2xl shadow-md">
        <CardHeader className="font-semibold text-amber-800">{t.dosh}</CardHeader>
        <CardContent className="space-y-2 text-sm">
          {doshas?.length ? doshas.map((d,i)=>
            <div key={i} className="p-2 rounded-lg bg-white/70">{d.label} — {d.factors.join(", ")}</div>
          ) : <div className="text-xs opacity-70">No Doshas</div>}
        </CardContent>
      </Card>
    </div>
  );
}
