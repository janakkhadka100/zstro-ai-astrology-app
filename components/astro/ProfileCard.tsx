"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import { getString } from "@/utils/strings";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, Clock, MapPin, Globe } from "lucide-react";

interface ProfileData {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  tz?: string;
  lat?: number;
  lon?: number;
  pob?: string;
}

interface ProfileCardProps {
  data?: ProfileData;
  loading?: boolean;
  lang?: "en" | "hi" | "ne";
}

export function ProfileCard({ data, loading = false, lang }: ProfileCardProps) {
  const { lang: contextLang } = useLang();
  const currentLang = lang || contextLang;

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'ne' ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString(lang === 'hi' ? 'hi-IN' : lang === 'ne' ? 'ne-NP' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <User className="h-6 w-6 text-rose-600" />
          <span>{getString("summary", currentLang)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getString("summary", currentLang)}
            </p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {data?.name || "जनम कुण्डली"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Birth Date</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatDate(data?.birthDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
            <Clock className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Birth Time</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatTime(data?.birthTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Place of Birth</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {data?.pob || "Kathmandu, Nepal"}
              </p>
            </div>
          </div>

          {data?.lat && data?.lon && (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
              <Globe className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
                </p>
              </div>
            </div>
          )}

          {data?.tz && (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
              <Clock className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Timezone</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {data.tz}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}