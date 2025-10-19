import { Suspense } from 'react';
import ResultSummaryCard from '@/components/astro/ResultSummaryCard';
import PDFButtonCard from '@/components/astro/PDFButtonCard';
import PlanetTableCard from '@/components/astro/PlanetTableCard';
import YogDoshGrid from '@/components/astro/YogDoshGrid';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartView } from '@/components/astro/ChartView';
import { Skeleton } from '@/components/ui/skeleton';
import { getPlanetRows } from '@/lib/astrology/pipeline';

// Mock data for development - replace with actual data fetching
const mockPipelineData = {
  ascSignId: 1,
  ascSignLabel: "Aries",
  planets: [
    {
      planet: "Sun" as const,
      signId: 1,
      signLabel: "Aries",
      degree: 15.5,
      house: 1,
      safeHouse: 1,
      shadbala: {
        total: 150.25,
        sthana: 45.5,
        dig: 30.2,
        kala: 25.8,
        chestha: 20.1,
        naisargika: 28.65
      }
    },
    {
      planet: "Moon" as const,
      signId: 4,
      signLabel: "Cancer",
      degree: 280.3,
      house: 4,
      safeHouse: 4,
      shadbala: {
        total: 180.75,
        sthana: 50.2,
        dig: 35.1,
        kala: 30.5,
        chestha: 25.8,
        naisargika: 39.15
      }
    },
    {
      planet: "Mars" as const,
      signId: 1,
      signLabel: "Aries",
      degree: 12.8,
      house: 1,
      safeHouse: 1,
      shadbala: {
        total: 120.45,
        sthana: 40.1,
        dig: 25.3,
        kala: 20.2,
        chestha: 15.4,
        naisargika: 19.45
      }
    },
    {
      planet: "Mercury" as const,
      signId: 2,
      signLabel: "Taurus",
      degree: 45.2,
      house: 2,
      safeHouse: 2,
      shadbala: null
    },
    {
      planet: "Jupiter" as const,
      signId: 9,
      signLabel: "Sagittarius",
      degree: 245.7,
      house: 9,
      safeHouse: 9,
      shadbala: {
        total: 200.15,
        sthana: 60.3,
        dig: 40.2,
        kala: 35.8,
        chestha: 30.1,
        naisargika: 33.75
      }
    },
    {
      planet: "Venus" as const,
      signId: 7,
      signLabel: "Libra",
      degree: 195.4,
      house: 7,
      safeHouse: 7,
      shadbala: {
        total: 165.8,
        sthana: 48.5,
        dig: 32.1,
        kala: 28.3,
        chestha: 22.7,
        naisargika: 34.2
      }
    },
    {
      planet: "Saturn" as const,
      signId: 10,
      signLabel: "Capricorn",
      degree: 275.9,
      house: 10,
      safeHouse: 10,
      shadbala: {
        total: 140.6,
        sthana: 42.8,
        dig: 28.5,
        kala: 24.1,
        chestha: 18.9,
        naisargika: 26.3
      }
    },
    {
      planet: "Rahu" as const,
      signId: 5,
      signLabel: "Leo",
      degree: 125.6,
      house: 5,
      safeHouse: 5,
      shadbala: null
    },
    {
      planet: "Ketu" as const,
      signId: 11,
      signLabel: "Aquarius",
      degree: 305.2,
      house: 11,
      safeHouse: 11,
      shadbala: null
    }
  ],
  vimshottariTree: [
    {
      name: "Sun",
      lord: "Sun",
      start: "2020-01-01T00:00:00.000Z",
      end: "2026-01-01T00:00:00.000Z",
      level: "MAHA",
      children: [
        {
          name: "Moon",
          lord: "Moon",
          start: "2020-01-01T00:00:00.000Z",
          end: "2021-01-01T00:00:00.000Z",
          level: "ANTAR",
          children: []
        },
        {
          name: "Mars",
          lord: "Mars",
          start: "2021-01-01T00:00:00.000Z",
          end: "2022-01-01T00:00:00.000Z",
          level: "ANTAR",
          children: []
        }
      ]
    }
  ],
  yoginiTree: [
    {
      name: "Sankata",
      lord: "Rahu",
      start: "2020-01-01T00:00:00.000Z",
      end: "2021-01-01T00:00:00.000Z",
      level: "YOGINI",
      children: []
    }
  ],
  lang: "ne" as const,
  mismatches: [],
  dashaFixes: []
};

export default function KundaliPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            जन्मकुण्डली / Kundali
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete astrological analysis and predictions
          </p>
        </div>

        {/* Result Summary Card */}
        <div className="mb-6">
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <ResultSummaryCard 
              asc={mockPipelineData.ascSignLabel}
              moon={mockPipelineData.planets.find(p => p.planet === "Moon")?.signLabel || "Unknown"}
              loading={false}
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <PDFButtonCard data={mockPipelineData} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              {/* Chart View */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  कुण्डली चार्ट / Kundali Chart
                </h2>
                <div id="kundali-chart" className="min-h-[400px]">
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ChartView data={mockPipelineData} />
                  </Suspense>
                </div>
              </div>

              {/* Planet Table */}
              <PlanetTableCard rows={getPlanetRows(mockPipelineData)} />

              {/* Shadbala Table */}
              <YogDoshGrid yogas={[]} doshas={[]} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}