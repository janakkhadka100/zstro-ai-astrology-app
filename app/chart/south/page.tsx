'use client';

import { useState } from 'react';
import { Star, Download, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Planet {
  planet: string;
  signId: number;
  signLabel: string;
  house: number;
  retro: boolean;
}

const mockPlanets: Planet[] = [
  { planet: 'Sun', signId: 1, signLabel: 'मेष', house: 1, retro: false },
  { planet: 'Moon', signId: 2, signLabel: 'वृष', house: 2, retro: false },
  { planet: 'Mars', signId: 3, signLabel: 'मिथुन', house: 3, retro: false },
  { planet: 'Mercury', signId: 4, signLabel: 'कर्क', house: 4, retro: false },
  { planet: 'Jupiter', signId: 5, signLabel: 'सिंह', house: 5, retro: false },
  { planet: 'Venus', signId: 6, signLabel: 'कन्या', house: 6, retro: false },
  { planet: 'Saturn', signId: 7, signLabel: 'तुला', house: 7, retro: false },
  { planet: 'Rahu', signId: 8, signLabel: 'वृश्चिक', house: 8, retro: false },
  { planet: 'Ketu', signId: 9, signLabel: 'धनु', house: 9, retro: false }
];

export default function SouthIndianChartPage() {
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('south');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const getPlanetShortName = (planet: string): string => {
    const shortNames: Record<string, string> = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    };
    return shortNames[planet] || planet.substring(0, 2);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    // PDF generation logic here
    setTimeout(() => {
      setIsGeneratingPDF(false);
    }, 2000);
  };

  const renderSouthIndianChart = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
          दक्षिण भारतीय कुण्डली (South Indian Chart)
        </h3>
        
        {/* 4x4 Grid Chart */}
        <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-4">
          {/* Row 1 */}
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">12</div>
            <div className="text-sm font-semibold">House 12</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">1</div>
            <div className="text-sm font-semibold">House 1</div>
            <div className="text-xs text-purple-600 mt-1">लग्न</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">2</div>
            <div className="text-sm font-semibold">House 2</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">3</div>
            <div className="text-sm font-semibold">House 3</div>
          </div>

          {/* Row 2 */}
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">11</div>
            <div className="text-sm font-semibold">House 11</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-3 text-center border-2 border-purple-300">
            <div className="text-xs text-gray-500 mb-1">Center</div>
            <div className="text-sm font-semibold text-purple-700">लग्न</div>
            <div className="text-xs text-purple-600">✦</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">4</div>
            <div className="text-sm font-semibold">House 4</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">5</div>
            <div className="text-sm font-semibold">House 5</div>
          </div>

          {/* Row 3 */}
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">10</div>
            <div className="text-sm font-semibold">House 10</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">9</div>
            <div className="text-sm font-semibold">House 9</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">8</div>
            <div className="text-sm font-semibold">House 8</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">7</div>
            <div className="text-sm font-semibold">House 7</div>
          </div>

          {/* Row 4 */}
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">9</div>
            <div className="text-sm font-semibold">House 9</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">8</div>
            <div className="text-sm font-semibold">House 8</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">7</div>
            <div className="text-sm font-semibold">House 7</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">6</div>
            <div className="text-sm font-semibold">House 6</div>
          </div>
        </div>

        {/* Planets in Houses */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">ग्रह स्थिति</h4>
          <div className="grid grid-cols-3 gap-2">
            {mockPlanets.map((planet, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-semibold text-gray-800">
                  {getPlanetShortName(planet.planet)}
                  {planet.retro && <sup className="text-red-500">R</sup>}
                </div>
                <div className="text-xs text-gray-600">{planet.signLabel}</div>
                <div className="text-xs text-blue-600">House {planet.house}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNorthIndianChart = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
          उत्तर भारतीय कुण्डली (North Indian Chart)
        </h3>
        
        {/* Diamond Chart Placeholder */}
        <div className="w-full aspect-square bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Star className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600">Diamond Chart View</p>
            <p className="text-sm text-gray-500">North Indian style chart</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Chart Visualization
            </h1>
            <Settings className="w-8 h-8 text-purple-500 ml-3" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Interactive astrological charts with multiple visualization styles
          </p>
        </div>

        {/* Chart Style Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border">
            <button
              onClick={() => setChartStyle('north')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                chartStyle === 'north'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              North Indian
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                chartStyle === 'south'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              South Indian
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="planets">Planet Details</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            {chartStyle === 'south' ? renderSouthIndianChart() : renderNorthIndianChart()}
          </TabsContent>

          <TabsContent value="planets" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Planet Details</CardTitle>
                <CardDescription>
                  Detailed planetary positions and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Planet</th>
                        <th className="text-left py-2">Sign</th>
                        <th className="text-left py-2">House</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPlanets.map((planet, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{planet.planet}</td>
                          <td className="py-2">{planet.signLabel}</td>
                          <td className="py-2">{planet.house}</td>
                          <td className="py-2">
                            {planet.retro ? (
                              <span className="text-red-600 text-sm">Retrograde</span>
                            ) : (
                              <span className="text-green-600 text-sm">Direct</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
                <CardDescription>
                  AI-powered astrological analysis and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      Overall Analysis
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      This chart shows a balanced planetary distribution with strong influences in key houses.
                      The ascendant is well-placed and indicates good fortune and success.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Strengths
                    </h4>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Strong Jupiter placement</li>
                      <li>• Well-aspected Moon</li>
                      <li>• Beneficial planetary combinations</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                      Areas of Focus
                    </h4>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Mercury retrograde period</li>
                      <li>• Mars in challenging position</li>
                      <li>• Need for spiritual growth</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGeneratingPDF ? (
              <>
                <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                PDF बनाइरहेको...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Chart PDF डाउनलोड गर्नुहोस्
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/kundali'}
          >
            <Star className="w-5 h-5 mr-2" />
            नयाँ कुण्डली बनाउनुहोस्
          </Button>
        </div>
      </div>
    </div>
  );
}
