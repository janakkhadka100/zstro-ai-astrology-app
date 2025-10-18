'use client';

import { useEffect, useState } from 'react';
import NorthIndianChart from './charts/NorthIndianChart';

interface Planet {
  planet: string;
  signId: number;
  signLabel: string;
  house: number;
  retro: boolean;
}

interface ChartViewProps {
  data: {
    ascSignId: number;
    ascSignLabel: string;
    d1: Planet[];
  };
}

export default function ChartView({ data }: ChartViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-6 text-center opacity-70">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <p className="mt-4 text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="kundali-chart" className="relative rounded-2xl border p-4 bg-white dark:bg-zinc-900">
      <NorthIndianChart 
        planets={data.d1} 
        ascendant={{ signId: data.ascSignId, signLabel: data.ascSignLabel }}
      />
    </div>
  );
}
