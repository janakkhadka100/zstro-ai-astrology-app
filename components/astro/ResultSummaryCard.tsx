"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultSummaryCardProps {
  asc: string;
  moon: string;
  loading: boolean;
}

export function ResultSummaryCard({ asc, moon, loading }: ResultSummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          जन्मकुण्डली सारांश / Kundali Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                लग्न / Ascendant:
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {asc}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                चन्द्रमा / Moon:
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {moon}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>• Complete planetary positions</p>
              <p>• Shadbala analysis</p>
              <p>• Dasha periods</p>
              <p>• Yoga & Dosha detection</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
