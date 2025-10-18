"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildAstroPrompt } from '@/lib/astro-prompt';
import { HouseMismatchNotice } from './HouseMismatchNotice';

interface VedicAnalysisProps {
  kundaliData: any;
  birthDetails: {
    name: string;
    birthDate: string;
    birthTime: string;
    place: string;
  };
}

export default function VedicAnalysis({ kundaliData, birthDetails }: VedicAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [mismatches, setMismatches] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (kundaliData) {
      analyzeKundali();
    }
  }, [kundaliData]);

  const analyzeKundali = async () => {
    setIsAnalyzing(true);
    try {
      // Normalize the data and build AI prompt
      const { aiInput, mismatches: detectedMismatches } = buildAstroPrompt(kundaliData);
      setMismatches(detectedMismatches);

      // Send to AI analysis API
      const response = await fetch('/api/astrology/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiInput)
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.analysis);
      } else {
        // Fallback: Generate basic analysis locally
        setAnalysis(generateBasicAnalysis(aiInput));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback: Generate basic analysis locally
      const { aiInput } = buildAstroPrompt(kundaliData);
      setAnalysis(generateBasicAnalysis(aiInput));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateBasicAnalysis = (aiInput: any) => {
    const moonPlanet = aiInput.planets.find((p: any) => p.planet === "Moon");
    const moonSign = moonPlanet?.signLabel || "Unknown";

    return {
      lagna: `${aiInput.ascSignLabel} (${aiInput.ascSignId})`,
      moonSign,
      planetPlacements: aiInput.planets.map((p: any) => ({
        planet: p.planet,
        sign: p.signLabel,
        house: p.house,
        description: getPlanetDescription(p.planet, p.signLabel, p.house, aiInput.lang)
      })),
      yogas: aiInput.yogas,
      doshas: aiInput.doshas,
      guidance: generateGuidance(aiInput)
    };
  };

  const getPlanetDescription = (planet: string, sign: string, house: number, lang: string) => {
    const planetNames = {
      Sun: lang === "ne" ? "सूर्य" : "Sun",
      Moon: lang === "ne" ? "चन्द्र" : "Moon", 
      Mars: lang === "ne" ? "मङ्गल" : "Mars",
      Mercury: lang === "ne" ? "बुध" : "Mercury",
      Jupiter: lang === "ne" ? "बृहस्पति" : "Jupiter",
      Venus: lang === "ne" ? "शुक्र" : "Venus",
      Saturn: lang === "ne" ? "शनि" : "Saturn",
      Rahu: lang === "ne" ? "राहु" : "Rahu",
      Ketu: lang === "ne" ? "केतु" : "Ketu"
    };

    const houseNames = {
      1: lang === "ne" ? "लग्न" : "1st",
      2: lang === "ne" ? "धन" : "2nd", 
      3: lang === "ne" ? "सहज" : "3rd",
      4: lang === "ne" ? "सुख" : "4th",
      5: lang === "ne" ? "पुत्र" : "5th",
      6: lang === "ne" ? "रिपु" : "6th",
      7: lang === "ne" ? "विवाह" : "7th",
      8: lang === "ne" ? "आयु" : "8th",
      9: lang === "ne" ? "भाग्य" : "9th",
      10: lang === "ne" ? "कर्म" : "10th",
      11: lang === "ne" ? "लाभ" : "11th",
      12: lang === "ne" ? "व्यय" : "12th"
    };

    const descriptions = {
      Sun: {
        1: lang === "ne" ? "प्रभावशाली व्यक्तित्व, नेतृत्व क्षमता" : "Strong personality, leadership qualities",
        2: lang === "ne" ? "धन सम्पत्ति, वाणी शक्ति" : "Wealth, speech power",
        3: lang === "ne" ? "साहस, भाइबहिनी सम्बन्ध" : "Courage, sibling relationships",
        4: lang === "ne" ? "माता सम्बन्ध, घर-परिवार" : "Mother relationship, home-family",
        5: lang === "ne" ? "बुद्धि, शिक्षा, सन्तान" : "Intelligence, education, children",
        6: lang === "ne" ? "रोग, शत्रु, सेवा" : "Disease, enemies, service",
        7: lang === "ne" ? "विवाह, साझेदारी" : "Marriage, partnership",
        8: lang === "ne" ? "रूपान्तरण, गहिरो अनुसन्धान" : "Transformation, deep research",
        9: lang === "ne" ? "भाग्य, धर्म, गुरु" : "Fortune, religion, guru",
        10: lang === "ne" ? "कर्म, पिता, प्रतिष्ठा" : "Work, father, reputation",
        11: lang === "ne" ? "लाभ, मित्र, आशा" : "Gains, friends, hopes",
        12: lang === "ne" ? "व्यय, विदेश, आध्यात्मिकता" : "Expenses, foreign, spirituality"
      },
      Mars: {
        1: lang === "ne" ? "उर्जा, साहस, आक्रामकता" : "Energy, courage, aggression",
        2: lang === "ne" ? "धन कमाउने क्षमता" : "Money earning ability",
        3: lang === "ne" ? "साहस, भाइबहिनी" : "Courage, siblings",
        4: lang === "ne" ? "घर-जग्गा सम्बन्ध" : "Home-property relationship",
        5: lang === "ne" ? "बुद्धि, सन्तान" : "Intelligence, children",
        6: lang === "ne" ? "रोग, शत्रु पराजय" : "Disease, enemy defeat",
        7: lang === "ne" ? "विवाह, साझेदारी" : "Marriage, partnership",
        8: lang === "ne" ? "आकस्मिक घटना, रूपान्तरण" : "Sudden events, transformation",
        9: lang === "ne" ? "भाग्य, धर्म" : "Fortune, religion",
        10: lang === "ne" ? "कर्म, नेतृत्व" : "Work, leadership",
        11: lang === "ne" ? "लाभ, मित्र" : "Gains, friends",
        12: lang === "ne" ? "व्यय, विदेश" : "Expenses, foreign"
      },
      Saturn: {
        1: lang === "ne" ? "धैर्य, कठिन परिश्रम" : "Patience, hard work",
        2: lang === "ne" ? "धन कमाउने कठिनाई" : "Difficulty earning money",
        3: lang === "ne" ? "भाइबहिनी सम्बन्ध कठिन" : "Difficult sibling relationships",
        4: lang === "ne" ? "माता, घर सम्बन्ध" : "Mother, home relationship",
        5: lang === "ne" ? "सन्तान सम्बन्ध कठिन" : "Difficult children relationship",
        6: lang === "ne" ? "रोग, शत्रु" : "Disease, enemies",
        7: lang === "ne" ? "विवाह विलम्ब" : "Marriage delay",
        8: lang === "ne" ? "आयु, रूपान्तरण" : "Longevity, transformation",
        9: lang === "ne" ? "भाग्य, धर्म" : "Fortune, religion",
        10: lang === "ne" ? "कर्म, प्रतिष्ठा, सफलता" : "Work, reputation, success",
        11: lang === "ne" ? "लाभ, मित्र" : "Gains, friends",
        12: lang === "ne" ? "व्यय, विदेश" : "Expenses, foreign"
      }
    };

    const planetName = planetNames[planet as keyof typeof planetNames] || planet;
    const houseName = houseNames[house as keyof typeof houseNames] || `${house}th`;
    const description = descriptions[planet as keyof typeof descriptions]?.[house as keyof typeof descriptions[typeof planet]] || 
      (lang === "ne" ? "विशेष प्रभाव" : "Special influence");

    return `${planetName} — ${sign} (${houseName} घर): ${description}`;
  };

  const generateGuidance = (aiInput: any) => {
    const lang = aiInput.lang;
    
    if (lang === "ne") {
      return {
        title: "सामान्य सुझाव",
        points: [
          "आफ्नो जन्म समय र स्थान सही छ भनेर निश्चित गर्नुहोस्",
          "ग्रहहरूको स्थिति अनुसार आफ्नो कर्म र धर्म गर्नुहोस्",
          "योग र दोषहरूको बारेमा जानकारी लिनुहोस्",
          "नियमित रूपमा पूजा-पाठ गर्नुहोस्"
        ]
      };
    } else {
      return {
        title: "General Guidance",
        points: [
          "Ensure your birth time and place are accurate",
          "Follow your duties and dharma according to planetary positions",
          "Learn about yogas and doshas in your chart",
          "Perform regular prayers and spiritual practices"
        ]
      };
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {kundaliData?.lang === "ne" ? "वैदिक विश्लेषण गर्दै..." : "Analyzing Vedic chart..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {kundaliData?.lang === "ne" ? "वैदिक ज्योतिष विश्लेषण" : "Vedic Astrology Analysis"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mismatch Notice */}
        <HouseMismatchNotice mismatches={mismatches} />

        {/* Birth Details */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">
            {kundaliData?.lang === "ne" ? "जन्म विवरण" : "Birth Details"}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>{kundaliData?.lang === "ne" ? "नाम:" : "Name:"}</strong> {birthDetails.name}</div>
            <div><strong>{kundaliData?.lang === "ne" ? "लग्न:" : "Ascendant:"}</strong> {analysis.lagna}</div>
            <div><strong>{kundaliData?.lang === "ne" ? "चन्द्र राशि:" : "Moon Sign:"}</strong> {analysis.moonSign}</div>
            <div><strong>{kundaliData?.lang === "ne" ? "जन्म मिति:" : "Birth Date:"}</strong> {birthDetails.birthDate}</div>
          </div>
        </div>

        {/* Planet Placements */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {kundaliData?.lang === "ne" ? "ग्रह स्थिति" : "Planet Placements"}
          </h3>
          <div className="space-y-2">
            {analysis.planetPlacements.map((placement: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">{placement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yogas */}
        {analysis.yogas && analysis.yogas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {kundaliData?.lang === "ne" ? "योग" : "Yogas"}
            </h3>
            <div className="space-y-2">
              {analysis.yogas.map((yoga: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300">{yoga.label}</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {yoga.factors.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doshas */}
        {analysis.doshas && analysis.doshas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {kundaliData?.lang === "ne" ? "दोष" : "Doshas"}
            </h3>
            <div className="space-y-2">
              {analysis.doshas.map((dosha: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-300">{dosha.label}</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {dosha.factors.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidance */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{analysis.guidance.title}</h3>
          <ul className="space-y-2">
            {analysis.guidance.points.map((point: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
