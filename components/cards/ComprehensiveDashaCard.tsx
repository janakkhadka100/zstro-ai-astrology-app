"use client";

import { useEffect, useState } from "react";
import { Star, Clock, Calendar, MapPin, ChevronDown, ChevronRight } from "lucide-react";

interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  years: number;
}

interface DashaStack {
  maha?: string;
  antara?: string;
  pratyantara?: string;
  sookshma?: string;
  prana?: string;
}

interface NakshatraData {
  index: number;
  name: string;
  pada: number;
  fraction_used: number;
  fraction_remaining: number;
}

interface DashaData {
  nakshatra: NakshatraData;
  vimshottari: {
    maha: DashaPeriod[];
    active_stack: DashaStack;
  };
  yogini: {
    maha: DashaPeriod[];
    active_stack: DashaStack;
  };
  active: {
    timestamp: string;
    vimshottari: DashaStack;
    yogini: DashaStack;
  };
  notes: {
    start_rule?: string;
    validation: {
      vim_total_years: number;
      yog_total_years: number;
      partition_ok: boolean;
    };
  };
  locale: string;
}

interface ComprehensiveDashaCardProps {
  birthData: {
    date: string;
    time: string;
    tz_offset: string;
    location: { lat: number; lon: number };
    ayanamsa: string;
  };
  moonLongitudeDeg: number;
  locale?: "ne-NP" | "en";
  className?: string;
}

