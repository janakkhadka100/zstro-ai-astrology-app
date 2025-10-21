"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarData {
  currentDate: string;
  nepaliDate: string;
  dayOfWeek: string;
  month: string;
  year: string;
  tithi: string;
  nakshatra: string;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  events: Array<{
    date: string;
    title: string;
    type: 'festival' | 'fast' | 'special' | 'holiday';
  }>;
}

interface CalendarCardProps {
  className?: string;
}

export default function CalendarCard({ className = "" }: CalendarCardProps) {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const isToday = currentMonth.getMonth() === today.getMonth() && 
                     currentMonth.getFullYear() === today.getFullYear();
      
      const response = await fetch('/api/panchang');
      const result = await response.json();
      
      if (result.success) {
        const panchangData = result.data;
        const calendarData: CalendarData = {
          currentDate: today.toLocaleDateString('en-US'),
          nepaliDate: panchangData.nepaliDate,
          dayOfWeek: panchangData.var,
          month: currentMonth.toLocaleDateString('ne-NP', { month: 'long' }),
          year: currentMonth.getFullYear().toString(),
          tithi: panchangData.tithi,
          nakshatra: panchangData.nakshatra,
          isToday,
          isHoliday: false,
          events: panchangData.events || []
        };
        
        setData(calendarData);
      } else {
        setError(result.error || "क्यालेन्डर डेटा लोड गर्न सकिएन");
      }
    } catch (err) {
      setError("क्यालेन्डर डेटा लोड गर्न सकिएन");
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-3 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-blue-200 rounded w-2/3"></div>
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

  const todayEvents = data.events.filter(event => 
    new Date(event.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className={`rounded-xl p-3 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-800">पात्रो</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            आज
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Current Date Info */}
      <div className="text-center mb-3">
        <div className="text-lg font-bold text-blue-800">
          {currentMonth.toLocaleDateString('ne-NP', { 
            year: 'numeric', 
            month: 'long' 
          })}
        </div>
        <div className="text-xs text-blue-600">
          {data.nepaliDate}
        </div>
      </div>

      {/* Today's Info */}
      {data.isToday && (
        <div className="bg-blue-100 rounded-lg p-2 mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">आज</span>
          </div>
          <div className="text-xs text-blue-700">
            <div>{data.dayOfWeek}</div>
            <div>{data.tithi}</div>
            <div>{data.nakshatra}</div>
          </div>
        </div>
      )}

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-blue-800 mb-1">आजका कार्यक्रम:</div>
          <div className="space-y-1">
            {todayEvents.map((event, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded ${
                  event.type === 'festival' ? 'bg-yellow-100 text-yellow-800' :
                  event.type === 'fast' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'holiday' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="border-t border-blue-200 pt-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-blue-600">तिथि</div>
            <div className="text-blue-800 font-medium">{data.tithi}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600">नक्षत्र</div>
            <div className="text-blue-800 font-medium">{data.nakshatra}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="border-t border-blue-200 pt-2 mt-2">
        <div className="text-xs font-medium text-blue-800 mb-1">आगामी कार्यक्रम:</div>
        <div className="space-y-1">
          {data.events.slice(0, 2).map((event, index) => (
            <div key={index} className="text-xs text-blue-700">
              <span className="font-medium">{event.title}</span>
              <span className="text-blue-500 ml-1">
                ({new Date(event.date).toLocaleDateString('ne-NP')})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
