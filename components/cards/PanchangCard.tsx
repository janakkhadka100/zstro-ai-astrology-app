"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Sun, Moon, Star } from "lucide-react";

interface PanchangData {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
  rashi: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  abhijitMuhurat: string;
  brahmaMuhurat: string;
  rahuKaal: string;
  gulikaKaal: string;
  yamaganda: string;
  var: string; // Day of week
  masam: string; // Month
  samvatsar: string; // Year
}

interface PanchangCardProps {
  className?: string;
}

export default function PanchangCard({ className = "" }: PanchangCardProps) {
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPanchangData();
  }, []);

  const fetchPanchangData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/panchang');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "पञ्चाङ्क डेटा लोड गर्न सकिएन");
      }
    } catch (err) {
      setError("पञ्चाङ्क डेटा लोड गर्न सकिएन");
      console.error("Panchang fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-3 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-sm border border-orange-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-orange-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-orange-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-orange-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-xl p-3 bg-red-50 border border-red-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">{error || "डेटा उपलब्ध छैन"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-3 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-sm border border-orange-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-semibold text-orange-800">आजको पञ्चाङ्क</h3>
        </div>
        <div className="text-xs text-orange-600 font-medium">
          {data.var}
        </div>
      </div>

      {/* Date */}
      <div className="text-xs text-orange-700 mb-2">
        {data.date} ({data.masam} {data.samvatsar})
      </div>

      {/* Main Panchang Info */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600">तिथि:</span>
          <span className="text-orange-800 font-medium">{data.tithi}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600">नक्षत्र:</span>
          <span className="text-orange-800 font-medium">{data.nakshatra}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600">योग:</span>
          <span className="text-orange-800 font-medium">{data.yoga}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600">करण:</span>
          <span className="text-orange-800 font-medium">{data.karana}</span>
        </div>
      </div>

      {/* Sun/Moon Times */}
      <div className="border-t border-orange-200 pt-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Sun className="w-3 h-3 text-yellow-600" />
            <span className="text-orange-600">सूर्योदय:</span>
            <span className="text-orange-800">{data.sunrise}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sun className="w-3 h-3 text-orange-600" />
            <span className="text-orange-600">सूर्यास्त:</span>
            <span className="text-orange-800">{data.sunset}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Moon className="w-3 h-3 text-blue-600" />
            <span className="text-orange-600">चन्द्रोदय:</span>
            <span className="text-orange-800">{data.moonrise}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Moon className="w-3 h-3 text-gray-600" />
            <span className="text-orange-600">चन्द्रास्त:</span>
            <span className="text-orange-800">{data.moonset}</span>
          </div>
        </div>
      </div>

      {/* Auspicious Times */}
      <div className="border-t border-orange-200 pt-2 mt-2">
        <div className="text-xs text-orange-600 mb-1">शुभ समय:</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-600">अभिजित मुहूर्त:</span>
            <span className="text-orange-800 font-medium">{data.abhijitMuhurat}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-600">ब्रह्म मुहूर्त:</span>
            <span className="text-orange-800 font-medium">{data.brahmaMuhurat}</span>
          </div>
        </div>
      </div>

      {/* Inauspicious Times */}
      <div className="border-t border-orange-200 pt-2 mt-2">
        <div className="text-xs text-red-600 mb-1">अशुभ समय:</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-600">राहु काल:</span>
            <span className="text-red-700 font-medium">{data.rahuKaal}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-600">गुलिक काल:</span>
            <span className="text-red-700 font-medium">{data.gulikaKaal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
