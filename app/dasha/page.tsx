"use client";
import { useState, useEffect } from "react";
import DashaCard from "@/components/DashaCard";

interface DashaHierarchy {
  date: string;
  active_chain: any[];
  all_periods: any[];
  summary: {
    maha: string;
    antar: string;
    pratyantar: string;
    sookshma: string;
    pran: string;
  };
}

interface DashaInterpretation {
  interpretation: string;
  language: string;
  active_chain: any[];
}

export default function DashaPage() {
  const [hierarchy, setHierarchy] = useState<DashaHierarchy | null>(null);
  const [interpretation, setInterpretation] = useState<DashaInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchDashaHierarchy = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dasha?date=${date}&action=hierarchy`);
      const data = await response.json();
      
      if (data.success) {
        setHierarchy(data.data);
      } else {
        setError(data.error || "Failed to fetch dasha hierarchy");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching dasha hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashaInterpretation = async (date: string, query: string = "Please analyze this dasha combination and provide insights.") => {
    setInterpreting(true);
    
    try {
      const response = await fetch('/api/dasha/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, query })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInterpretation(data.data);
      } else {
        console.error("Failed to get interpretation:", data.error);
      }
    } catch (err) {
      console.error("Error fetching interpretation:", err);
    } finally {
      setInterpreting(false);
    }
  };

  useEffect(() => {
    fetchDashaHierarchy(selectedDate);
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchDashaHierarchy(newDate);
    setInterpretation(null); // Clear previous interpretation
  };

  const handleGetInterpretation = () => {
    if (hierarchy) {
      fetchDashaInterpretation(selectedDate);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating Dasha Hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashaHierarchy(selectedDate)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dasha data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🕉️ Multi-Level Dasha System
            </h1>
            <p className="text-gray-600">
              Explore the complete Vimshottari Dasha hierarchy from Maha to Pran level
            </p>
          </div>

          <DashaCard 
            hierarchy={hierarchy} 
            onDateChange={handleDateChange}
          />

          {/* AI Interpretation */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">AI Interpretation</h3>
              <button
                onClick={handleGetInterpretation}
                disabled={interpreting || !hierarchy}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {interpreting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Get AI Analysis"
                )}
              </button>
            </div>

            {interpretation && (
              <div className="prose max-w-none">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {interpretation.interpretation}
                  </div>
                </div>
              </div>
            )}

            {!interpretation && !interpreting && (
              <div className="text-center py-8 text-gray-500">
                <p>Click "Get AI Analysis" to receive personalized dasha interpretation</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Today's Dasha
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateChange(tomorrow.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tomorrow's Dasha
              </button>
              <button
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  handleDateChange(nextWeek.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Understanding Dasha Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">🔷 Maha Dasha (Major Period)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  The longest period (6-20 years) that sets the overall life theme and direction.
                </p>
                
                <h4 className="font-semibold text-purple-600 mb-2">🔸 Antar Dasha (Sub Period)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Medium-term influence (months to years) that modifies the Maha Dasha effects.
                </p>
                
                <h4 className="font-semibold text-green-600 mb-2">🔹 Pratyantar Dasha (Sub-Sub Period)</h4>
                <p className="text-sm text-gray-600">
                  Short-term influence (weeks to months) affecting daily activities and decisions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">🔸 Sookshma Dasha (Micro Period)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Very short-term influence (days to weeks) affecting mood and immediate responses.
                </p>
                
                <h4 className="font-semibold text-yellow-600 mb-2">🔹 Pran Dasha (Breath Period)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  The shortest period (hours to days) representing momentary energy and consciousness.
                </p>
                
                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>Note:</strong> Each level influences the others, creating a complex web of planetary energies that shape our experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
