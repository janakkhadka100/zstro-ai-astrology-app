'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, User, Clock } from 'lucide-react';

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

  return (
    <div className="max-w-2xl mx-auto">
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
            <div className="mt-8 p-6 bg-white/10 rounded-lg border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">कुण्डली परिणाम</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">लग्न राशि</h4>
                  <p className="text-white">{kundaliData.ascSignLabel}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">ग्रह स्थिति</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {kundaliData.d1?.map((planet: any, index: number) => (
                      <div key={index} className="text-sm text-gray-300">
                        <span className="font-medium">{planet.planet}:</span> {planet.signLabel} ({planet.house}औं घर)
                      </div>
                    ))}
                  </div>
                </div>

                {kundaliData.yogas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">योग</h4>
                    <div className="space-y-1">
                      {kundaliData.yogas.map((yoga: any, index: number) => (
                        <div key={index} className="text-sm text-gray-300">
                          • {yoga.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {kundaliData.doshas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-300 mb-2">दोष</h4>
                    <div className="space-y-1">
                      {kundaliData.doshas.map((dosha: any, index: number) => (
                        <div key={index} className="text-sm text-gray-300">
                          • {dosha.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
