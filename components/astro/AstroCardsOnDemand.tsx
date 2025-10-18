"use client";
import { useEffect, useState } from "react";
import type { AstroData, Lang } from "@/lib/astrology/types";
import { getDataCoverage } from "@/lib/cards/compose";

interface AstroCardsOnDemandProps {
  lang?: Lang;
  className?: string;
  showDebug?: boolean;
  onCardsUpdate?: (cards: AstroData) => void;
}

export default function AstroCardsOnDemand({ 
  lang = "ne", 
  className = "",
  showDebug = false,
  onCardsUpdate
}: AstroCardsOnDemandProps) {
  const [cards, setCards] = useState<AstroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  // Bootstrap cards from account
  const bootstrapCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/astro/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCards(result.data);
        onCardsUpdate?.(result.data);
        console.log('Cards bootstrapped successfully');
      } else {
        setError(result.errors?.[0] || 'Failed to load cards');
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Fetch additional data
  const fetchAdditionalData = async (plans: any[]) => {
    if (!cards?.profile) return;
    
    try {
      setFetching(true);
      
      const response = await fetch('/api/astro/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: cards.profile,
          plan: plans,
          lang
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.patch) {
        // Merge patch with existing cards
        const updatedCards = {
          ...cards,
          ...result.patch.set,
          provenance: {
            account: cards.provenance?.account || [],
            prokerala: [...(cards.provenance?.prokerala || []), ...(result.patch.provenance?.prokerala || [])]
          }
        };
        
        setCards(updatedCards);
        onCardsUpdate?.(updatedCards);
        console.log('Additional data fetched and merged');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    bootstrapCards();
  }, [lang]);

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            {lang === 'ne' ? 'कार्डहरू लोड हुँदै...' : 'Loading cards...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">
            {lang === 'ne' ? 'त्रुटि' : 'Error'}
          </h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button
            onClick={bootstrapCards}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            {lang === 'ne' ? 'पुन: प्रयास गर्नुहोस्' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!cards) return null;

  const coverage = getDataCoverage(cards);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {lang === 'ne' ? 'ज्योतिष कार्डहरू' : 'Astrology Cards'}
        </h2>
        <div className="flex items-center gap-2">
          {fetching && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full size-4 border-b-2 border-blue-600"></div>
              {lang === 'ne' ? 'डेटा तान्दै...' : 'Fetching data...'}
            </div>
          )}
          {showDebug && (
            <span className="text-xs text-gray-500">
              {cards.d1.length + cards.divisionals.length + cards.yogas.length + cards.doshas.length + cards.shadbala.length + cards.dashas.length} {lang === 'ne' ? 'आइटमहरू' : 'items'}
            </span>
          )}
        </div>
      </div>

      {/* Profile */}
      {cards.profile && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'प्रोफाइल' : 'Profile'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {cards.profile.name && (
              <div>
                <span className="text-gray-600">
                  {lang === 'ne' ? 'नाम' : 'Name'}:
                </span>
                <div className="font-medium">{cards.profile.name}</div>
              </div>
            )}
            {cards.profile.birthDate && (
              <div>
                <span className="text-gray-600">
                  {lang === 'ne' ? 'जन्म मिति' : 'Birth Date'}:
                </span>
                <div className="font-medium">{cards.profile.birthDate}</div>
              </div>
            )}
            {cards.profile.birthTime && (
              <div>
                <span className="text-gray-600">
                  {lang === 'ne' ? 'जन्म समय' : 'Birth Time'}:
                </span>
                <div className="font-medium">{cards.profile.birthTime}</div>
              </div>
            )}
            {cards.profile.tz && (
              <div>
                <span className="text-gray-600">
                  {lang === 'ne' ? 'समय क्षेत्र' : 'Timezone'}:
                </span>
                <div className="font-medium">{cards.profile.tz}</div>
              </div>
            )}
            {cards.profile.lat && cards.profile.lon && (
              <div>
                <span className="text-gray-600">
                  {lang === 'ne' ? 'स्थान' : 'Location'}:
                </span>
                <div className="font-medium">{cards.profile.lat}, {cards.profile.lon}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ascendant */}
      <div className="rounded-2xl shadow-lg p-6 bg-white">
        <h3 className="font-semibold mb-4 text-lg">
          {lang === 'ne' ? 'लग्न' : 'Ascendant'}
        </h3>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {cards.ascSignLabel} ({cards.ascSignId})
          </div>
        </div>
      </div>

      {/* D1 Planets */}
      {cards.d1.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'ग्रहहरू (D1)' : 'Planets (D1)'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cards.d1.map((planet, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium flex items-center gap-2">
                  {planet.planet}
                  {planet.retro && <span className="text-xs text-orange-600">(R)</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {planet.signLabel} (H{planet.house})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yogas and Doshas */}
      {(cards.yogas.length > 0 || cards.doshas.length > 0) && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'योग र दोष' : 'Yogas and Doshas'}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-green-700">
                {lang === 'ne' ? 'योगहरू' : 'Yogas'}
              </h4>
              <ul className="space-y-1">
                {cards.yogas.map((yoga, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="size-2 bg-green-500 rounded-full"></span>
                    {yoga.label}
                  </li>
                ))}
                {cards.yogas.length === 0 && (
                  <li className="text-sm text-gray-500">
                    {lang === 'ne' ? 'कुनै योग छैन' : 'No yogas found'}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-700">
                {lang === 'ne' ? 'दोषहरू' : 'Doshas'}
              </h4>
              <ul className="space-y-1">
                {cards.doshas.map((dosha, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="size-2 bg-red-500 rounded-full"></span>
                    {dosha.label}
                  </li>
                ))}
                {cards.doshas.length === 0 && (
                  <li className="text-sm text-gray-500">
                    {lang === 'ne' ? 'कुनै दोष छैन' : 'No doshas found'}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Shadbala */}
      {cards.shadbala.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'षड्बल' : 'Shadbala'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.shadbala.map((shadbala, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium">{shadbala.planet}</div>
                <div className="text-sm text-gray-600">
                  {shadbala.value} {shadbala.unit || 'rupa'}
                </div>
                {shadbala.components && (
                  <div className="text-xs text-gray-500 mt-1">
                    {shadbala.components.map(c => c.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashas */}
      {cards.dashas.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'दशाहरू' : 'Dashas'}
          </h3>
          <div className="space-y-3">
            {cards.dashas.map((dasha, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {dasha.system} - {dasha.level}
                  </div>
                  <div className="text-sm text-gray-600">
                    {dasha.planet}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(dasha.from).toLocaleDateString()} - {new Date(dasha.to).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divisionals */}
      {cards.divisionals.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'विभाजन चार्टहरू' : 'Divisional Charts'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cards.divisionals.map((divisional, index) => (
              <div key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {divisional.type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Coverage Status */}
      <div className="rounded-2xl shadow-lg p-6 bg-gray-50">
        <h3 className="font-semibold mb-4 text-lg">
          {lang === 'ne' ? 'डेटा कवरेज' : 'Data Coverage'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${coverage.d1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>D1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${coverage.divisionals.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Divisionals ({coverage.divisionals.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${coverage.yogas ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Yogas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${coverage.shadbala ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Shadbala</span>
          </div>
        </div>
      </div>

      {/* Debug JSON */}
      {showDebug && (
        <div className="rounded-2xl shadow-lg p-6 bg-gray-100">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'डिबग जानकारी' : 'Debug Information'}
          </h3>
          <pre className="text-xs overflow-auto max-h-96 border rounded p-3 bg-white">
            {JSON.stringify(cards, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
