"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PlanetRow } from "@/lib/astro-contract";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface PlanetsCardProps {
  rows: PlanetRow[];
}

export default function PlanetsCard({ rows }: PlanetsCardProps) {
  const { lang } = useLang();
  const s = strings[lang];

  return (
    <Card id="card-planets" className="rounded-2xl shadow-md bg-gradient-to-br from-rose-100 via-amber-100 to-orange-100">
      <CardHeader className="text-center font-semibold text-rose-700">
        {s.planetary_positions}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs bg-rose-200/60 text-rose-900">
            <tr>
              <th className="p-2 text-left">Planet</th>
              <th className="p-2 text-left">Sign</th>
              <th className="p-2 text-left">{s.house}</th>
              <th className="p-2 text-left">Degree</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((row, i) => (
              <tr key={i} className="border-t border-rose-300/40">
                <td className="p-2 font-medium">{row.planet}</td>
                <td className="p-2">{row.signLabel}</td>
                <td className="p-2">{row.safeHouse || row.house}</td>
                <td className="p-2">{row.degree ? `${row.degree.toFixed(2)}°` : "—"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-3 text-center opacity-60">{s.no_data}</td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
