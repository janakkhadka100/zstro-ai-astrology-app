"use client";
import { useState, useEffect, useRef } from "react";
import { NormalizedPlace } from "@/lib/types/location";
import { Search, MapPin, Clock } from "lucide-react";

interface PlaceSearchProps {
  onSelect: (place: NormalizedPlace) => void;
  placeholder?: string;
  className?: string;
}

export default function PlaceSearch({ onSelect, placeholder = "Search city, place...", className = "" }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NormalizedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchPlaces(query);
      } else {
        setItems([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/geo/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.ok) {
        setItems(data.items || []);
        setShowResults(true);
        setSelectedIndex(-1);
      } else {
        console.error("Search failed:", data.error);
        setItems([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: NormalizedPlace) => {
    setQuery(place.display_name);
    setShowResults(false);
    setItems([]);
    onSelect(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || items.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelect(items[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow click events
    setTimeout(() => setShowResults(false), 150);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {items.length === 0 && !loading && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No places found
            </div>
          )}
          
          {items.map((place, index) => (
            <button
              key={`${place.provider_place_id}-${index}`}
              onClick={() => handleSelect(place)}
              className={`w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 ${
                selectedIndex === index ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {place.display_name}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{place.iana_tz}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {place.lat.toFixed(3)}, {place.lon.toFixed(3)}
                    </div>
                  </div>
                  {place.country && (
                    <div className="text-xs text-gray-500 mt-1">
                      {place.country}
                      {place.admin1 && ` • ${place.admin1}`}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
