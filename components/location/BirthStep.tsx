"use client";
import { useState } from "react";
import { NormalizedPlace, BirthInput, ProkeralaPayload } from "@/lib/types/location";
import PlaceSearch from "./PlaceSearch";
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react";

interface BirthStepProps {
  onComplete: (data: BirthInput & { prokerala: ProkeralaPayload }) => void;
  initialData?: Partial<BirthInput>;
}

export default function BirthStep({ onComplete, initialData }: BirthStepProps) {
  const [place, setPlace] = useState<NormalizedPlace | null>(initialData?.place || null);
  const [date, setDate] = useState(initialData?.date || "1990-05-15");
  const [time, setTime] = useState(initialData?.time || "10:30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!place) {
      setError("Please select a birth place");
      return;
    }

    if (!date || !time) {
      setError("Please enter both date and time");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate timezone offset for the specific birth date/time
      const tzResponse = await fetch("/api/geo/timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: place.lat,
          lon: place.lon,
          localDate: date,
          localTime: time
        })
      });

      const tzData = await tzResponse.json();
      
      if (!tzData.ok) {
        throw new Error(tzData.error || "Timezone calculation failed");
      }

      const birthInput: BirthInput = {
        date,
        time,
        place: { ...place, iana_tz: tzData.iana }
      };

      const prokerala: ProkeralaPayload = {
        datetime_utc: tzData.datetime_utc,
        lat: place.lat,
        lon: place.lon,
        tz_name: tzData.iana,
        tz_offset_minutes: tzData.offset_minutes
      };

      onComplete({ ...birthInput, prokerala });
    } catch (err: any) {
      setError(err.message || "Failed to process birth information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Birth Information</h2>
        <p className="text-gray-600">Enter your birth details for accurate astrological calculations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Birth Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Birth Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Birth Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Birth Place */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Birth Place
          </label>
          <PlaceSearch
            onSelect={setPlace}
            placeholder="Search for your birth city or place..."
            className="w-full"
          />
          {place && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">{place.display_name}</div>
                  <div className="text-green-600 text-xs">
                    {place.iana_tz} • {place.lat.toFixed(3)}, {place.lon.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!place || loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing..." : "Save & Continue"}
      </button>
    </div>
  );
}
