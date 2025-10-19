"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { Shadbala } from "@/lib/astro-types";

export default function ShadbalaCard({ data, loading }: {
  data: Record<string, Shadbala> | null;
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-100 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-emerald-800">{t.shadbala}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const getStrengthColor = (total: number) => {
    if (total >= 300) return "text-emerald-700 bg-emerald-200";
    if (total >= 200) return "text-amber-700 bg-amber-200";
    return "text-rose-700 bg-rose-200";
  };

  const getStrengthLabel = (total: number) => {
    if (total >= 300) return t.strength;
    if (total >= 200) return t.moderate;
    return t.weakness;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-emerald-800">{t.shadbala}</CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(data).map(([planet, shadbala]) => (
          <div key={planet} className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-emerald-900">{planet}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(shadbala.total)}`}>
                {(shadbala.total || 0).toFixed(0)} - {getStrengthLabel(shadbala.total || 0)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.sthana}</div>
                <div className="text-emerald-800">{(shadbala.sthana || 0).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.dig}</div>
                <div className="text-emerald-800">{(shadbala.dig || 0).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.kala}</div>
                <div className="text-emerald-800">{(shadbala.kala || 0).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.chesta}</div>
                <div className="text-emerald-800">{(shadbala.chesta || 0).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.naisargika}</div>
                <div className="text-emerald-800">{(shadbala.naisargika || 0).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-600 font-medium">{t.drik}</div>
                <div className="text-emerald-800">{(shadbala.drik || 0).toFixed(0)}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
