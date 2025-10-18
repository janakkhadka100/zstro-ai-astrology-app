'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, User, Clock, Star, Download, Share2 } from 'lucide-react';
import NorthIndianChart from '../charts/NorthIndianChart';
import { pdfService } from '@/lib/services/pdf-service';

// Nepal districts data
const NEPAL_DISTRICTS = [
  { name: 'काठमाडौं', province: 'बागमती', lat: 27.7172, lon: 85.3240 },
  { name: 'ललितपुर', province: 'बागमती', lat: 27.6667, lon: 85.3333 },
  { name: 'भक्तपुर', province: 'बागमती', lat: 27.6710, lon: 85.4298 },
  { name: 'पोखरा', province: 'गण्डकी', lat: 28.2096, lon: 83.9856 },
  { name: 'चितवन', province: 'बागमती', lat: 27.5290, lon: 84.3542 },
  { name: 'ललितपुर', province: 'बागमती', lat: 27.6667, lon: 85.3333 },
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
  const [kundaliData, setKundaliData] = useState<any>(null);

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

      const data = await response.json();
      setKundaliData(data);
      
      if (onKundaliGenerated) {
        onKundaliGenerated(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'अज्ञात त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!kundaliData) return;

    try {
      setIsLoading(true);
      await pdfService.generateKundaliPDF(
        kundaliData,
        {
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          place: formData.place,
        },
        'north-indian-chart'
      );
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError('PDF download गर्न सकिएन');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800">
              तपाईंको कुण्डली बनाउँदै...
            </p>
            <p className="text-sm text-gray-600 mt-2">
              कृपया प्रतीक्षा गर्नुहोस्
            </p>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            कुण्डली जनरेटर
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            आफ्नो जन्म विवरण प्रविष्ट गरेर कुण्डली बनाउनुहोस्
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">
                <User className="inline w-4 h-4 mr-2" />
                नाम
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="आफ्नो नाम लेख्नुहोस्"
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-white font-medium">
                <Clock className="inline w-4 h-4 mr-2" />
                जन्म मिति
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400"
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-2">
              <Label htmlFor="birthTime" className="text-white font-medium">
                <Clock className="inline w-4 h-4 mr-2" />
                जन्म समय
              </Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            {/* Birth Place */}
            <div className="space-y-2">
              <Label className="text-white font-medium">
                <MapPin className="inline w-4 h-4 mr-2" />
                जन्म स्थान
              </Label>
              <Select
                value={formData.place}
                onValueChange={handleDistrictChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-blue-400">
                  <SelectValue placeholder="जन्म स्थान चयन गर्नुहोस्" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {NEPAL_DISTRICTS.map((district) => (
                    <SelectItem
                      key={district.name}
                      value={district.name}
                      className="text-white hover:bg-gray-700"
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

          {/* Kundali Results */}
          {kundaliData && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 space-y-6">
              {/* Birth Details */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {formData.name} को कुण्डली
                </h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">जन्म मिति:</span>
                    <p className="font-semibold">{formData.birthDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">जन्म समय:</span>
                    <p className="font-semibold">{formData.birthTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">जन्म स्थान:</span>
                    <p className="font-semibold">{formData.place}</p>
                  </div>
                </div>
              </div>

              {/* Ascendant - Prominent Display */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">लग्न (Ascendant)</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold">{kundaliData.ascSignLabel}</p>
                    <p className="text-purple-200 text-sm">Sign ID: {kundaliData.ascSignId}</p>
                  </div>
                  <Star className="w-16 h-16 text-purple-200" />
                </div>
              </div>

              {/* North Indian Chart */}
              <div id="north-indian-chart">
                <NorthIndianChart 
                  planets={kundaliData.d1 || []}
                  ascendant={{
                    signId: kundaliData.ascSignId,
                    signLabel: kundaliData.ascSignLabel
                  }}
                />
              </div>

              {/* Planets */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  ग्रहहरू (Planets)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {kundaliData.d1?.map((planet: any, index: number) => (
                    <div 
                      key={index}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{planet.planet}</h4>
                          <p className="text-sm text-gray-600">ग्रह</p>
                        </div>
                        {planet.retro && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                            वक्री (R)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">राशि:</span>
                          <p className="font-semibold text-purple-700">{planet.signLabel}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">घर:</span>
                          <p className="font-semibold text-blue-700">{planet.house}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yogas - Benefic */}
              {kundaliData.yogas && kundaliData.yogas.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-green-500">✨</span>
                    योगहरू (Auspicious Yogas)
                  </h3>
                  <div className="space-y-3">
                    {kundaliData.yogas.map((yoga: any, index: number) => (
                      <div 
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-900 mb-1">{yoga.label}</h4>
                            <p className="text-sm text-gray-600">
                              Factors: {yoga.factors.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Key: {yoga.key}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doshas - Warning */}
              {kundaliData.doshas && kundaliData.doshas.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-orange-500">⚠️</span>
                    दोषहरू (Doshas)
                  </h3>
                  <div className="space-y-3">
                    {kundaliData.doshas.map((dosha: any, index: number) => (
                      <div 
                        key={index}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            ⚠
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-orange-900 mb-1">{dosha.label}</h4>
                            <p className="text-sm text-gray-600">
                              Affected by: {dosha.factors.join(', ')}
                            </p>
                            <p className="text-xs text-orange-700 mt-2">
                              💡 उपाय को लागि ज्योतिषी संग परामर्श गर्नुहोस्
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isLoading ? 'PDF बनाइरहेको...' : 'PDF डाउनलोड गर्नुहोस्'}
                </button>
                <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  शेयर गर्नुहोस्
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
