"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BirthDetails } from "@/lib/astro-contract";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface BirthCardProps {
  data: BirthDetails;
}

export default function BirthCard({ data }: BirthCardProps) {
  const { lang } = useLang();
  const s = strings[lang];

  return (
    <Card id="card-birth" className="rounded-2xl shadow-md bg-gradient-to-r from-emerald-100 via-green-50 to-lime-100">
      <CardHeader className="text-center font-semibold text-emerald-800">
        {s.birth_details}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/75 rounded-lg p-3">
            <div className="text-xs opacity-70 text-emerald-600">{s.name}</div>
            <div className="font-bold text-emerald-800">{data.name}</div>
          </div>
          <div className="bg-white/75 rounded-lg p-3">
            <div className="text-xs opacity-70 text-emerald-600">{s.birth_date}</div>
            <div className="font-bold text-emerald-800">{data.birthDate}</div>
          </div>
          <div className="bg-white/75 rounded-lg p-3">
            <div className="text-xs opacity-70 text-emerald-600">{s.birth_time}</div>
            <div className="font-bold text-emerald-800">{data.birthTime}</div>
          </div>
          <div className="bg-white/75 rounded-lg p-3">
            <div className="text-xs opacity-70 text-emerald-600">{s.birth_place}</div>
            <div className="font-bold text-emerald-800">{data.birthPlace}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
