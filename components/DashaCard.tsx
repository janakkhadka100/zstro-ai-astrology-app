"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Calendar, Clock, Star, BarChart3 } from "lucide-react";
import DashaTimeline from "./DashaTimeline";

interface DashaPeriod {
  level: number;
  planet: string;
  start: Date;
  end: Date;
  duration_days: number;
  level_name: string;
  is_active: boolean;
  parent?: string;
}

interface DashaHierarchy {
  date: string;
  active_chain: DashaPeriod[];
  all_periods: DashaPeriod[];
  summary: {
    maha: string;
    antar: string;
    pratyantar: string;
    sookshma: string;
    pran: string;
  };
}

interface DashaCardProps {
  hierarchy: DashaHierarchy;
  onDateChange?: (date: string) => void;
}

// Color scheme for different dasha levels
const DASHA_COLORS = {
  1: "bg-blue-100 border-blue-300 text-blue-800", // Maha
  2: "bg-purple-100 border-purple-300 text-purple-800", // Antar
  3: "bg-green-100 border-green-300 text-green-800", // Pratyantar
  4: "bg-orange-100 border-orange-300 text-orange-800", // Sookshma
  5: "bg-yellow-100 border-yellow-300 text-yellow-800" // Pran
};

const DASHA_ICONS = {
  1: "🔷", // Maha
  2: "🔸", // Antar
  3: "🔹", // Pratyantar
  4: "🔸", // Sookshma
  5: "🔹" // Pran
};

function DashaLevelCard({ period, isExpanded, onToggle }: {
  period: DashaPeriod;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      const months = Math.floor(remainingDays / 30);
      return `${years}y ${months}m`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months}m ${remainingDays}d`;
    } else {
      return `${days}d`;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${DASHA_COLORS[period.level as keyof typeof DASHA_COLORS]} ${
      period.is_active ? 'ring-2 ring-offset-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{DASHA_ICONS[period.level as keyof typeof DASHA_ICONS]}</span>
          <div>
            <h3 className="font-bold text-lg">
              {period.level_name} Dasha: {period.planet}
              {period.is_active && <span className="ml-2 text-sm">(Active)</span>}
            </h3>
            <div className="flex items-center space-x-4 text-sm opacity-75">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(period.start)} - {formatDate(period.end)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(period.duration_days)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-current/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Start:</span> {formatDate(period.start)}
            </div>
            <div>
              <span className="font-semibold">End:</span> {formatDate(period.end)}
            </div>
            <div>
              <span className="font-semibold">Duration:</span> {formatDuration(period.duration_days)}
            </div>
            <div>
              <span className="font-semibold">Level:</span> {period.level_name}
            </div>
            {period.parent && (
              <div className="col-span-2">
                <span className="font-semibold">Parent:</span> {period.parent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashaSummary({ summary }: { summary: DashaHierarchy['summary'] }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Star className="w-6 h-6 mr-2 text-indigo-600" />
        Active Dasha Stack
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">Maha</div>
          <div className="font-bold text-blue-600">{summary.maha}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Antar</div>
          <div className="font-bold text-purple-600">{summary.antar}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Pratyantar</div>
          <div className="font-bold text-green-600">{summary.pratyantar}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Sookshma</div>
          <div className="font-bold text-orange-600">{summary.sookshma}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Pran</div>
          <div className="font-bold text-yellow-600">{summary.pran}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashaCard({ hierarchy, onDateChange }: DashaCardProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([1, 2]));
  const [selectedDate, setSelectedDate] = useState(hierarchy.date);
  const [showTimeline, setShowTimeline] = useState(false);

  const toggleLevel = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleTimelineDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    onDateChange?.(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Date for Dasha Analysis
          </label>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{showTimeline ? 'Hide' : 'Show'} Timeline</span>
          </button>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Timeline Visualization */}
      {showTimeline && (
        <DashaTimeline 
          periods={hierarchy.all_periods}
          selectedDate={new Date(selectedDate)}
          onDateSelect={handleTimelineDateSelect}
        />
      )}

      {/* Summary */}
      <DashaSummary summary={hierarchy.summary} />

      {/* Dasha Levels */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Dasha Hierarchy</h2>
        {hierarchy.active_chain.map((period) => (
          <DashaLevelCard
            key={`${period.level}-${period.planet}`}
            period={period}
            isExpanded={expandedLevels.has(period.level)}
            onToggle={() => toggleLevel(period.level)}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">About Vimshottari Dasha</h3>
        <p className="text-sm text-gray-600">
          The Vimshottari Dasha system divides human life into 120 years, with each planet ruling for a specific period.
          This system provides insights into the planetary influences affecting different phases of life.
        </p>
      </div>
    </div>
  );
}
