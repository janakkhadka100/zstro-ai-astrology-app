"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { Panchanga } from "@/lib/astro-types";

export default function PanchangaCard({ panchanga, loading }: {
  panchanga: Panchanga | null;
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!panchanga) {
    return (
      <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-teal-800">{t.panchanga}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const panchangaItems = [
    { key: 'tithi', value: panchanga.tithi, label: t.tithi },
    { key: 'vara', value: panchanga.vara, label: t.vara },
    { key: 'nakshatra', value: panchanga.nakshatra, label: t.nakshatra },
    { key: 'yoga', value: panchanga.yoga, label: t.yoga },
    { key: 'karana', value: panchanga.karana, label: t.karana }
  ];

  return (
    <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-teal-800">{t.panchanga}</CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {panchangaItems.map((item) => (
          <div key={item.key} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-xs text-teal-600 font-medium mb-1">{item.label}</div>
            <div className="text-sm text-teal-800 font-medium">
              {item.value || '—'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
