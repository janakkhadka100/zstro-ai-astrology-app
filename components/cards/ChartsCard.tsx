"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Charts } from "@/lib/astro-contract";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface ChartsCardProps {
  charts: Charts;
}

export default function ChartsCard({ charts }: ChartsCardProps) {
  const [activeTab, setActiveTab] = useState<"d1" | "d9">("d1");
  const { lang } = useLang();
  const s = strings[lang];

  return (
    <Card id="card-charts" className="rounded-2xl shadow-md bg-gradient-to-r from-violet-100 via-fuchsia-100 to-pink-100">
      <CardHeader className="text-center font-semibold text-violet-800">
        {s.divisional_charts}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("d1")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "d1"
                ? "bg-violet-500 text-white"
                : "text-violet-700 hover:bg-white/75"
            }`}
          >
            D1 (Rāśi)
          </button>
          <button
            onClick={() => setActiveTab("d9")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "d9"
                ? "bg-violet-500 text-white"
                : "text-violet-700 hover:bg-white/75"
            }`}
          >
            D9 (Navāṁśa)
          </button>
        </div>

        {/* Chart Content */}
        <div id="kundali-chart" className="bg-white/75 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
          {activeTab === "d1" ? (
            charts.d1 ? (
              <div className="text-center">
                <div className="text-lg font-semibold text-violet-800 mb-2">Rāśi Chart</div>
                <div className="text-sm text-violet-600">Ascendant: {charts.d1.ascendant || "Loading..."}</div>
                <div className="mt-4 text-xs text-gray-500">Chart visualization will be rendered here</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold mb-2">Rāśi Chart</div>
                <div className="text-sm">{s.no_data}</div>
              </div>
            )
          ) : (
            charts.d9 ? (
              <div className="text-center">
                <div className="text-lg font-semibold text-violet-800 mb-2">Navāṁśa Chart</div>
                <div className="text-sm text-violet-600">Ascendant: {charts.d9.ascendant || "Loading..."}</div>
                <div className="mt-4 text-xs text-gray-500">Chart visualization will be rendered here</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold mb-2">Navāṁśa Chart</div>
                <div className="text-sm">{s.no_data}</div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
