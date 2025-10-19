"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamic import to prevent SSR issues
const ChartViewClient = dynamic(() => import('./ChartViewClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  )
});

interface ChartViewProps {
  data: {
    ascSignId: number;
    ascSignLabel: string;
    planets: Array<{
      planet: string;
      signId: number;
      signLabel: string;
      degree: number | null;
      safeHouse: number;
    }>;
    lang: "ne" | "en";
  };
}

export function ChartView({ data }: ChartViewProps) {
  return <ChartViewClient data={data} />;
}
