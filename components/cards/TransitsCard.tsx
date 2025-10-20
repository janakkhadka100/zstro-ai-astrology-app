"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Transits } from "@/lib/astro-contract";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

interface TransitsCardProps {
  data: Transits;
}

export default function TransitsCard({ data }: TransitsCardProps) {
  const { lang } = useLang();
  const s = strings[lang];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Card id="card-transits" className="rounded-2xl shadow-md bg-gradient-to-r from-cyan-100 via-sky-100 to-indigo-100">
      <CardHeader className="text-center font-semibold text-cyan-800">
        {s.current_transits}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/75 rounded-lg p-3">
          <div className="text-sm font-medium text-cyan-800 mb-2">
            {s.today}: {formatDate(data.date)}
          </div>
        </div>

        {data.highlights?.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-cyan-700">Today's Highlights:</div>
            <ul className="space-y-1">
              {data.highlights.map((highlight, index) => (
                <li key={index} className="text-sm text-cyan-600 flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.activeHouses?.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-cyan-700">Active Houses:</div>
            <div className="flex flex-wrap gap-2">
              {data.activeHouses.map((house, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-cyan-200 text-cyan-800 text-xs rounded-full"
                >
                  {s.house} {house}
                </span>
              ))}
            </div>
          </div>
        )}

        {(!data.highlights?.length && !data.activeHouses?.length) && (
          <div className="text-center text-cyan-600 py-4">
            {s.no_data}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
