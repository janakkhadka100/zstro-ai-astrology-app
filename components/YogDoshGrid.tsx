"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang"; 
import { t } from "@/utils/strings";

export default function YogDoshGrid({yogas,doshas}:{yogas:{label:string;factors:string[]}[]; doshas:{label:string;factors:string[]}[]}) {
  const {lang}=useLang(); 
  const s=t[lang];
  return (
    <div className="grid gap-4">
      <Card className="rounded-2xl shadow-md bg-gradient-to-tr from-emerald-100 via-green-100 to-lime-100">
        <CardHeader className="font-semibold text-emerald-800">{s.yog}</CardHeader>
        <CardContent className="space-y-2 text-sm">
          {yogas?.length? yogas.map((y,i)=><div key={i} className="bg-white/75 rounded-lg p-2">{y.label} — {y.factors.join(", ")}</div>):<div className="text-xs opacity-70">No Yogas</div>}
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md bg-gradient-to-tr from-yellow-100 via-amber-100 to-orange-100">
        <CardHeader className="font-semibold text-amber-800">{s.dosh}</CardHeader>
        <CardContent className="space-y-2 text-sm">
          {doshas?.length? doshas.map((d,i)=><div key={i} className="bg-white/75 rounded-lg p-2">{d.label} — {d.factors.join(", ")}</div>):<div className="text-xs opacity-70">No Doshas</div>}
        </CardContent>
      </Card>
    </div>
  );
}