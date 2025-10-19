"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function PlanetTableCard({ rows, loading }:{ rows:any[]; loading?:boolean }) {
  const { lang } = useLang(); const t = strings[lang];
  return (
    <Card className="bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 shadow-md rounded-2xl">
      <CardHeader className="text-center font-semibold text-rose-700">{t.planets}</CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rose-200/60 text-xs text-rose-900">
            <tr>
              <th className="p-2 text-left">Planet</th>
              <th className="p-2 text-left">Sign</th>
              <th className="p-2 text-left">House</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((r,i)=>(
              <tr key={i} className="border-t border-rose-300/40">
                <td className="p-2">{r.planet}</td>
                <td className="p-2">{r.signLabel}</td>
                <td className="p-2">{r.house}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-4 text-center opacity-70">No Data</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}