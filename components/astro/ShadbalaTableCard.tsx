"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import { getString, getPlanetName } from "@/utils/strings";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Target, Clock, Activity, Zap } from "lucide-react";

interface ShadbalaData {
  planet: string;
  total: number;
  sthana: number;
  dig: number;
  kala: number;
  chestha: number;
  naisargika: number;
  drik?: number;
}

interface ShadbalaTableCardProps {
  rows?: ShadbalaData[];
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

const shadbalaComponents = [
  { key: 'sthana', icon: Target, color: 'text-blue-600' },
  { key: 'dig', icon: TrendingUp, color: 'text-green-600' },
  { key: 'kala', icon: Clock, color: 'text-purple-600' },
  { key: 'chestha', icon: Activity, color: 'text-orange-600' },
  { key: 'naisargika', icon: Zap, color: 'text-pink-600' }
];

export function ShadbalaTableCard({ rows = [], loading = false, lang }: ShadbalaTableCardProps) {
  const { lang: contextLang } = useLang();
  const currentLang = lang || contextLang;

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-amber-600" />
            <span>{getString("shadbala", currentLang)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{getString("no_data", currentLang)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-amber-600" />
          <span>{getString("shadbala", currentLang)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((planet, index) => {
          const colorClass = planetColors[planet.planet] || "from-gray-400 to-slate-500";
          
          return (
            <div key={index} className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-xs font-bold">
                      {planet.planet.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {getPlanetName(planet.planet, currentLang)}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700 font-semibold">
                  {typeof planet.total === 'number' ? planet.total.toFixed(1) : '—'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {shadbalaComponents.map((component) => {
                  const IconComponent = component.icon;
                  const value = planet[component.key as keyof ShadbalaData] as number;
                  
                  return (
                    <div key={component.key} className="text-center p-2 rounded-lg bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600">
                      <IconComponent className={`h-4 w-4 mx-auto mb-1 ${component.color}`} />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {getString(component.key as keyof typeof getString, currentLang)}
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {typeof value === 'number' ? value.toFixed(1) : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}