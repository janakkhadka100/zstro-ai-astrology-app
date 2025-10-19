"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface OverviewCardProps {
  data: {
    asc: string;
    moon: string;
    summary?: string;
  };
}

export default function OverviewCard({ data }: OverviewCardProps) {
  return (
    <Card id="card-overview" className="rounded-2xl shadow-md bg-gradient-to-r from-indigo-200 via-sky-200 to-pink-200">
      <CardHeader className="text-center font-semibold text-indigo-800">
        Kundali Overview
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/75 rounded-lg p-3 text-center">
            <div className="text-xs opacity-70 text-indigo-600">Ascendant</div>
            <div className="font-bold text-indigo-800 text-lg">{data.asc}</div>
          </div>
          <div className="bg-white/75 rounded-lg p-3 text-center">
            <div className="text-xs opacity-70 text-indigo-600">Moon Sign</div>
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
