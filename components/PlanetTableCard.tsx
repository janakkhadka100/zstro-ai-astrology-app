"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Row = { planet: string; signLabel: string; house: number; degree?: number|null; };
export default function PlanetTableCard({ rows, loading }:{ rows: Row[]; loading?: boolean }) {
  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2 font-medium">ग्रह-स्थिती</CardHeader>
        <CardContent className="space-y-2">
          {Array.from({length:6}).map((_,i)=> <div key={i} className="h-8 bg-muted rounded"/>)}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 font-medium">ग्रह-स्थिती</CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs opacity-60">
            <tr><th className="text-left py-2">ग्रह</th><th className="text-left">राशि</th><th className="text-left">भाव</th><th className="text-left">डिग्री</th></tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((r,idx)=>(
              <tr key={idx} className="border-t">
                <td className="py-2">{r.planet}</td>
                <td>{r.signLabel}</td>
                <td>{r.house}</td>
                <td>{r.degree ?? "—"}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-3 opacity-60">No rows</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
