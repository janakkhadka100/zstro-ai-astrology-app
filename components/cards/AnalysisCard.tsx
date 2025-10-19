"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface AnalysisCardProps {
  text: string;
}

export default function AnalysisCard({ text }: AnalysisCardProps) {
  return (
    <Card id="card-analysis" className="rounded-2xl shadow-md bg-gradient-to-r from-slate-100 to-slate-50">
      <CardHeader className="text-center font-semibold text-slate-800">
        General Analysis
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-white/75 rounded-lg p-4">
          <div className="text-sm text-slate-700 leading-relaxed">
            {text || "No analysis available at this time."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
