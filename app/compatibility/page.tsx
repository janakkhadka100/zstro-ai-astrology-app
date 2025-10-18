'use client';

import { useState } from 'react';
import { Users, Heart, Star, Download, Sparkles, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const rashis = [
  'मेष (Aries)', 'वृष (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)',
  'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)',
  'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुम्भ (Aquarius)', 'मीन (Pisces)'
];

interface Person {
  name: string;
  birthDate: string;
  birthTime: string;
  rashi: string;
}

export default function CompatibilityPage() {
  const [personA, setPersonA] = useState<Person>({
    name: '',
    birthDate: '',
    birthTime: '',
    rashi: ''
  });
  const [personB, setPersonB] = useState<Person>({
    name: '',
    birthDate: '',
    birthTime: '',
    rashi: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);

  const handlePersonChange = (person: 'A' | 'B', field: keyof Person, value: string) => {
    if (person === 'A') {
      setPersonA(prev => ({ ...prev, [field]: value }));
    } else {
      setPersonB(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleMatchKundali = async () => {
    if (!personA.name || !personB.name || !personA.rashi || !personB.rashi) {
      alert('कृपया सबै फिल्ड भर्नुहोस्');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 17; // 17-36
      const verdict = score >= 30 ? 'Excellent' : score >= 25 ? 'Good' : score >= 20 ? 'Average' : 'Poor';
      
      setCompatibilityResult({
        score,
        verdict,
        details: {
          emotional: Math.floor(Math.random() * 10) + 1,
          physical: Math.floor(Math.random() * 10) + 1,
          mental: Math.floor(Math.random() * 10) + 1,
          spiritual: Math.floor(Math.random() * 10) + 1
        },
        analysis: 'तपाईंहरूको ज्योतिषीय विश्लेषण अनुसार यो सम्बन्ध धेरै शुभ छ। दुवै व्यक्तिको ग्रह स्थिति एक अर्कासँग मेल खान्छ।'
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleDownloadPDF = async () => {
    // PDF generation logic here
    console.log('Downloading compatibility PDF...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              ज्योतिषीय मेल
            </h1>
            <Users className="w-8 h-8 text-purple-500 ml-3" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Check compatibility between two people using AI-powered astrological analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Person A */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-6 h-6 mr-2 text-blue-500" />
                Person A
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personA-name">नाम</Label>
                <Input
                  id="personA-name"
                  value={personA.name}
                  onChange={(e) => handlePersonChange('A', 'name', e.target.value)}
                  placeholder="पहिलो व्यक्तिको नाम"
                />
              </div>
              <div>
                <Label htmlFor="personA-date">जन्म मिति</Label>
                <Input
                  id="personA-date"
                  type="date"
                  value={personA.birthDate}
                  onChange={(e) => handlePersonChange('A', 'birthDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personA-time">जन्म समय</Label>
                <Input
                  id="personA-time"
                  type="time"
                  value={personA.birthTime}
                  onChange={(e) => handlePersonChange('A', 'birthTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personA-rashi">राशि</Label>
                <Select value={personA.rashi} onValueChange={(value) => handlePersonChange('A', 'rashi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="राशि चयन गर्नुहोस्" />
                  </SelectTrigger>
                  <SelectContent>
                    {rashis.map((rashi) => (
                      <SelectItem key={rashi} value={rashi}>
                        {rashi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Person B */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="w-6 h-6 mr-2 text-pink-500" />
                Person B
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personB-name">नाम</Label>
                <Input
                  id="personB-name"
                  value={personB.name}
                  onChange={(e) => handlePersonChange('B', 'name', e.target.value)}
                  placeholder="दोस्रो व्यक्तिको नाम"
                />
              </div>
              <div>
                <Label htmlFor="personB-date">जन्म मिति</Label>
                <Input
                  id="personB-date"
                  type="date"
                  value={personB.birthDate}
                  onChange={(e) => handlePersonChange('B', 'birthDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personB-time">जन्म समय</Label>
                <Input
                  id="personB-time"
                  type="time"
                  value={personB.birthTime}
                  onChange={(e) => handlePersonChange('B', 'birthTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personB-rashi">राशि</Label>
                <Select value={personB.rashi} onValueChange={(value) => handlePersonChange('B', 'rashi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="राशि चयन गर्नुहोस्" />
                  </SelectTrigger>
                  <SelectContent>
                    {rashis.map((rashi) => (
                      <SelectItem key={rashi} value={rashi}>
                        {rashi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleMatchKundali}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                मेल जाँच गर्दै...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                कुण्डली मेल गर्नुहोस्
              </>
            )}
          </Button>
        </div>

        {/* Compatibility Result */}
        {compatibilityResult && (
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                मेल परिणाम
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Score Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  {compatibilityResult.score}/36
                </div>
                <div className={`text-2xl font-semibold ${
                  compatibilityResult.score >= 30 ? 'text-green-600' :
                  compatibilityResult.score >= 25 ? 'text-blue-600' :
                  compatibilityResult.score >= 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {compatibilityResult.verdict}
                </div>
              </div>

              {/* Compatibility Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {compatibilityResult.details.emotional}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">भावनात्मक</div>
                </div>
                <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {compatibilityResult.details.physical}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">शारीरिक</div>
                </div>
                <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {compatibilityResult.details.mental}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">मानसिक</div>
                </div>
                <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {compatibilityResult.details.spiritual}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">आध्यात्मिक</div>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">विश्लेषण</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {compatibilityResult.analysis}
                </p>
              </div>

              {/* PDF Download */}
              <div className="text-center mt-6">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-gray-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  मेल रिपोर्ट PDF मा डाउनलोड गर्नुहोस्
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
