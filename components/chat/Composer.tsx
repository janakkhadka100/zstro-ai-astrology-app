"use client";
import { useState, useRef } from 'react';
import { AstroData, Lang } from '@/lib/astrology/types';
import { getDataNeededMessage, getDataUpdatedMessage } from '@/lib/llm/missing-detector';

interface ComposerProps {
  cards: AstroData;
  lang: Lang;
  onAnalysis?: (analysis: string, cardsUpdated: boolean) => void;
  className?: string;
}

export default function Composer({ 
  cards, 
  lang, 
  onAnalysis,
  className = "" 
}: ComposerProps) {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [dataNeeded, setDataNeeded] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [cardsUpdated, setCardsUpdated] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis('');
    setDataNeeded([]);
    setCardsUpdated(false);
    setWarnings([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: question,
          lang,
          cards,
          fetchMissing: true
        })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        setWarnings(result.warnings || []);
        
        if (result.dataNeeded && result.dataNeeded.length > 0) {
          setDataNeeded(result.dataNeeded);
          setIsFetching(true);
          
          // Show data needed message
          const message = getDataNeededMessage(lang, result.dataNeeded);
          console.log(message);
          
          // In a real implementation, you would fetch the missing data here
          // For now, we'll just show the message
          setTimeout(() => {
            setIsFetching(false);
            setCardsUpdated(result.cardsUpdated || false);
            
            if (result.cardsUpdated) {
              const updatedMessage = getDataUpdatedMessage(lang);
              console.log(updatedMessage);
            }
          }, 2000);
        } else {
          setCardsUpdated(result.cardsUpdated || false);
        }
        
        onAnalysis?.(result.analysis, result.cardsUpdated || false);
      } else {
        setWarnings(result.errors || ['Analysis failed']);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setWarnings(['Network error. Please try again.']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const placeholder = lang === 'ne' 
    ? 'तपाईंको ज्योतिष प्रश्न यहाँ लेख्नुहोस्... (Ctrl+Enter to send)'
    : 'Enter your astrology question here... (Ctrl+Enter to send)';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Question Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isAnalyzing}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {question.length}/500
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {lang === 'ne' 
              ? 'कार्डहरू: D1, योग, दोष, दशा, शड्बल'
              : 'Cards: D1, Yogas, Doshas, Dashas, Shadbala'
            }
          </div>
          
          <button
            type="submit"
            disabled={!question.trim() || isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {lang === 'ne' ? 'विश्लेषण हुँदै...' : 'Analyzing...'}
              </>
            ) : (
              lang === 'ne' ? 'विश्लेषण गर्नुहोस्' : 'Analyze'
            )}
          </button>
        </div>
      </form>

      {/* Data Needed Banner */}
      {dataNeeded.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <div className="text-sm text-yellow-800">
              {isFetching 
                ? getDataNeededMessage(lang, dataNeeded)
                : (lang === 'ne' ? 'डेटा तान्न सकिएन' : 'Could not fetch data')
              }
            </div>
          </div>
        </div>
      )}

      {/* Cards Updated Banner */}
      {cardsUpdated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="text-sm text-green-800">
              {getDataUpdatedMessage(lang)}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-800">
            {lang === 'ne' ? 'चेतावनीहरू' : 'Warnings'}:
          </div>
          <ul className="text-xs text-red-700 mt-1 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'विश्लेषण परिणाम' : 'Analysis Result'}
          </h3>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </pre>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 text-sm">
          {lang === 'ne' ? 'द्रुत प्रश्नहरू' : 'Quick Questions'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {lang === 'ne' ? (
            <>
              <button
                onClick={() => setQuestion('मेरो मुख्य योग र दोष के के छन्?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                मेरो मुख्य योग र दोष के के छन्?
              </button>
              <button
                onClick={() => setQuestion('मेरो वर्तमान दशा कस्तो छ?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                मेरो वर्तमान दशा कस्तो छ?
              </button>
              <button
                onClick={() => setQuestion('मेरो करियर कस्तो हुनेछ?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                मेरो करियर कस्तो हुनेछ?
              </button>
              <button
                onClick={() => setQuestion('मेरो विवाह कहिले हुनेछ?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                मेरो विवाह कहिले हुनेछ?
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setQuestion('What are my main yogas and doshas?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                What are my main yogas and doshas?
              </button>
              <button
                onClick={() => setQuestion('How is my current dasha period?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                How is my current dasha period?
              </button>
              <button
                onClick={() => setQuestion('How will my career be?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                How will my career be?
              </button>
              <button
                onClick={() => setQuestion('When will I get married?')}
                className="text-left p-2 text-sm bg-white rounded border hover:bg-gray-50"
              >
                When will I get married?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
