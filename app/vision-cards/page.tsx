// app/vision-cards/page.tsx
// Test page for vision cards system

"use client";
import { useState } from 'react';
import UploadBar from '@/components/chat/UploadBar';
import AttachmentChips from '@/components/chat/AttachmentChips';
import EvidenceCards from '@/components/cards/EvidenceCards';
import { FileRef, EvidenceBundle, Lang } from '@/lib/extract/types';

export default function VisionCardsPage() {
  const [lang, setLang] = useState<Lang>('ne');
  const [uploadedFiles, setUploadedFiles] = useState<FileRef[]>([]);
  const [evidenceBundle, setEvidenceBundle] = useState<EvidenceBundle | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [question, setQuestion] = useState<string>('');

  const handleFilesUploaded = (files: FileRef[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFilesRemoved = (fileIds: string[]) => {
    setUploadedFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
  };

  const handleExtractEvidence = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploadedFiles, lang })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEvidenceBundle(result.bundle);
      } else {
        console.error('Extraction failed:', result.errors);
      }
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!evidenceBundle) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          lang,
          evidenceBundle
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        console.error('Analysis failed:', result.errors);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Vision Cards System
            </h1>
            <p className="text-lg text-gray-600">
              Upload images and PDFs for evidence-based astrological analysis
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
          
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {lang === 'ne' ? 'फाइलहरू अपलोड गर्नुहोस्' : 'Upload Files'}
            </h2>
            <UploadBar
              onFilesUploaded={handleFilesUploaded}
              onFilesRemoved={handleFilesRemoved}
              lang={lang}
              maxFiles={5}
              maxSize={20}
            />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <AttachmentChips
                  files={uploadedFiles}
                  onRemove={(fileId) => handleFilesRemoved([fileId])}
                  lang={lang}
                />
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleExtractEvidence}
                    disabled={isExtracting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExtracting 
                      ? (lang === 'ne' ? 'विश्लेषण हुँदै...' : 'Extracting...')
                      : (lang === 'ne' ? 'Evidence निकाल्नुहोस्' : 'Extract Evidence')
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Evidence Cards */}
          {evidenceBundle && (
            <div className="mb-6">
              <EvidenceCards bundle={evidenceBundle} showDebug={true} />
            </div>
          )}
          
          {/* Analysis Section */}
          {evidenceBundle && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {lang === 'ne' ? 'विश्लेषण' : 'Analysis'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ne' ? 'तपाईंको प्रश्न' : 'Your Question'}
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={lang === 'ne' 
                      ? 'तपाईंको ज्योतिष प्रश्न यहाँ लेख्नुहोस्...'
                      : 'Enter your astrology question here...'
                    }
                  />
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !question.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing 
                    ? (lang === 'ne' ? 'विश्लेषण हुँदै...' : 'Analyzing...')
                    : (lang === 'ne' ? 'विश्लेषण गर्नुहोस्' : 'Analyze')
                  }
                </button>
                
                {analysis && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">
                      {lang === 'ne' ? 'विश्लेषण परिणाम' : 'Analysis Result'}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {analysis}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
