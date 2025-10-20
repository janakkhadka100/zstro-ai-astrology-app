"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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

interface DashaTimelineProps {
  periods: DashaPeriod[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DASHA_COLORS = {
  1: "bg-blue-500",
  2: "bg-purple-500", 
  3: "bg-green-500",
  4: "bg-orange-500",
  5: "bg-yellow-500"
};

const DASHA_LABELS = {
  1: "Maha",
  2: "Antar",
  3: "Pratyantar", 
  4: "Sookshma",
  5: "Pran"
};

export default function DashaTimeline({ periods, selectedDate, onDateSelect }: DashaTimelineProps) {
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'decade'>('year');
  const [currentView, setCurrentView] = useState(new Date());

  // Filter periods based on view mode
  const getFilteredPeriods = () => {
    const now = new Date();
    const startDate = new Date(currentView);
    
    switch (viewMode) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'decade':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
    }

    const endDate = new Date(currentView);
    switch (viewMode) {
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'decade':
        endDate.setFullYear(endDate.getFullYear() + 5);
        break;
    }

    return periods.filter(period => 
      period.start >= startDate && period.end <= endDate
    );
  };

  const filteredPeriods = getFilteredPeriods();

  // Calculate timeline scale
  const getTimelineScale = () => {
    const now = new Date();
    const startDate = new Date(currentView);
    const endDate = new Date(currentView);

    switch (viewMode) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setMonth(endDate.getMonth() + 1);
        return {
          start: startDate,
          end: endDate,
          unit: 'day',
          pixelsPerDay: 2
        };
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setFullYear(endDate.getFullYear() + 1);
        return {
          start: startDate,
          end: endDate,
          unit: 'month',
          pixelsPerMonth: 20
        };
      case 'decade':
        startDate.setFullYear(startDate.getFullYear() - 5);
        endDate.setFullYear(endDate.getFullYear() + 5);
        return {
          start: startDate,
          end: endDate,
          unit: 'year',
          pixelsPerYear: 30
        };
    }
  };

  const timelineScale = getTimelineScale();

  // Calculate position for a date
  const getDatePosition = (date: Date) => {
    const totalDuration = timelineScale.end.getTime() - timelineScale.start.getTime();
    const dateOffset = date.getTime() - timelineScale.start.getTime();
    return (dateOffset / totalDuration) * 100;
  };

  // Calculate width for a period
  const getPeriodWidth = (period: DashaPeriod) => {
    const totalDuration = timelineScale.end.getTime() - timelineScale.start.getTime();
    const periodDuration = period.end.getTime() - period.start.getTime();
    return (periodDuration / totalDuration) * 100;
  };

  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentView);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      case 'decade':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 5 : -5));
        break;
    }
    
    setCurrentView(newDate);
  };

  const formatDateRange = () => {
    const start = new Date(currentView);
    const end = new Date(currentView);
    
    switch (viewMode) {
      case 'month':
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() + 1);
        return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        end.setFullYear(end.getFullYear() + 1);
        return `${start.getFullYear()} - ${end.getFullYear()}`;
      case 'decade':
        start.setFullYear(start.getFullYear() - 5);
        end.setFullYear(end.getFullYear() + 5);
        return `${start.getFullYear()} - ${end.getFullYear()}`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Dasha Timeline
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'year', 'decade'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === mode 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateTimeline('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[120px] text-center">
              {formatDateRange()}
            </span>
            <button
              onClick={() => navigateTimeline('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300"></div>
        
        {/* Selected Date Marker */}
        <div 
          className="absolute top-6 w-1 h-4 bg-red-500 rounded-full transform -translate-x-0.5"
          style={{ left: `${getDatePosition(selectedDate)}%` }}
        ></div>

        {/* Period Bars */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(level => {
            const levelPeriods = filteredPeriods.filter(p => p.level === level);
            if (levelPeriods.length === 0) return null;

            return (
              <div key={level} className="flex items-center">
                <div className="w-16 text-xs font-medium text-gray-600 mr-4">
                  {DASHA_LABELS[level as keyof typeof DASHA_LABELS]}
                </div>
                
                <div className="flex-1 relative h-6">
                  {levelPeriods.map((period, index) => (
                    <div
                      key={index}
                      className={`absolute h-4 rounded-md ${DASHA_COLORS[level as keyof typeof DASHA_COLORS]} ${
                        period.is_active ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                      } cursor-pointer hover:opacity-80 transition-opacity`}
                      style={{
                        left: `${getDatePosition(period.start)}%`,
                        width: `${getPeriodWidth(period)}%`,
                        top: '4px'
                      }}
                      title={`${period.planet} (${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()})`}
                      onClick={() => onDateSelect(period.start)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white truncate px-1">
                          {period.planet}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Labels */}
        <div className="mt-8 flex justify-between text-xs text-gray-500">
          <span>{timelineScale.start.toLocaleDateString()}</span>
          <span>{timelineScale.end.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">Legend:</span>
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded ${DASHA_COLORS[level as keyof typeof DASHA_COLORS]}`}></div>
                <span className="text-xs text-gray-600">{DASHA_LABELS[level as keyof typeof DASHA_LABELS]}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            <span>Selected Date</span>
          </div>
        </div>
      </div>
    </div>
  );
}
