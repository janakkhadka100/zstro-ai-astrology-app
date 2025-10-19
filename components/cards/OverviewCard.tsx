"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface OverviewCardProps {
  data: {
    asc: string;
    moon: string;
    summary?: string;
  };
}

export default function OverviewCard({ data }: OverviewCardProps) {
  const { lang } = useLang();
  const s = strings[lang];

  return (
    <Card id="card-overview" className="rounded-2xl shadow-md bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200">
      <CardHeader className="text-center font-semibold text-indigo-800">
        {s.kundali_overview}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/75 rounded-lg p-3 text-center">
            <div className="text-xs opacity-70 text-indigo-600">{s.asc}</div>
            <div className="font-bold text-indigo-800 text-lg">{data.asc}</div>
          </div>
          <div className="bg-white/75 rounded-lg p-3 text-center">
            <div className="text-xs opacity-70 text-indigo-600">{s.moon}</div>
            <div className="font-bold text-indigo-800 text-lg">{data.moon}</div>
          </div>
        </div>
        {data.summary && (
          <div className="bg-white/75 rounded-lg p-3">
            <div className="text-sm text-indigo-700">{data.summary}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
