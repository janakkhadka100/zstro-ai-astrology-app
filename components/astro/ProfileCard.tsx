"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileCardProps {
  data: {
    ascSignId: number;
    ascSignLabel: string;
    planets: Array<{
      planet: string;
      signLabel: string;
      safeHouse: number;
    }>;
    lang: "ne" | "en";
  };
}

export function ProfileCard({ data }: ProfileCardProps) {
  const { ascSignLabel, planets, lang } = data;
  const isNepali = lang === "ne";

  // Find key planets
  const sun = planets.find(p => p.planet === "Sun");
  const moon = planets.find(p => p.planet === "Moon");
  const ascendant = ascSignLabel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {isNepali ? "व्यक्तिगत विवरण" : "Personal Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isNepali ? "लग्न" : "Ascendant"}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {ascendant}
            </span>
          </div>
          
          {sun && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isNepali ? "सूर्य" : "Sun"}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {sun.signLabel} ({isNepali ? "घर" : "House"} {sun.safeHouse})
              </span>
            </div>
          )}
          
          {moon && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isNepali ? "चन्द्रमा" : "Moon"}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {moon.signLabel} ({isNepali ? "घर" : "House"} {moon.safeHouse})
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isNepali 
              ? "सबै ग्रहहरूको स्थिति र बलको विस्तृत विश्लेषण तल दिइएको छ।"
              : "Detailed analysis of all planetary positions and strengths is provided below."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
