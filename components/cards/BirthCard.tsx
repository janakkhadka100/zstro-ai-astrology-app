"use client";
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BirthDetails } from "@/lib/astro-contract";
import { NormalizedPlace, BirthInput } from "@/lib/types/location";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";
import PlaceSearch from "@/components/location/PlaceSearch";
import { formatTimezoneOffset, getTimezoneDisplayName } from "@/lib/utils/prokerala";
import { Edit3, MapPin, Clock, Calendar, CheckCircle } from "lucide-react";

interface BirthCardProps {
  data: BirthDetails;
  onUpdate?: (birthData: BirthInput) => void;
  showEditButton?: boolean;
}

export default function BirthCard({ data, onUpdate, showEditButton = true }: BirthCardProps) {
  const { lang } = useLang();
  const s = strings[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: data.name,
    date: data.birthDate,
    time: data.birthTime,
    place: data.birthPlace
  });
  const [selectedPlace, setSelectedPlace] = useState<NormalizedPlace | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedPlace) {
      alert("Please select a place");
      return;
    }

    setLoading(true);
    try {
      // Calculate timezone for the birth date/time
      const tzResponse = await fetch("/api/geo/timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: selectedPlace.lat,
          lon: selectedPlace.lon,
          localDate: editData.date,
          localTime: editData.time
        })
      });

      const tzData = await tzResponse.json();
      
      if (!tzData.ok) {
        throw new Error(tzData.error || "Timezone calculation failed");
      }

      const birthInput: BirthInput = {
        date: editData.date,
        time: editData.time,
        place: { ...selectedPlace, iana_tz: tzData.iana }
      };

      onUpdate?.(birthInput);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || "Failed to update birth information");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: data.name,
      date: data.birthDate,
      time: data.birthTime,
      place: data.birthPlace
    });
    setSelectedPlace(null);
    setIsEditing(false);
  };

  return (
    <Card id="card-birth" className="rounded-2xl shadow-md bg-gradient-to-r from-emerald-100 via-green-50 to-lime-100">
      <CardHeader className="text-center font-semibold text-emerald-800 flex items-center justify-between">
        <span>{s.birth_details}</span>
        {showEditButton && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/75 rounded-lg p-3">
                <div className="text-xs opacity-70 text-emerald-600">{s.name}</div>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full font-bold text-emerald-800 bg-transparent border-none outline-none"
                />
              </div>
              <div className="bg-white/75 rounded-lg p-3">
                <div className="text-xs opacity-70 text-emerald-600">{s.birth_date}</div>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full font-bold text-emerald-800 bg-transparent border-none outline-none"
                />
              </div>
              <div className="bg-white/75 rounded-lg p-3">
                <div className="text-xs opacity-70 text-emerald-600">{s.birth_time}</div>
                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full font-bold text-emerald-800 bg-transparent border-none outline-none"
                />
              </div>
              <div className="bg-white/75 rounded-lg p-3 col-span-2">
                <div className="text-xs opacity-70 text-emerald-600 mb-2">{s.birth_place}</div>
                <PlaceSearch
                  onSelect={setSelectedPlace}
                  placeholder="Search for birth place..."
                  className="w-full"
                />
                {selectedPlace && (
                  <div className="mt-2 flex items-center space-x-2 text-xs text-emerald-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>{selectedPlace.display_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={!selectedPlace || loading}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/75 rounded-lg p-3">
              <div className="text-xs opacity-70 text-emerald-600 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {s.name}
              </div>
              <div className="font-bold text-emerald-800">{data.name}</div>
            </div>
            <div className="bg-white/75 rounded-lg p-3">
              <div className="text-xs opacity-70 text-emerald-600 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {s.birth_date}
              </div>
              <div className="font-bold text-emerald-800">{data.birthDate}</div>
            </div>
            <div className="bg-white/75 rounded-lg p-3">
              <div className="text-xs opacity-70 text-emerald-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {s.birth_time}
              </div>
              <div className="font-bold text-emerald-800">{data.birthTime}</div>
            </div>
            <div className="bg-white/75 rounded-lg p-3">
              <div className="text-xs opacity-70 text-emerald-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {s.birth_place}
              </div>
              <div className="font-bold text-emerald-800">{data.birthPlace}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