export default function ComprehensiveDashaCard({ 
  birthData, 
  moonLongitudeDeg, 
  locale = "ne-NP",
  className = "" 
}: ComprehensiveDashaCardProps) {
  const [data, setData] = useState<DashaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['nakshatra', 'active']));

  useEffect(() => {
    fetchDashaData();
  }, [birthData, moonLongitudeDeg, locale]);

  const fetchDashaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/astrology/dasha-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth: birthData,
          moon_longitude_deg: moonLongitudeDeg,
          locale
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Dasha calculation failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Dasha calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (years: number) => {
    const totalDays = years * 365.2425;
    const yearsPart = Math.floor(years);
    const daysPart = Math.floor((years - yearsPart) * 365.2425);
    const monthsPart = Math.floor(daysPart / 30.44);
    const remainingDays = Math.floor(daysPart % 30.44);
    
    if (locale === 'ne-NP') {
      return `${yearsPart} वर्ष ${monthsPart} महिना ${remainingDays} दिन`;
    }
    return `${yearsPart}y ${monthsPart}m ${remainingDays}d`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    if (locale === 'ne-NP') {
      return date.toLocaleDateString('ne-NP');
    }
    return date.toLocaleDateString('en-US');
  };

  const getPlanetColor = (lord: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-yellow-600 bg-yellow-100',
      'Moon': 'text-blue-600 bg-blue-100',
      'Mars': 'text-red-600 bg-red-100',
      'Mercury': 'text-green-600 bg-green-100',
      'Jupiter': 'text-purple-600 bg-purple-100',
      'Venus': 'text-pink-600 bg-pink-100',
      'Saturn': 'text-gray-600 bg-gray-100',
      'Rahu': 'text-orange-600 bg-orange-100',
      'Ketu': 'text-indigo-600 bg-indigo-100',
      'Mangala': 'text-red-600 bg-red-100',
      'Pingala': 'text-orange-600 bg-orange-100',
      'Dhanya': 'text-yellow-600 bg-yellow-100',
      'Bhramari': 'text-green-600 bg-green-100',
      'Bhadrika': 'text-blue-600 bg-blue-100',
      'Ulka': 'text-purple-600 bg-purple-100',
      'Siddha': 'text-pink-600 bg-pink-100',
      'Sankata': 'text-gray-600 bg-gray-100'
    };
    return colors[lord] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50 animate-pulse ${className}`}>
        <div className="h-4 bg-purple-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-purple-200 rounded"></div>
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
    <div className={`rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm border border-purple-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          {locale === 'ne-NP' ? 'व्यापक दशा गणना' : 'Comprehensive Dasha Calculation'}
        </h3>
      </div>

      {/* Nakshatra Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('nakshatra')}
          className="flex items-center justify-between w-full p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              {locale === 'ne-NP' ? 'जन्म नक्षत्र' : 'Birth Nakshatra'}
            </span>
          </div>
          {expandedSections.has('nakshatra') ? 
            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
            <ChevronRight className="w-4 h-4 text-purple-600" />
          }
        </button>
        
        {expandedSections.has('nakshatra') && (
          <div className="mt-2 p-3 bg-white/30 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">{locale === 'ne-NP' ? 'नक्षत्र' : 'Nakshatra'}:</span>
                <span className="font-medium ml-2">{data.nakshatra.name}</span>
              </div>
              <div>
                <span className="text-gray-600">{locale === 'ne-NP' ? 'पद' : 'Pada'}:</span>
                <span className="font-medium ml-2">{data.nakshatra.pada}</span>
              </div>
              <div>
                <span className="text-gray-600">{locale === 'ne-NP' ? 'शेष अंश' : 'Remaining'}:</span>
                <span className="font-medium ml-2">{(data.nakshatra.fraction_remaining * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-gray-600">{locale === 'ne-NP' ? 'प्रयुक्त अंश' : 'Used'}:</span>
                <span className="font-medium ml-2">{(data.nakshatra.fraction_used * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Stack Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('active')}
          className="flex items-center justify-between w-full p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              {locale === 'ne-NP' ? 'सक्रिय दशा' : 'Active Dasha'}
            </span>
          </div>
          {expandedSections.has('active') ? 
            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
            <ChevronRight className="w-4 h-4 text-purple-600" />
          }
        </button>
        
        {expandedSections.has('active') && (
          <div className="mt-2 space-y-3">
            {/* Vimshottari Active Stack */}
            <div className="p-3 bg-white/30 rounded-lg">
              <div className="text-sm font-medium text-purple-800 mb-2">
                {locale === 'ne-NP' ? 'विम्शोत्तरी' : 'Vimshottari'}
              </div>
              <div className="space-y-1">
                {data.active.vimshottari.maha && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{locale === 'ne-NP' ? 'महा' : 'Maha'}:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(data.active.vimshottari.maha)}`}>
                      {data.active.vimshottari.maha}
                    </span>
                  </div>
                )}
                {data.active.vimshottari.antara && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{locale === 'ne-NP' ? 'अन्तर' : 'Antar'}:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(data.active.vimshottari.antara)}`}>
                      {data.active.vimshottari.antara}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Yogini Active Stack */}
            <div className="p-3 bg-white/30 rounded-lg">
              <div className="text-sm font-medium text-purple-800 mb-2">
                {locale === 'ne-NP' ? 'योगिनी' : 'Yogini'}
              </div>
              <div className="space-y-1">
                {data.active.yogini.maha && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{locale === 'ne-NP' ? 'महा' : 'Maha'}:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(data.active.yogini.maha)}`}>
                      {data.active.yogini.maha}
                    </span>
                  </div>
                )}
                {data.active.yogini.antara && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{locale === 'ne-NP' ? 'अन्तर' : 'Antar'}:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanetColor(data.active.yogini.antara)}`}>
                      {data.active.yogini.antara}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vimshottari Maha Periods */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('vimshottari')}
          className="flex items-center justify-between w-full p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              {locale === 'ne-NP' ? 'विम्शोत्तरी महादशा' : 'Vimshottari Mahadasha'}
            </span>
          </div>
          {expandedSections.has('vimshottari') ? 
            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
            <ChevronRight className="w-4 h-4 text-purple-600" />
          }
        </button>
        
        {expandedSections.has('vimshottari') && (
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
            {data.vimshottari.maha.slice(0, 10).map((period, index) => (
              <div key={index} className="p-2 bg-white/30 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded font-medium ${getPlanetColor(period.lord)}`}>
                    {period.lord}
                  </span>
                  <span className="text-gray-600">{formatDuration(period.years)}</span>
                </div>
                <div className="text-gray-500">
                  {formatDate(period.start)} - {formatDate(period.end)}
                </div>
              </div>
            ))}
            {data.vimshottari.maha.length > 10 && (
              <div className="text-xs text-gray-500 text-center">
                {locale === 'ne-NP' ? 'र अरू...' : 'and more...'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Yogini Maha Periods */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('yogini')}
          className="flex items-center justify-between w-full p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              {locale === 'ne-NP' ? 'योगिनी महादशा' : 'Yogini Mahadasha'}
            </span>
          </div>
          {expandedSections.has('yogini') ? 
            <ChevronDown className="w-4 h-4 text-purple-600" /> : 
            <ChevronRight className="w-4 h-4 text-purple-600" />
          }
        </button>
        
        {expandedSections.has('yogini') && (
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
            {data.yogini.maha.slice(0, 8).map((period, index) => (
              <div key={index} className="p-2 bg-white/30 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded font-medium ${getPlanetColor(period.lord)}`}>
                    {period.lord}
                  </span>
                  <span className="text-gray-600">{formatDuration(period.years)}</span>
                </div>
                <div className="text-gray-500">
                  {formatDate(period.start)} - {formatDate(period.end)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Info */}
      <div className="p-3 bg-white/30 rounded-lg">
        <div className="text-xs text-gray-600">
          {locale === 'ne-NP' ? 'प्रमाणीकरण' : 'Validation'}: 
          Vimshottari: {data.notes.validation.vim_total_years.toFixed(2)} वर्ष, 
          Yogini: {data.notes.validation.yog_total_years.toFixed(2)} वर्ष
          {data.notes.validation.partition_ok ? ' ✅' : ' ❌'}
        </div>
      </div>
    </div>
  );
}
