'use client';

import { Suspense, useState, useEffect } from 'react';
import ResultSummaryCard from '@/components/astro/ResultSummaryCard';
import PDFButtonCard from '@/components/astro/PDFButtonCard';
import PlanetTableCard from '@/components/astro/PlanetTableCard';
import YogDoshGrid from '@/components/astro/YogDoshGrid';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartView } from '@/components/astro/ChartView';
import { Skeleton } from '@/components/ui/skeleton';
import { getPlanetRows } from '@/lib/astrology/pipeline';
import { fetchUserProfile, fetchKundali } from '@/lib/api/fetchers';
import { useTranslations } from '@/lib/i18n/context';
import { type KundaliData } from '@/lib/astro/derive';

// Loading skeleton component
function KundaliSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-16 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorBlock({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Kundali
            </h2>
            <p className="text-red-600 dark:text-red-300">{msg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              No Data Available
            </h2>
            <p className="text-yellow-600 dark:text-yellow-300">{msg}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kundali summary component
function KundaliSummary({ asc, moon }: { asc: any; moon: any }) {
  const { t } = useTranslations();
  
  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {t('kundaliSummary')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('ascendant')}
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {asc?.name || 'Data Missing'}
          </p>
          {!asc?.name && <span className="text-xs text-red-500">data-missing</span>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('moonSign')}
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {moon?.sign || 'Data Missing'}
          </p>
          {!moon?.sign && <span className="text-xs text-red-500">data-missing</span>}
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Data Source: Prokerala ✅
      </div>
    </div>
  );
}

// Kundali chart component
function KundaliChart({ asc, planets }: { asc: any; planets: any[] }) {
  const { t } = useTranslations();
  
  // Convert to the format expected by ChartView
  const chartData = {
    ascSignId: asc?.num || 1,
    ascSignLabel: asc?.name || 'Aries',
    planets: planets.map(p => ({
      planet: p.planet,
      signId: p.num,
      signLabel: p.sign,
      degree: p.degree || 0,
      safeHouse: p.house
    })),
    lang: 'ne' as const
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t('kundaliChart')}
      </h2>
      <div id="kundali-chart" className="min-h-[400px]">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ChartView data={chartData} />
        </Suspense>
      </div>
    </div>
  );
}

// Dasha block component
function DashaBlock({ dasha }: { dasha: any }) {
  const { t } = useTranslations();
  
  if (!dasha) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t('currentDasha')}
      </h2>
      <div className="space-y-2">
        <p><strong>System:</strong> {dasha.system}</p>
        <p><strong>Maha:</strong> {dasha.maha}</p>
        {dasha.antara && <p><strong>Antara:</strong> {dasha.antara}</p>}
        {dasha.pratyantara && <p><strong>Pratyantara:</strong> {dasha.pratyantara}</p>}
      </div>
    </div>
  );
}

export default function KundaliPage() {
  const { language } = useTranslations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [profile, setProfile] = useState<any>(null);
  const [astro, setAstro] = useState<KundaliData | null>(null);

  useEffect(() => {
    let alive = true;
    
    (async () => {
      setLoading(true);
      setError(undefined);
      
      try {
        const p = await fetchUserProfile();
        if (!alive) return;
        setProfile(p);
        
        const a = await fetchKundali(p.birth, language);
        if (!alive) return;
        setAstro(a);
        
        // Log validation
        console.info(`[ZSTRO] Kundali asc=${a.ascendant.num} moon=${a.moon.num} planets=${a.planets.length}`);
        
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "load-failed");
        console.error("[ZSTRO] Kundali load failed:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    
    return () => { alive = false; };
  }, [language]); // re-fetch on language change

  if (loading) return <KundaliSkeleton />;
  if (error) return <ErrorBlock msg={error} />;
  if (!astro) return <EmptyState msg="No astro data" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            जन्मकुण्डली / Kundali
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete astrological analysis and predictions
          </p>
        </div>

        {/* Kundali Summary */}
        <KundaliSummary asc={astro.ascendant} moon={astro.moon} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Profile Info
              </h3>
              <p><strong>Name:</strong> {profile?.name}</p>
              <p><strong>Language:</strong> {profile?.language}</p>
              <p><strong>Birth Date:</strong> {profile?.birth?.date}</p>
              <p><strong>Birth Time:</strong> {profile?.birth?.time}</p>
              <p><strong>Location:</strong> {profile?.birth?.location?.place}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              {/* Chart View */}
              <KundaliChart asc={astro.ascendant} planets={astro.planets} />

              {/* Planet Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Planet Positions
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="border px-2 py-1">Planet</th>
                        <th className="border px-2 py-1">Sign</th>
                        <th className="border px-2 py-1">House</th>
                        <th className="border px-2 py-1">Degree</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astro.planets.map((planet, idx) => (
                        <tr key={idx} className="odd:bg-gray-50 dark:odd:bg-gray-700">
                          <td className="border px-2 py-1">{planet.planet}</td>
                          <td className="border px-2 py-1">
                            {planet.sign}
                            {planet._note && <span className="text-yellow-500 ml-1">⚠️</span>}
                          </td>
                          <td className="border px-2 py-1">{planet.house}</td>
                          <td className="border px-2 py-1">{planet.degree?.toFixed(2) || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dasha Block */}
              <DashaBlock dasha={astro.currentDasha} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}