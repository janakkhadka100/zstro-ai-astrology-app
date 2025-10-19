"use client";

import { ResultSummaryCard } from './ResultSummaryCard';
import { ProfileCard } from './ProfileCard';
import { PDFButtonCard } from './PDFButtonCard';
import { PlanetTableCard } from './PlanetTableCard';
import { ShadbalaTableCard } from './ShadbalaTableCard';
import { DashaAccordion } from './DashaAccordion';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Empty data test
const emptyData = {
  ascSignId: 1,
  ascSignLabel: "Aries",
  planets: [],
  vimshottariTree: [],
  yoginiTree: [],
  lang: "ne" as const,
  mismatches: [],
  dashaFixes: []
};

export default function EmptyDataTest() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Empty Data Test - No Blanks
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard data={emptyData} />
            <PDFButtonCard data={emptyData} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              {/* Result Summary */}
              <ResultSummaryCard 
                asc="Unknown"
                moon="Unknown"
                loading={false}
              />

              {/* Planet Table */}
              <PlanetTableCard rows={emptyData.planets} />

              {/* Shadbala Table */}
              <ShadbalaTableCard rows={emptyData.planets} />

              {/* Vimshottari Dasha */}
              <DashaAccordion 
                tree={emptyData.vimshottariTree} 
                title="विम्शोत्तरी दशा" 
                lang={emptyData.lang}
              />

              {/* Yogini Dasha */}
              <DashaAccordion 
                tree={emptyData.yoginiTree} 
                title="योगिनी दशा" 
                lang={emptyData.lang}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
