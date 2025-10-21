'use client';

import { useState } from 'react';
import { Sun, Moon, Star, Download, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n/context';

const rashis = {
  en: [
    { name: 'Aries', icon: '♈', color: 'from-red-500 to-pink-500', summary: 'Today is auspicious for you.' },
    { name: 'Taurus', icon: '♉', color: 'from-green-500 to-emerald-500', summary: 'Be patient, success will come.' },
    { name: 'Gemini', icon: '♊', color: 'from-yellow-500 to-orange-500', summary: 'Day of communication, new relationships will form.' },
    { name: 'Cancer', icon: '♋', color: 'from-blue-500 to-cyan-500', summary: 'Pay attention to family matters.' },
    { name: 'Leo', icon: '♌', color: 'from-orange-500 to-red-500', summary: 'Increase self-confidence, opportunities will come.' },
    { name: 'Virgo', icon: '♍', color: 'from-green-500 to-teal-500', summary: 'Pay attention to details, success will be found.' },
    { name: 'Libra', icon: '♎', color: 'from-pink-500 to-purple-500', summary: 'Maintain balance, make decisions.' },
    { name: 'Scorpio', icon: '♏', color: 'from-red-500 to-purple-500', summary: 'Day of deep thought, change will come.' },
    { name: 'Sagittarius', icon: '♐', color: 'from-purple-500 to-indigo-500', summary: 'Day of travel and knowledge, new experiences.' },
    { name: 'Capricorn', icon: '♑', color: 'from-gray-500 to-slate-500', summary: 'Focus on work, progress will be made.' },
    { name: 'Aquarius', icon: '♒', color: 'from-cyan-500 to-blue-500', summary: 'Day of innovative ideas, social work.' },
    { name: 'Pisces', icon: '♓', color: 'from-blue-500 to-purple-500', summary: 'Emotional day, increase creativity.' }
  ],
  ne: [
    { name: 'मेष (Aries)', icon: '♈', color: 'from-red-500 to-pink-500', summary: 'आज तपाईंको दिन शुभ छ।' },
    { name: 'वृष (Taurus)', icon: '♉', color: 'from-green-500 to-emerald-500', summary: 'धैर्य राख्नुहोस्, सफलता आउनेछ।' },
    { name: 'मिथुन (Gemini)', icon: '♊', color: 'from-yellow-500 to-orange-500', summary: 'संवादको दिन, नयाँ सम्बन्ध बन्नेछ।' },
    { name: 'कर्क (Cancer)', icon: '♋', color: 'from-blue-500 to-cyan-500', summary: 'पारिवारिक मामिलामा ध्यान दिनुहोस्।' },
    { name: 'सिंह (Leo)', icon: '♌', color: 'from-orange-500 to-red-500', summary: 'आत्मविश्वास बढाउनुहोस्, अवसर आउनेछ।' },
    { name: 'कन्या (Virgo)', icon: '♍', color: 'from-green-500 to-teal-500', summary: 'विवरणमा ध्यान दिनुहोस्, सफलता मिल्नेछ।' },
    { name: 'तुला (Libra)', icon: '♎', color: 'from-pink-500 to-purple-500', summary: 'सन्तुलन बनाउनुहोस्, निर्णय लिनुहोस्।' },
    { name: 'वृश्चिक (Scorpio)', icon: '♏', color: 'from-red-500 to-purple-500', summary: 'गहिरो सोचाइको दिन, परिवर्तन आउनेछ।' },
    { name: 'धनु (Sagittarius)', icon: '♐', color: 'from-purple-500 to-indigo-500', summary: 'यात्रा र ज्ञानको दिन, नयाँ अनुभव।' },
    { name: 'मकर (Capricorn)', icon: '♑', color: 'from-gray-500 to-slate-500', summary: 'काममा ध्यान दिनुहोस्, उन्नति हुनेछ।' },
    { name: 'कुम्भ (Aquarius)', icon: '♒', color: 'from-cyan-500 to-blue-500', summary: 'नवीनतम विचारको दिन, सामाजिक कार्य।' },
    { name: 'मीन (Pisces)', icon: '♓', color: 'from-blue-500 to-purple-500', summary: 'भावनात्मक दिन, कल्पनाशीलता बढाउनुहोस्।' }
  ],
  hi: [
    { name: 'मेष (Aries)', icon: '♈', color: 'from-red-500 to-pink-500', summary: 'आज आपका लिए शुभ दिन है।' },
    { name: 'वृष (Taurus)', icon: '♉', color: 'from-green-500 to-emerald-500', summary: 'धैर्य रखें, सफलता मिलेगी।' },
    { name: 'मिथुन (Gemini)', icon: '♊', color: 'from-yellow-500 to-orange-500', summary: 'संवाद का दिन, नए रिश्ते बनेंगे।' },
    { name: 'कर्क (Cancer)', icon: '♋', color: 'from-blue-500 to-cyan-500', summary: 'पारिवारिक मामलों पर ध्यान दें।' },
    { name: 'सिंह (Leo)', icon: '♌', color: 'from-orange-500 to-red-500', summary: 'आत्मविश्वास बढ़ाएं, अवसर मिलेंगे।' },
    { name: 'कन्या (Virgo)', icon: '♍', color: 'from-green-500 to-teal-500', summary: 'विवरण पर ध्यान दें, सफलता मिलेगी।' },
    { name: 'तुला (Libra)', icon: '♎', color: 'from-pink-500 to-purple-500', summary: 'संतुलन बनाएं, निर्णय लें।' },
    { name: 'वृश्चिक (Scorpio)', icon: '♏', color: 'from-red-500 to-purple-500', summary: 'गहरी सोच का दिन, परिवर्तन आएगा।' },
    { name: 'धनु (Sagittarius)', icon: '♐', color: 'from-purple-500 to-indigo-500', summary: 'यात्रा और ज्ञान का दिन, नए अनुभव।' },
    { name: 'मकर (Capricorn)', icon: '♑', color: 'from-gray-500 to-slate-500', summary: 'काम पर ध्यान दें, प्रगति होगी।' },
    { name: 'कुम्भ (Aquarius)', icon: '♒', color: 'from-cyan-500 to-blue-500', summary: 'नवीन विचारों का दिन, सामाजिक कार्य।' },
    { name: 'मीन (Pisces)', icon: '♓', color: 'from-blue-500 to-purple-500', summary: 'भावनात्मक दिन, रचनात्मकता बढ़ाएं।' }
  ]
};

const detailedHoroscope = {
  'मेष (Aries)': {
    general: 'आज तपाईंको दिन अत्यन्त शुभ छ। नयाँ परियोजनाहरू सुरु गर्नको लागि उत्तम दिन हो।',
    love: 'प्रेम सम्बन्धमा नयाँ उत्साह आउनेछ।',
    career: 'काममा नयाँ अवसर प्राप्त हुनेछ।',
    health: 'स्वास्थ्य राम्रो रहनेछ, व्यायाम गर्नुहोस्।',
    luckyNumber: 7,
    luckyColor: 'रातो',
    luckyTime: '10:00 AM - 12:00 PM'
  }
};

export default function DailyHoroscopePage() {
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { language, t } = useTranslations();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    // PDF generation logic here
    setTimeout(() => {
      setIsGeneratingPDF(false);
    }, 2000);
  };

  // Get current language data
  const currentRashis = rashis[language] || rashis.ne;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sun className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {t('dailyHoroscope')}
            </h1>
            <Moon className="w-8 h-8 text-blue-500 ml-3" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {t('aiPoweredHoroscope')}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US')}</span>
          </div>
        </div>

        {/* Rashi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {currentRashis.map((rashi, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg"
              onClick={() => setSelectedRashi(rashi.name)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${rashi.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{rashi.icon}</span>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rashi.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  {rashi.summary}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {t('details')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed View */}
        {selectedRashi && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedRashi} - विस्तृत राशिफल
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRashi(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">सामान्य</TabsTrigger>
                  <TabsTrigger value="love">प्रेम</TabsTrigger>
                  <TabsTrigger value="career">करियर</TabsTrigger>
                  <TabsTrigger value="health">स्वास्थ्य</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.general || 'विस्तृत जानकारी उपलब्ध छैन।'}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="love" className="mt-6">
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-lg p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.love || 'प्रेम सम्बन्धको जानकारी उपलब्ध छैन।'}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="career" className="mt-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.career || 'करियरको जानकारी उपलब्ध छैन।'}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="health" className="mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.health || 'स्वास्थ्यको जानकारी उपलब्ध छैन।'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Lucky Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.luckyNumber || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">भाग्यशाली नम्बर</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.luckyColor || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">भाग्यशाली रङ</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {detailedHoroscope[selectedRashi as keyof typeof detailedHoroscope]?.luckyTime || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">भाग्यशाली समय</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Download Button */}
        <div className="text-center">
          <Button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGeneratingPDF ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                PDF बनाइरहेको...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                सबै राशिफल PDF मा डाउनलोड गर्नुहोस्
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
