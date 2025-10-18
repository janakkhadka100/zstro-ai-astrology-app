"use client";
import { useEffect, useState } from "react";
import type { AstroData, AstroAnalysisResponse } from "@/lib/astrology/types";
import { AstroCardSkeleton, Skeleton } from "@/components/shared/Skeleton";
import { ErrorNotice, LoadingWithError } from "@/components/shared/ErrorNotice";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { DownloadButtons } from "@/components/export/DownloadButtons";
import { getString, type Lang } from "@/lib/utils/i18n";
import { isFeatureEnabled } from "@/lib/config/features";

interface AstroCardsProps {
  lang?: Lang;
  className?: string;
  showThemeToggle?: boolean;
}

export default function AstroCards({ 
  lang = "ne", 
  className = "", 
  showThemeToggle = true 
}: AstroCardsProps) {
  const [data, setData] = useState<AstroData | null>(null);
  const [analysis, setAnalysis] = useState<AstroAnalysisResponse | null>(null);
  const [debug, setDebug] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>(
    lang === "ne" 
      ? "मेरो कुण्डलीको मुख्य योग/दोष र दशा प्रभाव?" 
      : "What are the main yogas/doshas and dasha effects in my horoscope?"
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/astrology/data", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching astro data:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : getString("dataLoadFailed", lang)
      );
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!data) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/astrology", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, question: q }) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      setAnalysis(json);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : getString("dataLoadFailed", lang)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [lang]);

  // Show skeleton while loading initial data
  if (loading && !data) {
    return (
      <div className={`space-y-6 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-8 w-64" />
          {showThemeToggle && <ThemeToggle lang={lang} variant="icon" />}
        </div>
        <AstroCardSkeleton />
        <AstroCardSkeleton />
        <AstroCardSkeleton />
      </div>
    );
  }

  // Show error if failed to load data
  if (error && !data) {
    return (
      <div className={`p-4 ${className}`}>
        <ErrorNotice
          error={error}
          lang={lang}
          onRetry={fetchData}
        />
      </div>
    );
  }

  // Show error if no data
  if (!data) {
    return (
      <div className={`p-4 ${className}`}>
        <ErrorNotice
          error={getString("dataLoadFailed", lang)}
          lang={lang}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {lang === "ne" ? "ज्योतिष कार्डहरू (स्रोत सत्य)" : "Astro Cards (Source-of-Truth)"}
        </h2>
        <div className="flex items-center gap-3">
          {showThemeToggle && <ThemeToggle lang={lang} variant="icon" />}
          <label className="text-sm flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={debug} 
              onChange={e => setDebug(e.target.checked)} 
              className="rounded"
            />
            {lang === "ne" ? "डिबग JSON" : "Debug JSON"}
          </label>
        </div>
      </div>

      {/* Error display for analysis */}
      {error && (
        <ErrorNotice
          error={error}
          lang={lang}
          onRetry={askQuestion}
        />
      )}

      {/* D1 Planets */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "ग्रहहरू – D1" : "Planets – D1"}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.d1.map((planet) => (
            <div 
              key={`${planet.planet}-${planet.signId}-${planet.house}`} 
              className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            >
              <div className="font-medium text-lg text-gray-900 dark:text-gray-100">
                {planet.planet} {planet.retro && (
                  <span className="text-orange-500 text-sm">(R)</span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "राशि" : "Sign"}: {planet.signLabel} (#{planet.signId})
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {lang === "ne" ? "घर" : "House"}: H{planet.house}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yogas / Doshas */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-lg text-gray-900 dark:text-gray-100">
              {lang === "ne" ? "योगहरू" : "Yogas"}
            </h3>
            <ul className="space-y-2">
              {data.yogas.length > 0 ? (
                data.yogas.map(yoga => (
                  <li key={yoga.key} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{yoga.label}</div>
                      {yoga.factors && yoga.factors.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === "ne" ? "कारक" : "Factors"}: {yoga.factors.join(", ")}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 dark:text-gray-400">-</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-lg text-gray-900 dark:text-gray-100">
              {lang === "ne" ? "दोषहरू" : "Doshas"}
            </h3>
            <ul className="space-y-2">
              {data.doshas.length > 0 ? (
                data.doshas.map(dosha => (
                  <li key={dosha.key} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{dosha.label}</div>
                      {dosha.factors && dosha.factors.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === "ne" ? "कारक" : "Factors"}: {dosha.factors.join(", ")}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 dark:text-gray-400">-</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Shadbala */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "षड्बल (सारांश)" : "Shadbala (Summary)"}
        </h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.shadbala.length > 0 ? (
            data.shadbala.map(shadbala => (
              <div key={shadbala.planet} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <div className="font-medium text-gray-900 dark:text-gray-100">{shadbala.planet}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {lang === "ne" ? "मान" : "Value"}: {shadbala.value}{shadbala.unit ? " " + shadbala.unit : ""}
                </div>
                {shadbala.components && shadbala.components.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {shadbala.components.map(c => `${c.name}: ${c.value}`).join(", ")}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400">-</div>
          )}
        </div>
      </div>

      {/* Divisionals */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "विभाजन चार्टहरू" : "Divisional Charts"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.divisionals.length > 0 ? (
            data.divisionals.map(divisional => (
              <span 
                key={divisional.type} 
                className="px-3 py-1 rounded-full border bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-sm font-medium"
              >
                {divisional.type}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">-</span>
          )}
        </div>
      </div>

      {/* Dashas */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "दशा" : "Dashas"}
        </h3>
        <div className="space-y-3">
          {data.dashas.length > 0 ? (
            data.dashas.map((dasha, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {dasha.system} - {dasha.level} - {dasha.planet}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(dasha.from).toLocaleDateString()} - {new Date(dasha.to).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400">-</div>
          )}
        </div>
      </div>

      {/* Question & Analysis */}
      <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          {lang === "ne" ? "प्रश्न र विश्लेषण" : "Question & Analysis"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {lang === "ne" ? "तपाईंको प्रश्न" : "Your Question"}
            </label>
            <textarea 
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" 
              rows={3} 
              value={q} 
              onChange={e => setQ(e.target.value)}
              placeholder={lang === "ne" ? "तपाईंको ज्योतिष प्रश्न यहाँ लेख्नुहोस्..." : "Enter your astrology question here..."}
            />
          </div>
          <button 
            className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={askQuestion}
            disabled={loading}
          >
            {loading 
              ? (lang === "ne" ? "विश्लेषण हुँदै..." : "Analyzing...") 
              : (lang === "ne" ? "विश्लेषण गर्नुहोस् (LLM)" : "Analyze (LLM)")
            }
          </button>
          
          {/* Loading state for analysis */}
          {loading && (
            <div className="mt-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Skeleton variant="circle" className="size-4" />
                  <Skeleton variant="text" className="h-4 w-3/4" />
                </div>
                <div className="mt-2 space-y-1">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-4 w-5/6" />
                  <Skeleton variant="text" className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          )}
          
          {analysis && !loading && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                {lang === "ne" ? "विश्लेषण परिणाम" : "Analysis Result"}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                  {analysis.text || analysis.answer || analysis.analysis || "No analysis available"}
                </pre>
              </div>
              
              {/* Export buttons */}
              {isFeatureEnabled('export') && data && (
                <div className="mt-4">
                  <DownloadButtons
                    lang={lang}
                    analysis={analysis.text || analysis.answer || analysis.analysis || ""}
                    cards={data}
                    title={lang === "ne" ? "ज्योतिष विश्लेषण" : "Astrology Analysis"}
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debug JSON */}
      {debug && (
        <div className="rounded-2xl shadow-lg p-6 bg-gray-100 dark:bg-gray-900 border dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
            {lang === "ne" ? "डिबग जानकारी" : "Debug Information"}
          </h3>
          <pre className="text-xs overflow-auto max-h-96 border rounded p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
