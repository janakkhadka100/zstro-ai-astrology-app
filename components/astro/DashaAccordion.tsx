"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, Calendar, Clock, Crown, Star } from "lucide-react";
import { useState } from "react";

interface DashaBlock {
  name: string;
  lord: string;
  start: string;
  end: string;
  level: string;
  children?: DashaBlock[];
}

interface DashaAccordionProps {
  tree?: DashaBlock[];
  title?: string;
  loading?: boolean;
  lang?: "en" | "hi" | "ne";
}

const levelColors: Record<string, string> = {
  MAHA: "from-purple-500 to-indigo-600",
  ANTAR: "from-blue-500 to-cyan-600", 
  PRATYANTAR: "from-green-500 to-emerald-600",
  SUKSHMA: "from-yellow-500 to-orange-600",
  PRANA: "from-red-500 to-pink-600",
  YOGINI: "from-pink-500 to-rose-600"
};

const levelIcons: Record<string, any> = {
  MAHA: Crown,
  ANTAR: Star,
  PRATYANTAR: Star,
  SUKSHMA: Star,
  PRANA: Star,
  YOGINI: Star
};

function DashaItem({ block, level = 0, lang }: { block: DashaBlock; level?: number; lang: "en" | "hi" | "ne" }) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'ne' ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "—";
    }
  };

  const hasChildren = block.children && block.children.length > 0;
  const colorClass = levelColors[block.level] || "from-gray-500 to-slate-600";
  const IconComponent = levelIcons[block.level] || Star;

  return (
    <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
      <div 
        className={`p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer ${level > 0 ? 'ml-4' : ''}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <div className="text-gray-400">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            )}
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {block.name} ({block.lord})
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(block.start)}</span>
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(block.end)}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600">
            {block.level}
          </Badge>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-1">
          {block.children!.map((child, index) => (
            <DashaItem key={index} block={child} level={level + 1} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashaAccordion({ tree = [], title, loading = false, lang }: DashaAccordionProps) {
  const { lang: contextLang } = useLang();
  const currentLang = lang || contextLang;

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!tree.length) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <Crown className="h-6 w-6 text-violet-600" />
            <span>{title || getString("dasha", currentLang)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{getString("no_data", currentLang)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <Crown className="h-6 w-6 text-violet-600" />
          <span>{title || getString("dasha", currentLang)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tree.map((block, index) => (
          <DashaItem key={index} block={block} lang={currentLang} />
        ))}
      </CardContent>
    </Card>
  );
}