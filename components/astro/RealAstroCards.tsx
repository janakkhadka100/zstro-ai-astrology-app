// components/astro/RealAstroCards.tsx
// Beautiful cards displaying real astrological data

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Moon, 
  Sun, 
  Calendar, 
  MapPin, 
  Clock,
  Sparkles,
  TrendingUp,
  Heart,
  Brain,
  Target
} from 'lucide-react';

interface RealAstroData {
  ascendant: {
    name: string;
    num: number;
    degree?: number;
  };
  moon: {
    sign: string;
    num: number;
    degree?: number;
    house?: number;
  };
  planets: Array<{
    planet: string;
    sign: string;
    num: number;
    degree?: number;
    house: number;
    lordship?: string;
  }>;
  currentDasha?: {
    system: string;
    maha: string;
    antara?: string;
    pratyantara?: string;
    start?: string;
    end?: string;
  };
  transitHighlights?: string[];
  todayTips?: Array<{
    title: string;
    items: string[];
  }>;
}

interface RealAstroCardsProps {
  data: RealAstroData | null;
  loading: boolean;
  userProfile?: {
    name: string;
    birth: {
      date: string;
      time: string;
      location: {
        place: string;
      };
    };
  };
}

const RealAstroCards: React.FC<RealAstroCardsProps> = ({ data, loading, userProfile }) => {
  // Debug logging
  console.log('🪐 RealAstroCards render:', {
    data: !!data,
    loading,
    userProfile: !!userProfile,
    planetsCount: data?.planets?.length || 0,
    ascendant: data?.ascendant?.name,
    moon: data?.moon?.sign
  });

  if (loading) {
    return <LoadingCards />;
  }

  if (!data) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with user info */}
      {userProfile && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {userProfile.name} को ज्योतिषीय विश्लेषण
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                जन्म: {userProfile.birth.date} | समय: {userProfile.birth.time} | स्थान: {userProfile.birth.location.place}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Astrological Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ascendant Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
              <Sun className="w-5 h-5" />
              <span>लग्न (Ascendant)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {data.ascendant.name}
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                House #1
              </Badge>
              {data.ascendant.degree && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Degree: {data.ascendant.degree.toFixed(2)}°
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Moon Sign Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Moon className="w-5 h-5" />
              <span>चन्द्र राशि (Moon Sign)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {data.moon.sign}
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                House #{data.moon.house}
              </Badge>
              {data.moon.degree && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Degree: {data.moon.degree.toFixed(2)}°
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Dasha Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <Calendar className="w-5 h-5" />
              <span>वर्तमान दशा (Current Dasha)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.currentDasha ? (
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {data.currentDasha.maha}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.currentDasha.system}
                  </p>
                </div>
                {data.currentDasha.antara && (
                  <div className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Antar: {data.currentDasha.antara}
                    </Badge>
                  </div>
                )}
                {data.currentDasha.pratyantara && (
                  <div className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Pratyantar: {data.currentDasha.pratyantara}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center">दशा जानकारी उपलब्ध छैन</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transit Highlights */}
      {data.transitHighlights && data.transitHighlights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
              <TrendingUp className="w-5 h-5" />
              <span>गोचरका मुख्य बुँदा (Transit Highlights)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.transitHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Today's Tips */}
      {data.todayTips && data.todayTips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.todayTips.map((tip, index) => (
            <Card key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
                  {tip.title === 'Lucky' ? <Heart className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  <span>{tip.title === 'Lucky' ? 'भाग्यशाली' : 'फोकस'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {tip.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-700 dark:text-gray-300">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Planetary Positions Table */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Brain className="w-5 h-5" />
            <span>ग्रहहरूको स्थिति (Planetary Positions)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">ग्रह</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">राशि</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">भाव</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">अंश</th>
                  <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">स्वामित्व</th>
                </tr>
              </thead>
              <tbody>
                {data.planets.map((planet, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{planet.planet}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{planet.sign}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        {planet.house}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {planet.degree ? `${planet.degree.toFixed(2)}°` : '-'}
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {planet.lordship || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LoadingCards = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      ज्योतिषीय डाटा उपलब्ध छैन
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      कृपया साइन-इन गरेर आफ्नो जन्म विवरण प्रदान गर्नुहोस्
    </p>
  </div>
);

export default RealAstroCards;
