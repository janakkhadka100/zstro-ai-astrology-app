"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import { getString, getPlanetName, getSignName } from "@/utils/strings";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Home, Zap } from "lucide-react";

interface PlanetData {
  planet: string;
  signId?: number;
  signLabel?: string;
  house?: number;
  safeHouse?: number;
  degree?: number | null;
  shadbala?: {
    total: number;
    sthana: number;
    dig: number;
    kala: number;
    chestha: number;
    naisargika: number;
  } | null;
}

interface PlanetTableCardProps {
  rows?: PlanetData[];
  loading?: boolean;
  lang?: "en" | "hi" | "ne";
}

const planetColors: Record<string, string> = {
  Sun: "from-orange-400 to-red-500",
  Moon: "from-blue-400 to-indigo-500", 
  Mars: "from-red-400 to-pink-500",
  Mercury: "from-green-400 to-emerald-500",
  Jupiter: "from-yellow-400 to-orange-500",
  Venus: "from-pink-400 to-rose-500",
  Saturn: "from-gray-400 to-slate-500",
  Rahu: "from-purple-400 to-violet-500",
  Ketu: "from-indigo-400 to-purple-500"
};

const planetIcons: Record<string, any> = {
  Sun: Star,
  Moon: Star,
  Mars: Star,
  Mercury: Star,
  Jupiter: Star,
  Venus: Star,
  Saturn: Star,
  Rahu: Star,
  Ketu: Star
};

export function PlanetTableCard({ rows = [], loading = false, lang }: PlanetTableCardProps) {
  const { lang: contextLang } = useLang();
  const currentLang = lang || contextLang;

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <Star className="h-6 w-6 text-emerald-600" />
            <span>{getString("planets", currentLang)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{getString("no_data", currentLang)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <Star className="h-6 w-6 text-emerald-600" />
          <span>{getString("planets", currentLang)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((planet, index) => {
          const IconComponent = planetIcons[planet.planet] || Star;
          const colorClass = planetColors[planet.planet] || "from-gray-400 to-slate-500";
          
          return (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {getPlanetName(planet.planet, currentLang)}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600">
                    {planet.signLabel || (planet.signId ? getSignName(planet.signId, currentLang) : "—")}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 flex items-center space-x-1">
                    <Home className="h-3 w-3" />
                    <span>{planet.safeHouse || planet.house || "—"}</span>
                  </Badge>
                  {planet.degree !== null && planet.degree !== undefined && (
                    <Badge variant="outline" className="text-xs bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{planet.degree.toFixed(1)}°</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}