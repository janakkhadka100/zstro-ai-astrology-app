"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface AnalysisCardProps {
  text: string;
}

export default function AnalysisCard({ text }: AnalysisCardProps) {
  const { lang } = useLang();
  const s = strings[lang];

  return (
    <Card id="card-analysis" className="rounded-2xl shadow-md bg-gradient-to-r from-slate-100 to-slate-50">
      <CardHeader className="text-center font-semibold text-slate-800">
        {s.general_analysis}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-white/75 rounded-lg p-4">
          <div className="text-sm text-slate-700 leading-relaxed">
            {text || s.no_data}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
