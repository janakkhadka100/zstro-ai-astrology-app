"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Star, MapPin, RefreshCw } from "lucide-react";

interface TransitPlanet {
  planet: string;
  sign: string;
  degree: number;
  speed: number;
  houseWS: number;
  aspects: any[];
  isPeriodRuler?: boolean;
  isBenefic?: boolean;
}

interface ActiveContextStack {
  date: string;
  age: {
    years: number;
    months: number;
    days: number;
  };
  dashaChain: {
    maha: string;
    antar: string;
    pratyantar: string;
    sookshma: string;
    pran: string;
  };
  transits: TransitPlanet[];
  periodRulers: string[];
  metadata: {
    userId: string;
    location: string;
    timezone: string;
    calculationTime: string;
  };
}

export default function TransitsCard() {
  const [data, setData] = useState<ActiveContextStack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTransitData = async (date?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = date ? `/api/transits?date=${date}` : '/api/transits/today';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch transit data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching transit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitData();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchTransitData(newDate);
  };

  const handleRefresh = () => {
    fetchTransitData(selectedDate);
  };

  if (loading) {
    return (
      <div id="card-transits" className="rounded-2xl p-4 bg-slate-100 animate-pulse h-32">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="card-transits" className="rounded-2xl p-4 bg-red-50 border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-red-800">Today's Transits</h3>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-red-600" />
          </button>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div id="card-transits" className="rounded-2xl p-4 bg-gray-50">
        <p className="text-sm text-gray-600">No transit data available</p>
      </div>
    );
  }

  const { age, date, transits, dashaChain, periodRulers, metadata } = data;

  return (
    <div id="card-transits" className="rounded-2xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Today's Transits
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Date and Age Info */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Age {age.years}y {age.months}m</span>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-center space-x-1 mb-3 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        <span>{metadata.location} • {metadata.timezone}</span>
      </div>

      {/* Dasha Chain */}
      <div className="mb-3 p-2 bg-white/50 rounded-lg">
        <div className="text-xs font-medium text-gray-700 mb-1">Current Dasha</div>
        <div className="text-xs text-gray-600">
          {dashaChain.maha} → {dashaChain.antar} → {dashaChain.pratyantar}
        </div>
      </div>

      {/* Transit List */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700">Key Transits</div>
        <ul className="space-y-1">
          {transits.slice(0, 8).map((transit, i) => (
            <li key={i} className="text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">{transit.planet}</span>
                  <span className="text-gray-600">in</span>
                  <span className="font-medium text-gray-800">{transit.sign}</span>
                  <span className="text-gray-500">(WS {transit.houseWS})</span>
                </div>
                <div className="flex items-center space-x-1">
                  {transit.isPeriodRuler && (
                    <Star className="w-3 h-3 text-yellow-500" title="Period Ruler" />
                  )}
                  {transit.isBenefic && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" title="Benefic" />
                  )}
                </div>
              </div>
              {transit.aspects?.length > 0 && (
                <div className="text-xs text-gray-500 ml-2">
                  hits: {transit.aspects.map((aspect: any) => 
                    `${aspect.natalPlanet} (${aspect.aspect})`
                  ).join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Period Rulers */}
      {periodRulers.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
          <div className="text-xs font-medium text-yellow-800 mb-1">Period Rulers</div>
          <div className="text-xs text-yellow-700">
            {periodRulers.join(", ")} - These planets have enhanced influence
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="mt-3 pt-2 border-t border-blue-200">
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-600">Check another date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="text-xs px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}