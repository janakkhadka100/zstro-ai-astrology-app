// app/astro-on-demand/page.tsx
// Test page for cards-first on-demand astrology system

"use client";
import { useState } from 'react';
import AstroCardsOnDemand from '@/components/astro/AstroCardsOnDemand';
import Composer from '@/components/chat/Composer';
import { AstroData, Lang } from '@/lib/astrology/types';

export default function AstroOnDemandPage() {
  const [lang, setLang] = useState<Lang>('ne');
  const [cards, setCards] = useState<AstroData | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleCardsUpdate = (updatedCards: AstroData) => {
    setCards(updatedCards);
  };

  const handleAnalysis = (analysis: string, cardsUpdated: boolean) => {
    console.log('Analysis completed:', { analysis, cardsUpdated });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Cards-First On-Demand Astrology
            </h1>
            <p className="text-lg text-gray-600">
              Account-based cards with intelligent data fetching
            </p>
          </div>
          
          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setLang('ne')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lang === 'ne' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                नेपाली
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lang === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Debug Toggle */}
          <div className="flex justify-center mb-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
                className="rounded"
              />
              {lang === 'ne' ? 'डिबग मोड' : 'Debug Mode'}
            </label>
          </div>
          
          {/* Cards Section */}
          <div className="mb-8">
            <AstroCardsOnDemand
              lang={lang}
              showDebug={showDebug}
              onCardsUpdate={handleCardsUpdate}
            />
          </div>
          
          {/* Chat Section */}
          {cards && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">
                {lang === 'ne' ? 'ज्योतिष च्याट' : 'Astrology Chat'}
              </h2>
              <Composer
                cards={cards}
                lang={lang}
                onAnalysis={handleAnalysis}
              />
            </div>
          )}

          {/* System Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              {lang === 'ne' ? 'सिस्टम जानकारी' : 'System Information'}
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              {lang === 'ne' ? (
                <>
                  <p>• <strong>कार्ड-पहिलो:</strong> साइनअप/लगइन पछि तुरुन्त कार्डहरू देखिन्छन्</p>
                  <p>• <strong>स्रोत सत्य:</strong> सबै विश्लेषण कार्डहरूमा आधारित</p>
                  <p>• <strong>ओन-डिमान्ड:</strong> आवश्यक डेटा मात्र Prokerala बाट तानिन्छ</p>
                  <p>• <strong>बुद्धिमान:</strong> प्रश्नको आधारमा स्वचालित डेटा फेच</p>
                  <p>• <strong>द्विभाषी:</strong> नेपाली र अंग्रेजी समर्थन</p>
                </>
              ) : (
                <>
                  <p>• <strong>Cards-First:</strong> Cards appear immediately after signup/login</p>
                  <p>• <strong>Source of Truth:</strong> All analysis based on cards only</p>
                  <p>• <strong>On-Demand:</strong> Only required data fetched from Prokerala</p>
                  <p>• <strong>Intelligent:</strong> Automatic data fetching based on questions</p>
                  <p>• <strong>Bilingual:</strong> Full Nepali and English support</p>
                </>
              )}
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">
              {lang === 'ne' ? 'परीक्षण परिदृश्यहरू' : 'Test Scenarios'}
            </h3>
            <div className="text-sm text-green-800 space-y-2">
              {lang === 'ne' ? (
                <>
                  <p><strong>1. बेसिक कार्ड:</strong> साइनअप पछि D1, योग, दोष, दशा देखिन्छ</p>
                  <p><strong>2. अन्तरदशा:</strong> "अन्तरदशा टाइमलाइन?" → Vimshottari antar फेच</p>
                  <p><strong>3. नवांश:</strong> "नवांशमा शुक्र कता?" → D9 चार्ट फेच</p>
                  <p><strong>4. शड्बल:</strong> "शड्बलका घटक?" → विस्तृत शड्बल फेच</p>
                  <p><strong>5. योग विवरण:</strong> "राजयोग विवरण?" → विस्तृत योग फेच</p>
                </>
              ) : (
                <>
                  <p><strong>1. Basic Cards:</strong> D1, Yogas, Doshas, Dashas visible after signup</p>
                  <p><strong>2. Antardasha:</strong> "Antardasha timeline?" → Fetches Vimshottari antar</p>
                  <p><strong>3. Navamsa:</strong> "Where is Venus in Navamsa?" → Fetches D9 chart</p>
                  <p><strong>4. Shadbala:</strong> "Shadbala components?" → Fetches detailed Shadbala</p>
                  <p><strong>5. Yoga Details:</strong> "Rajyoga details?" → Fetches detailed Yogas</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
