"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang"; 
import { t } from "@/utils/strings";

export default function PlanetTableCard({rows}:{rows:{planet:string;signLabel:string;house:number}[]}) {
  const {lang}=useLang(); 
  const s=t[lang];
  return (
    <Card className="rounded-2xl shadow-md bg-gradient-to-br from-rose-100 via-amber-100 to-orange-100">
      <CardHeader className="text-center font-semibold text-rose-700">{s.planets}</CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs bg-rose-200/60 text-rose-900">
            <tr>
              <th className="p-2 text-left">Planet</th>
              <th className="p-2 text-left">Sign</th>
              <th className="p-2 text-left">House</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length? rows.map((r,i)=>(
              <tr key={i} className="border-t border-rose-300/40">
                <td className="p-2">{r.planet}</td>
                <td className="p-2">{r.signLabel}</td>
                <td className="p-2">{r.house}</td>
              </tr>
            )):<tr><td colSpan={3} className="p-3 text-center opacity-60">No data</td></tr>}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}