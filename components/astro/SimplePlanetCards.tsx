'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlanetData {
  planet: string;
  sign: string;
  house: number;
  degree?: number;
  lordship?: string;
}

interface SimplePlanetCardsProps {
  planets: PlanetData[];
  ascendant: string;
  moon: string;
}

const SimplePlanetCards: React.FC<SimplePlanetCardsProps> = ({ planets, ascendant, moon }) => {
  console.log('🪐 SimplePlanetCards render:', { planets: planets.length, ascendant, moon });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ग्रहहरूको स्थिति (Planetary Positions)
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          लग्न: {ascendant} | चन्द्र: {moon}
        </p>
      </div>

      {/* Planetary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planets.map((planet, index) => (
          <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {planet.planet}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">राशि:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{planet.sign}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">भाव:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {planet.house}
                  </Badge>
                </div>
                {planet.degree && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">अंश:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {planet.degree.toFixed(2)}°
                    </span>
                  </div>
                )}
                {planet.lordship && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">स्वामित्व:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{planet.lordship}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Table */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            सारांश तालिका (Summary Table)
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
                </tr>
              </thead>
              <tbody>
                {planets.map((planet, index) => (
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

export default SimplePlanetCards;
