'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, User, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '../ErrorBoundary';
import ResultSkeleton from '../ResultSkeleton';
import DevStatus from '../DevStatus';
import { KundaliResultZ, type KundaliResult } from '@/lib/schemas/kundali';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ChartView = dynamic(() => import('../ChartView'), { 
  ssr: false, 
  loading: () => <div className="p-6 opacity-70">Loading chart…</div> 
});

const PDFButton = dynamic(() => import('../PDFButton'), { 
  ssr: false, 
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div> 
});

// Nepal districts data
const NEPAL_DISTRICTS = [
  { name: 'काठमाडौं', province: 'बागमती', lat: 27.7172, lon: 85.3240 },
  { name: 'ललितपुर', province: 'बागमती', lat: 27.6667, lon: 85.3333 },
  { name: 'भक्तपुर', province: 'बागमती', lat: 27.6710, lon: 85.4298 },
  { name: 'पोखरा', province: 'गण्डकी', lat: 28.2096, lon: 83.9856 },
  { name: 'चितवन', province: 'बागमती', lat: 27.5290, lon: 84.3542 },
  { name: 'धनगढी', province: 'सुदूरपश्चिम', lat: 28.6855, lon: 80.6216 },
  { name: 'बुटवल', province: 'लुम्बिनी', lat: 27.7000, lon: 83.4483 },
  { name: 'बिराटनगर', province: 'कोशी', lat: 26.4525, lon: 87.2718 },
  { name: 'बिरगंज', province: 'मधेश', lat: 27.0170, lon: 84.8667 },
  { name: 'हेटौडा', province: 'बागमती', lat: 27.4167, lon: 85.0333 },
  { name: 'धरान', province: 'कोशी', lat: 26.8147, lon: 87.2842 },
  { name: 'नेपालगंज', province: 'लुम्बिनी', lat: 28.0500, lon: 81.6167 },
  { name: 'इटहरी', province: 'कोशी', lat: 26.6667, lon: 87.2833 },
  { name: 'भरतपुर', province: 'बागमती', lat: 27.6833, lon: 84.4333 }
];

interface BirthDetails {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  place: string;
}

interface KundaliFormProps {
  onKundaliGenerated?: (data: any) => void;
}

