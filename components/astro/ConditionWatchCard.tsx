"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import { PlanetData } from "@/lib/astro-types";

export default function ConditionWatchCard({ planets, loading }: {
  planets: PlanetData[];
  loading?: boolean;
}) {
  const { lang } = useLang();
  const t = strings[lang];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-rose-100 via-red-50 to-rose-200 animate-pulse rounded-2xl shadow-md">
        <CardHeader className="h-8" />
        <CardContent className="h-24" />
      </Card>
    );
  }

  if (!planets || planets.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-rose-100 via-red-50 to-rose-200 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-rose-800">{t.aspects}</CardHeader>
        <CardContent className="text-center text-sm opacity-70">{t.no_data}</CardContent>
      </Card>
    );
  }

  const retroPlanets = planets.filter(p => p.retro);
  const combustPlanets = planets.filter(p => p.combust);

  if (retroPlanets.length === 0 && combustPlanets.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-rose-100 via-red-50 to-rose-200 rounded-2xl shadow-md">
        <CardHeader className="text-center font-semibold text-rose-800">{t.aspects}</CardHeader>
        <CardContent className="text-center text-sm text-rose-600">
          All planets in normal condition
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-rose-100 via-red-50 to-rose-200 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-rose-800">{t.aspects}</CardHeader>
      <CardContent className="space-y-3">
        {retroPlanets.length > 0 && (
          <div>
            <div className="text-sm font-medium text-rose-700 mb-2">{t.retro}</div>
            <div className="flex flex-wrap gap-2">
              {retroPlanets.map((planet, index) => (
                <div 
                  key={index}
                  className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-medium"
                >
                  {planet.planet} {t.retro}
                </div>
              ))}
            </div>
          </div>
        )}

        {combustPlanets.length > 0 && (
          <div>
            <div className="text-sm font-medium text-rose-700 mb-2">{t.combust}</div>
            <div className="flex flex-wrap gap-2">
              {combustPlanets.map((planet, index) => (
                <div 
                  key={index}
                  className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium"
                >
                  {planet.planet} {t.combust}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-rose-600 text-center">
          {retroPlanets.length + combustPlanets.length} planets need attention
        </div>
      </CardContent>
    </Card>
  );
}
