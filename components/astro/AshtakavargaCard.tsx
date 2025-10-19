"use client";
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { BAVRow, SAVRow } from "@/lib/astro-types";

export default function AshtakavargaCard({ data, loading }: {
  data: { bav: BAVRow[]; sav: SAVRow[] } | null;
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-100 via-sky-100 to-cyan-100 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-48" />
      </Card>
    );
  }

  if (!data || (!data.sav || data.sav.length === 0)) {
    return (
      <Card className="bg-gradient-to-br from-indigo-100 via-sky-100 to-cyan-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-indigo-800">{t.ashtakavarga}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const getPointColor = (points: number) => {
    if (points >= 6) return "bg-emerald-500";
    if (points >= 4) return "bg-amber-500";
    if (points >= 2) return "bg-orange-500";
    return "bg-rose-500";
  };

  const getPointOpacity = (points: number) => {
    return Math.max(0.3, points / 8);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-100 via-sky-100 to-cyan-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-indigo-800">{t.ashtakavarga}</CardHeader>
      <CardContent className="space-y-4">
        {/* SAV Heatmap */}
        <div>
          <div className="text-sm font-medium text-indigo-700 mb-2">{t.sav}</div>
          <div className="grid grid-cols-4 gap-1">
            {data.sav.map((row) => (
              <div key={row.house} className="text-center">
                <div className={`h-8 w-full rounded ${getPointColor(row.points)}`} 
                     style={{ opacity: getPointOpacity(row.points) }} />
                <div className="text-xs text-indigo-600 mt-1">{row.house}</div>
                <div className="text-xs font-medium text-indigo-800">{row.points}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BAV Table */}
        {data.bav && data.bav.length > 0 && (
          <div>
            <div className="text-sm font-medium text-indigo-700 mb-2">{t.bav}</div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-medium text-indigo-600">{t.planet}</div>
                <div className="font-medium text-indigo-600">{t.house}</div>
                <div className="font-medium text-indigo-600">{t.points}</div>
                {data.bav.slice(0, 6).map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="text-indigo-800">{row.planet}</div>
                    <div className="text-indigo-800">{row.house}</div>
                    <div className="text-indigo-800">{row.points}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-rose-500 rounded"></div>
            <span className="text-indigo-600">0-1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-indigo-600">2-3</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-indigo-600">4-5</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-indigo-600">6-8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
