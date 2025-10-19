import { Suspense } from 'react';
import { ResultSummaryCard } from '@/components/astro/ResultSummaryCard';
import { ProfileCard } from '@/components/astro/ProfileCard';
import { PDFButtonCard } from '@/components/astro/PDFButtonCard';
import { PlanetTableCard } from '@/components/astro/PlanetTableCard';
import { ShadbalaTableCard } from '@/components/astro/ShadbalaTableCard';
import { DashaAccordion } from '@/components/astro/DashaAccordion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartView } from '@/components/astro/ChartView';
import { Skeleton } from '@/components/ui/skeleton';
import { getPlanetRows } from '@/lib/astrology/pipeline';

// Empty data test
const emptyPipelineData = {
  ascSignId: 1 as const,
  ascSignLabel: "Aries",
  planets: [],
  vimshottariTree: [],
  yoginiTree: [],
  lang: "ne" as const,
  mismatches: [],
  dashaFixes: []
};

// Sample data test
const samplePipelineData = {
  ascSignId: 2 as const,
  ascSignLabel: "Taurus",
  planets: [
    {
      planet: "Sun" as const,
      signId: 9 as const,
      signLabel: "Sagittarius",
      degree: 245.5,
      house: 7,
      safeHouse: 8 as const,
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
      signId: 4 as const,
      signLabel: "Cancer",
      degree: 95.3,
      house: 3,
      safeHouse: 3 as const,
      shadbala: {
        total: 180.75,
        sthana: 50.2,
        dig: 35.1,
        kala: 30.5,
        chestha: 25.8,
        naisargika: 39.15
      }
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
          level: "ANTAR"
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
      level: "YOGINI"
    }
  ],
  lang: "ne" as const,
  mismatches: [
    {
      planet: "Sun",
      apiHouse: 7,
      derivedHouse: 8
    }
  ],
  dashaFixes: [
    "Trimmed children of Sun to fit parent bounds"
  ]
};

export default function KundaliTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kundali Test - Empty & Sample Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing reliability with empty and sample pipeline data
          </p>
        </div>

        {/* Empty Data Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Empty Data Test (No Blanks)
          </h2>
          
          <div className="mb-6">
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <ResultSummaryCard 
                asc={emptyPipelineData.ascSignLabel}
                moon="Unknown"
                loading={false}
              />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileCard data={emptyPipelineData} />
              <PDFButtonCard data={emptyPipelineData} chartId="kundali-chart-empty" />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                {/* Chart View */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    कुण्डली चार्ट / Kundali Chart
                  </h3>
                  <div id="kundali-chart-empty" className="min-h-[400px]">
                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                      <ChartView data={emptyPipelineData} />
                    </Suspense>
                  </div>
                </div>

                {/* Planet Table */}
                <PlanetTableCard rows={getPlanetRows(emptyPipelineData)} />

                {/* Shadbala Table */}
                <ShadbalaTableCard rows={emptyPipelineData.planets} />

                {/* Vimshottari Dasha */}
                <DashaAccordion 
                  tree={emptyPipelineData.vimshottariTree} 
                  title="विम्शोत्तरी दशा" 
                  lang={emptyPipelineData.lang}
                />

                {/* Yogini Dasha */}
                <DashaAccordion 
                  tree={emptyPipelineData.yoginiTree} 
                  title="योगिनी दशा" 
                  lang={emptyPipelineData.lang}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Sample Data Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Sample Data Test (Full Functionality)
          </h2>
          
          <div className="mb-6">
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <ResultSummaryCard 
                asc={samplePipelineData.ascSignLabel}
                moon={samplePipelineData.planets.find(p => p.planet === "Moon")?.signLabel || "Unknown"}
                loading={false}
              />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileCard data={samplePipelineData} />
              <PDFButtonCard data={samplePipelineData} chartId="kundali-chart-sample" />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                {/* Chart View */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    कुण्डली चार्ट / Kundali Chart
                  </h3>
                  <div id="kundali-chart-sample" className="min-h-[400px]">
                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                      <ChartView data={samplePipelineData} />
                    </Suspense>
                  </div>
                </div>

                {/* Planet Table */}
                <PlanetTableCard rows={getPlanetRows(samplePipelineData)} />

                {/* Shadbala Table */}
                <ShadbalaTableCard rows={samplePipelineData.planets} />

                {/* Vimshottari Dasha */}
                <DashaAccordion 
                  tree={samplePipelineData.vimshottariTree} 
                  title="विम्शोत्तरी दशा" 
                  lang={samplePipelineData.lang}
                />

                {/* Yogini Dasha */}
                <DashaAccordion 
                  tree={samplePipelineData.yoginiTree} 
                  title="योगिनी दशा" 
                  lang={samplePipelineData.lang}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
