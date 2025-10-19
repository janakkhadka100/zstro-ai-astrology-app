"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Moon, Sun } from "lucide-react";

interface ResultSummaryCardProps {
  asc?: string;
  moon?: string;
  loading?: boolean;
  lang?: "en" | "hi" | "ne";
}

export function ResultSummaryCard({ asc, moon, loading = false, lang }: ResultSummaryCardProps) {
  const { lang: contextLang } = useLang();
  const currentLang = lang || contextLang;

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <Star className="h-6 w-6 text-purple-600" />
          <span>{getString("summary", currentLang)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getString("asc", currentLang)}
            </p>
            <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700">
              {asc || "—"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getString("moon", currentLang)}
            </p>
            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
              {moon || "—"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}