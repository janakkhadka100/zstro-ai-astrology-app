"use client";
import { useState } from "react";
import { NormalizedPlace, BirthInput, ProkeralaPayload } from "@/lib/types/location";
import PlaceSearch from "@/components/location/PlaceSearch";
import BirthStep from "@/components/location/BirthStep";
import { buildProkeralaPayload, formatTimezoneOffset, getTimezoneDisplayName } from "@/lib/utils/prokerala";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Globe, CheckCircle } from "lucide-react";

export default function LocationDemoPage() {
  const [selectedPlace, setSelectedPlace] = useState<NormalizedPlace | null>(null);
  const [birthData, setBirthData] = useState<BirthInput | null>(null);
  const [prokeralaPayload, setProkeralaPayload] = useState<ProkeralaPayload | null>(null);

  const handlePlaceSelect = (place: NormalizedPlace) => {
    setSelectedPlace(place);
  };

  const handleBirthComplete = (data: BirthInput & { prokerala: ProkeralaPayload }) => {
    setBirthData(data);
    setProkeralaPayload(data.prokerala);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Location Search Demo</h1>
          <p className="text-gray-600">Test the world-class location search with timezone handling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Place Search Demo */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Place Search
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <PlaceSearch
                  onSelect={handlePlaceSelect}
                  placeholder="Try: Kathmandu, New York, London, Tokyo..."
                  className="w-full"
                />
                
                {selectedPlace && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">{selectedPlace.display_name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-green-700">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedPlace.lat.toFixed(6)}, {selectedPlace.lon.toFixed(6)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{getTimezoneDisplayName(selectedPlace.iana_tz)} ({selectedPlace.iana_tz})</span>
                          </div>
                          <div className="text-xs text-green-600">
                            {selectedPlace.country}
                            {selectedPlace.admin1 && ` • ${selectedPlace.admin1}`}
                            {selectedPlace.city && ` • ${selectedPlace.city}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Birth Information Demo */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-emerald-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Birth Information
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <BirthStep onComplete={handleBirthComplete} />
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        {(birthData || prokeralaPayload) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Birth Data */}
            {birthData && (
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-2xl">
                  <h2 className="text-xl font-semibold text-purple-800">Birth Data</h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="font-medium">{birthData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="font-medium">{birthData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Place:</span>
                      <span className="font-medium text-right max-w-xs">{birthData.place.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coordinates:</span>
                      <span className="font-medium">{birthData.place.lat.toFixed(4)}, {birthData.place.lon.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timezone:</span>
                      <span className="font-medium">{birthData.place.iana_tz}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prokerala Payload */}
            {prokeralaPayload && (
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 rounded-t-2xl">
                  <h2 className="text-xl font-semibold text-orange-800">Prokerala Payload</h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">UTC DateTime:</span>
                      <span className="font-medium text-xs">{prokeralaPayload.datetime_utc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Latitude:</span>
                      <span className="font-medium">{prokeralaPayload.lat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Longitude:</span>
                      <span className="font-medium">{prokeralaPayload.lon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timezone:</span>
                      <span className="font-medium">{prokeralaPayload.tz_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Offset:</span>
                      <span className="font-medium">
                        {formatTimezoneOffset(prokeralaPayload.tz_offset_minutes)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Raw JSON:</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(prokeralaPayload, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Test Cases */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-800">Test Cases</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Nepal (Fixed Offset)</h3>
                <p className="text-sm text-blue-700">Kathmandu, Nepal</p>
                <p className="text-xs text-blue-600">Always +05:45 (345 minutes)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">USA (DST)</h3>
                <p className="text-sm text-green-700">New York, USA</p>
                <p className="text-xs text-green-600">Summer: -04:00, Winter: -05:00</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Europe (DST)</h3>
                <p className="text-sm text-purple-700">London, UK</p>
                <p className="text-xs text-purple-600">Summer: +01:00, Winter: +00:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
