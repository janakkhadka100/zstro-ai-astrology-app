"use client";

import { useEffect, useState } from "react";
import { Star, Home, Calendar, Clock } from "lucide-react";

interface PlanetResult {
  planet: string;
  rashi_name: string;
  rashi_num: number;
  house_num: number;
  house_name: string;
  note: string;
}

interface HouseCalculationData {
  ascendant: {
    name: string;
    num: number;
    label: string;
  };
  results: PlanetResult[];
  dasha_context?: {
    mahadasha?: string;
    antardasha?: string;
    time_note?: string;
  };
  summary: string;
}

interface HouseCalculationCardProps {
  ascendant: string | number;
  planets: Record<string, string | number>;
  dasha?: { mahadasha?: string; antardasha?: string };
  locale?: "ne-NP" | "en";
  className?: string;
}

export default function HouseCalculationCard({ 
  ascendant, 
  planets, 
  dasha, 
  locale = "ne-NP",
  className = "" 
}: HouseCalculationCardProps) {
  const [data, setData] = useState<HouseCalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHouseCalculation();
  }, [ascendant, planets, dasha, locale]);

  const fetchHouseCalculation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/astrology/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ascendant,
          planets,
          dasha,
          locale
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "House calculation failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("House calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-yellow-600 bg-yellow-100',
      'Moon': 'text-blue-600 bg-blue-100',
      'Mars': 'text-red-600 bg-red-100',
      'Mercury': 'text-green-600 bg-green-100',
      'Jupiter': 'text-purple-600 bg-purple-100',
      'Venus': 'text-pink-600 bg-pink-100',
      'Saturn': 'text-gray-600 bg-gray-100',
      'Rahu': 'text-orange-600 bg-orange-100',
      'Ketu': 'text-indigo-600 bg-indigo-100'
    };
    return colors[planet] || 'text-gray-600 bg-gray-100';
  };

  const getHouseColor = (houseNum: number) => {
    const colors = [
      'bg-red-50 border-red-200',      // 1st house
      'bg-orange-50 border-orange-200', // 2nd house
      'bg-yellow-50 border-yellow-200', // 3rd house
      'bg-green-50 border-green-200',   // 4th house
      'bg-blue-50 border-blue-200',     // 5th house
      'bg-indigo-50 border-indigo-200', // 6th house
      'bg-purple-50 border-purple-200', // 7th house
      'bg-pink-50 border-pink-200',     // 8th house
      'bg-rose-50 border-rose-200',     // 9th house
      'bg-slate-50 border-slate-200',   // 10th house
      'bg-gray-50 border-gray-200',     // 11th house
      'bg-zinc-50 border-zinc-200'      // 12th house
    ];
    return colors[houseNum - 1] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50 animate-pulse ${className}`}>
        <div className="h-4 bg-indigo-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-indigo-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-2xl p-4 bg-red-50 border border-red-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">{error || "Data not available"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm border border-indigo-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Home className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-indigo-800">
          {locale === 'ne-NP' ? 'भाव गणना' : 'House Calculation'}
        </h3>
      </div>

      {/* Ascendant Info */}
      <div className="mb-4 p-3 bg-white/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">
            {data.ascendant.label}: {data.ascendant.name}
          </span>
        </div>
      </div>

      {/* Dasha Context */}
      {data.dasha_context && (data.dasha_context.mahadasha || data.dasha_context.antardasha) && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {locale === 'ne-NP' ? 'दशा संदर्भ' : 'Dasha Context'}
            </span>
          </div>
          <div className="text-xs text-yellow-700">
            {data.dasha_context.mahadasha && (
              <div>{locale === 'ne-NP' ? 'महादशा' : 'Mahadasha'}: {data.dasha_context.mahadasha}</div>
            )}
            {data.dasha_context.antardasha && (
              <div>{locale === 'ne-NP' ? 'अन्तरदशा' : 'Antardasha'}: {data.dasha_context.antardasha}</div>
            )}
            {data.dasha_context.time_note && (
              <div className="mt-1 italic">{data.dasha_context.time_note}</div>
            )}
          </div>
        </div>
      )}

      {/* Planet Results */}
      <div className="space-y-3 mb-4">
        {data.results.map((result, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg border ${getHouseColor(result.house_num)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(result.planet)}`}>
                  {result.planet}
                </span>
                <span className="text-sm text-gray-600">→</span>
                <span className="text-sm font-medium text-gray-800">
                  {result.rashi_name}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {locale === 'ne-NP' ? 'भाव' : 'House'} {result.house_num}
              </div>
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {result.house_name}
            </div>
            {result.note && (
              <div className="text-xs text-gray-700 italic">
                {result.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="p-3 bg-white/50 rounded-lg">
          <div className="text-sm font-medium text-indigo-800 mb-1">
            {locale === 'ne-NP' ? 'सारांश' : 'Summary'}
          </div>
          <div className="text-xs text-gray-700">
            {data.summary}
          </div>
        </div>
      )}
    </div>
  );
}
