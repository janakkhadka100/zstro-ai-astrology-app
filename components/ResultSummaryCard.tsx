"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Props = { asc?: string; moon?: string; loading?: boolean; };
export default function ResultSummaryCard({ asc, moon, loading }: Props) {
  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2"><div className="h-5 w-40 bg-muted rounded"/></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 font-medium">कुण्डली सारांश</CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border p-3"><div className="opacity-60 text-xs">लग्न</div><div className="font-medium">{asc || "—"}</div></div>
        <div className="rounded-xl border p-3"><div className="opacity-60 text-xs">चन्द्र राशी</div><div className="font-medium">{moon || "—"}</div></div>
      </CardContent>
    </Card>
  );
}