export default function KundaliForm({ onKundaliGenerated }: KundaliFormProps) {
  const { profile } = useUserProfile();
  
  const [formData, setFormData] = useState<BirthDetails>({
    name: '',
    birthDate: '',
    birthTime: '',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 'Asia/Kathmandu',
    place: 'काठमाडौं'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kundaliData, setKundaliData] = useState<KundaliResult | null>(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [lastApiMs, setLastApiMs] = useState<number | undefined>();

  // Dev mock data fallback - only in development
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !kundaliData && !isLoading) {
      const mockData = KundaliResultZ.parse({
        ascSignId: 1,
        ascSignLabel: "मेष",
        d1: [
          { planet: "Sun", signId: 5, signLabel: "सिंह", house: 5, retro: false },
          { planet: "Moon", signId: 4, signLabel: "कर्क", house: 4, retro: false },
          { planet: "Mars", signId: 1, signLabel: "मेष", house: 1, retro: false },
          { planet: "Mercury", signId: 2, signLabel: "वृष", house: 2, retro: false },
          { planet: "Jupiter", signId: 3, signLabel: "मिथुन", house: 3, retro: false },
          { planet: "Venus", signId: 6, signLabel: "कन्या", house: 6, retro: false },
          { planet: "Saturn", signId: 7, signLabel: "तुला", house: 7, retro: false },
          { planet: "Rahu", signId: 8, signLabel: "वृश्चिक", house: 8, retro: false },
          { planet: "Ketu", signId: 2, signLabel: "वृष", house: 2, retro: false }
        ],
        yogas: [
          { key: "gajakesari", label: "गजकेसरी योग", factors: ["Jupiter", "Moon"] },
          { key: "sunapha", label: "सुनाफा योग", factors: ["Sun", "Moon"] }
        ],
        doshas: [
          { key: "mangal_dosha", label: "मंगल दोष", factors: ["Mars"] }
        ],
        lang: "ne"
      });
      setKundaliData(mockData);
    }
  }, [kundaliData, isLoading]);

  // Prefill form with profile data when available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        birthDate: profile.birthDate || prev.birthDate,
        birthTime: profile.birthTime || prev.birthTime,
        place: profile.birthPlace || prev.place,
      }));
    }
  }, [profile]);

  const handleInputChange = (field: keyof BirthDetails, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleDistrictChange = (districtName: string) => {
    const district = NEPAL_DISTRICTS.find(d => d.name === districtName);
    if (district) {
      setFormData(prev => ({
        ...prev,
        place: district.name,
        latitude: district.lat,
        longitude: district.lon
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('कृपया नाम प्रविष्ट गर्नुहोस्');
      return false;
    }
    if (!formData.birthDate) {
      setError('कृपया जन्म मिति चयन गर्नुहोस्');
      return false;
    }
    if (!formData.birthTime) {
      setError('कृपया जन्म समय प्रविष्ट गर्नुहोस्');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      const response = await fetch('/api/astrology/kundali', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          birthDetails: {
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
            place: formData.place
          }
        }),
      });

      if (!response.ok) {
        throw new Error('कुण्डली बनाउन सकिएन');
      }

      const json = await response.json();
      const data = KundaliResultZ.parse(json);
      setKundaliData(data);
      setLastApiMs(Date.now() - startTime);
      
      if (onKundaliGenerated) {
        onKundaliGenerated(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  कुण्डली बनाइरहेको...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  कृपया प्रतीक्षा गर्नुहोस्
                </p>
              </div>
            </div>
          )}

          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🧘‍♂️ जन्म विवरण
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                आफ्नो जन्म विवरण प्रविष्ट गरेर कुण्डली बनाउनुहोस्
              </CardDescription>
            </CardHeader>
        
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                    <User className="inline w-4 h-4 mr-2" />
                    नाम
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="आफ्नो नाम लेख्नुहोस्"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="inline w-4 h-4 mr-2" />
                    जन्म मिति
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500"
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                  />
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="inline w-4 h-4 mr-2" />
                    जन्म समय
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>

                {/* Birth Place */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    जन्म स्थान
                  </Label>
                  <Select
                    value={formData.place}
                    onValueChange={handleDistrictChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-purple-500">
                      <SelectValue placeholder="जन्म स्थान चयन गर्नुहोस्" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEPAL_DISTRICTS.map((district) => (
                        <SelectItem
                          key={district.name}
                          value={district.name}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {district.name} ({district.province})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      कुण्डली बनाइरहेको...
                    </>
                  ) : (
                    'कुण्डली बनाउनुहोस्'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div>
          {kundaliData ? (
            <ErrorBoundary>
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                {/* Birth Details */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {formData.name} को कुण्डली
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">जन्म मिति:</span>
                      <span className="ml-2 text-gray-800 dark:text-white">{formData.birthDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">जन्म समय:</span>
                      <span className="ml-2 text-gray-800 dark:text-white">{formData.birthTime}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">जन्म स्थान:</span>
                      <span className="ml-2 text-gray-800 dark:text-white">{formData.place}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">लग्न:</span>
                      <span className="ml-2 text-gray-800 dark:text-white">{kundaliData.ascSignLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="chart" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="chart">Chart View</TabsTrigger>
                    <TabsTrigger value="planets">Planets</TabsTrigger>
                    <TabsTrigger value="yog-dosh">Yog/Dosh</TabsTrigger>
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chart" className="mt-6">
                    <Suspense fallback={<ResultSkeleton />}>
                      <ChartView data={kundaliData} />
                    </Suspense>
                  </TabsContent>
                  
                  <TabsContent value="planets" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ग्रह स्थिति</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">ग्रह</th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">राशि</th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">घर</th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">स्थिति</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kundaliData.d1.map((planet, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{planet.planet}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{planet.signLabel}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{planet.house}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                  {planet.retro ? 'वक्री' : 'सामान्य'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="yog-dosh" className="mt-6">
                    <div className="space-y-6">
                      {/* Yogas */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">योग</h3>
                        {kundaliData.yogas.length > 0 ? (
                          <div className="space-y-3">
                            {kundaliData.yogas.map((yoga, index) => (
                              <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 dark:text-green-300">{yoga.label}</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  {yoga.factors.join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">कुनै योग फेला परेन</p>
                        )}
                      </div>

                      {/* Doshas */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">दोष</h3>
                        {kundaliData.doshas.length > 0 ? (
                          <div className="space-y-3">
                            {kundaliData.doshas.map((dosha, index) => (
                              <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h4 className="font-semibold text-red-800 dark:text-red-300">{dosha.label}</h4>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  {dosha.factors.join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">कुनै दोष फेला परेन</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdf" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">PDF Download</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        आफ्नो कुण्डली रिपोर्ट PDF मा डाउनलोड गर्नुहोस्
                      </p>
                      <PDFButton 
                        kundaliData={kundaliData} 
                        birthDetails={{
                          name: formData.name,
                          birthDate: formData.birthDate,
                          birthTime: formData.birthTime,
                          place: formData.place
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ErrorBoundary>
          ) : (
            <ResultSkeleton />
          )}
        </div>
      </div>
      
      {/* Dev Status */}
      <DevStatus 
        dataLoaded={!!kundaliData} 
        activeTab={activeTab} 
        lastApiMs={lastApiMs} 
      />
    </div>
  );
}