"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { TransitHighlight } from "@/lib/astro-types";

export default function TransitTodayCard({ transits, loading }: {
  transits: TransitHighlight[];
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

  if (!transits || transits.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-teal-800">{t.transit}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return t.today;
      if (diffDays === 1) return t.tomorrow;
      if (diffDays === -1) return t.yesterday;
      if (diffDays > 0) return `+${diffDays} days`;
      return `${diffDays} days ago`;
    } catch {
      return dateStr;
    }
  };

  const isToday = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-teal-800">{t.transit}</CardHeader>
      <CardContent className="space-y-3">
        {transits.slice(0, 5).map((transit, index) => (
          <div 
            key={index}
            className={`p-3 rounded-xl ${
              isToday(transit.date) 
                ? 'bg-teal-200 border-2 border-teal-400' 
                : 'bg-white/70 backdrop-blur-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium text-teal-900">
                {formatDate(transit.date)}
              </div>
              {isToday(transit.date) && (
                <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full">
                  {t.today}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {transit.highlights.slice(0, 2).map((highlight, i) => (
                <div key={i} className="text-xs text-teal-700">
                  • {highlight}
                </div>
              ))}
              {transit.highlights.length > 2 && (
                <div className="text-xs text-teal-600">
                  +{transit.highlights.length - 2} more...
                </div>
              )}
            </div>
          </div>
        ))}
        
        {transits.length > 5 && (
          <div className="text-center text-xs text-teal-600">
            +{transits.length - 5} more transits
          </div>
        )}
      </CardContent>
    </Card>
  );
}
