"use client";
import { EvidenceBundle, EvidenceCard, Lang } from '@/lib/extract/types';
import { assessEvidenceQuality } from '@/lib/llm/prompt-vision';

interface EvidenceCardsProps {
  bundle: EvidenceBundle;
  className?: string;
  showDebug?: boolean;
}

export default function EvidenceCards({ bundle, className = "", showDebug = false }: EvidenceCardsProps) {
  const { cards, lang } = bundle;
  const quality = assessEvidenceQuality(bundle);
  
  // Group cards by type
  const chinCards = cards.filter(card => card.type === 'chin');
  const palmCards = cards.filter(card => card.type === 'palm');
  const docCards = cards.filter(card => card.type === 'document');
  
  const getQualityColor = (overall: string) => {
    switch (overall) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getWarningColor = (type: string) => {
    switch (type) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {lang === 'ne' ? 'Evidence कार्डहरू' : 'Evidence Cards'}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(quality.overall)}`}>
            {lang === 'ne' ? `गुणस्तर: ${quality.overall}` : `Quality: ${quality.overall}`}
          </span>
          {showDebug && (
            <span className="text-xs text-gray-500">
              {cards.length} {lang === 'ne' ? 'कार्डहरू' : 'cards'}
            </span>
          )}
        </div>
      </div>
      
      {/* Quality Issues */}
      {quality.issues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            {lang === 'ne' ? 'गुणस्तर समस्याहरू' : 'Quality Issues'}
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {quality.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
          {quality.recommendations.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-yellow-800 mb-1">
                {lang === 'ne' ? 'सुझावहरू' : 'Recommendations'}
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Chin Cards */}
      {chinCards.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'चिन विश्लेषण' : 'Chin Analysis'}
          </h3>
          <div className="grid gap-4">
            {chinCards.map((card, index) => (
              <ChinCard key={index} card={card} lang={lang} />
            ))}
          </div>
        </div>
      )}
      
      {/* Palm Cards */}
      {palmCards.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'हातको रेखा विश्लेषण' : 'Palm Reading Analysis'}
          </h3>
          <div className="grid gap-4">
            {palmCards.map((card, index) => (
              <PalmCard key={index} card={card} lang={lang} />
            ))}
          </div>
        </div>
      )}
      
      {/* Document Cards */}
      {docCards.length > 0 && (
        <div className="rounded-2xl shadow-lg p-6 bg-white">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'कागजात विश्लेषण' : 'Document Analysis'}
          </h3>
          <div className="grid gap-4">
            {docCards.map((card, index) => (
              <DocumentCard key={index} card={card} lang={lang} />
            ))}
          </div>
        </div>
      )}
      
      {/* Debug JSON */}
      {showDebug && (
        <div className="rounded-2xl shadow-lg p-6 bg-gray-100">
          <h3 className="font-semibold mb-4 text-lg">
            {lang === 'ne' ? 'डिबग जानकारी' : 'Debug Information'}
          </h3>
          <pre className="text-xs overflow-auto max-h-96 border rounded p-3 bg-white">
            {JSON.stringify(bundle, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Chin Card Component
function ChinCard({ card, lang }: { card: EvidenceCard; lang: Lang }) {
  const { chin } = card;
  if (!chin) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{card.title}</h4>
        <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(chin.confidence || 0)}`}>
          {lang === 'ne' ? `विश्वास: ${Math.round((chin.confidence || 0) * 100)}%` : `Confidence: ${Math.round((chin.confidence || 0) * 100)}%`}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {chin.jawAngleDeg && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'जबडा कोण' : 'Jaw Angle'}:
            </span>
            <div className="font-medium">{chin.jawAngleDeg}°</div>
          </div>
        )}
        {chin.chinWidthPct && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'चौडाइ' : 'Width'}:
            </span>
            <div className="font-medium">{chin.chinWidthPct.toFixed(1)}%</div>
          </div>
        )}
        {chin.chinDepthPct && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'गहिराइ' : 'Depth'}:
            </span>
            <div className="font-medium">{chin.chinDepthPct.toFixed(1)}%</div>
          </div>
        )}
        {chin.dimpleLikely !== undefined && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'डिम्पल' : 'Dimple'}:
            </span>
            <div className="font-medium">
              {chin.dimpleLikely ? (lang === 'ne' ? 'हो' : 'Yes') : (lang === 'ne' ? 'होइन' : 'No')}
            </div>
          </div>
        )}
        {chin.beardCoverage && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'दाढी' : 'Beard'}:
            </span>
            <div className="font-medium capitalize">{chin.beardCoverage}</div>
          </div>
        )}
        {chin.lightingOk !== undefined && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'प्रकाश' : 'Lighting'}:
            </span>
            <div className="font-medium">
              {chin.lightingOk ? (lang === 'ne' ? 'राम्रो' : 'Good') : (lang === 'ne' ? 'खराब' : 'Poor')}
            </div>
          </div>
        )}
      </div>
      
      {card.warnings && card.warnings.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-amber-600">
            {lang === 'ne' ? 'चेतावनीहरू' : 'Warnings'}:
          </div>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            {card.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Palm Card Component
function PalmCard({ card, lang }: { card: EvidenceCard; lang: Lang }) {
  const { palm } = card;
  if (!palm) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{card.title}</h4>
        <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(palm.confidence || 0)}`}>
          {lang === 'ne' ? `विश्वास: ${Math.round((palm.confidence || 0) * 100)}%` : `Confidence: ${Math.round((palm.confidence || 0) * 100)}%`}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-gray-600">
            {lang === 'ne' ? 'रेखा गुणस्तर' : 'Line Quality'}:
          </span>
          <div className={`font-medium capitalize ${getWarningColor(palm.lineQuality)} px-2 py-1 rounded text-xs`}>
            {palm.lineQuality}
          </div>
        </div>
        {palm.heartLineShape && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'हृदय रेखा' : 'Heart Line'}:
            </span>
            <div className="font-medium capitalize">{palm.heartLineShape}</div>
          </div>
        )}
        {palm.headLineShape && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'मस्तिष्क रेखा' : 'Head Line'}:
            </span>
            <div className="font-medium capitalize">{palm.headLineShape}</div>
          </div>
        )}
        {palm.lifeLineShape && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'जीवन रेखा' : 'Life Line'}:
            </span>
            <div className="font-medium capitalize">{palm.lifeLineShape}</div>
          </div>
        )}
        {palm.fateLinePresent !== undefined && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'भाग्य रेखा' : 'Fate Line'}:
            </span>
            <div className="font-medium">
              {palm.fateLinePresent ? (lang === 'ne' ? 'हो' : 'Yes') : (lang === 'ne' ? 'होइन' : 'No')}
            </div>
          </div>
        )}
        {palm.mountsStrong && palm.mountsStrong.length > 0 && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'बलियो पर्वत' : 'Strong Mounts'}:
            </span>
            <div className="font-medium">{palm.mountsStrong.join(', ')}</div>
          </div>
        )}
        {palm.handednessGuess && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'हात' : 'Hand'}:
            </span>
            <div className="font-medium capitalize">{palm.handednessGuess}</div>
          </div>
        )}
      </div>
      
      {card.warnings && card.warnings.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-amber-600">
            {lang === 'ne' ? 'चेतावनीहरू' : 'Warnings'}:
          </div>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            {card.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Document Card Component
function DocumentCard({ card, lang }: { card: EvidenceCard; lang: Lang }) {
  const { doc } = card;
  if (!doc) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{card.title}</h4>
        <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(doc.confidence || 0)}`}>
          {lang === 'ne' ? `विश्वास: ${Math.round((doc.confidence || 0) * 100)}%` : `Confidence: ${Math.round((doc.confidence || 0) * 100)}%`}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-600">
            {lang === 'ne' ? 'पृष्ठ' : 'Pages'}:
          </span>
          <div className="font-medium">{doc.pages}</div>
        </div>
        <div>
          <span className="text-gray-600">
            {lang === 'ne' ? 'पाठ लम्बाइ' : 'Text Length'}:
          </span>
          <div className="font-medium">{doc.ocrText.length} {lang === 'ne' ? 'अक्षर' : 'chars'}</div>
        </div>
        {doc.language && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'भाषा' : 'Language'}:
            </span>
            <div className="font-medium uppercase">{doc.language}</div>
          </div>
        )}
        {doc.hasTables !== undefined && (
          <div>
            <span className="text-gray-600">
              {lang === 'ne' ? 'तालिका' : 'Tables'}:
            </span>
            <div className="font-medium">
              {doc.hasTables ? (lang === 'ne' ? 'हो' : 'Yes') : (lang === 'ne' ? 'होइन' : 'No')}
            </div>
          </div>
        )}
      </div>
      
      {doc.containsDates && doc.containsDates.length > 0 && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">
            {lang === 'ne' ? 'पाइएका मितिहरू' : 'Dates Found'}:
          </span>
          <div className="text-sm font-medium mt-1">
            {doc.containsDates.join(', ')}
          </div>
        </div>
      )}
      
      {doc.ocrText && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">
            {lang === 'ne' ? 'निकालिएको पाठ' : 'Extracted Text'}:
          </span>
          <div className="text-sm bg-gray-50 rounded p-2 mt-1 max-h-32 overflow-y-auto">
            {doc.ocrText.substring(0, 500)}
            {doc.ocrText.length > 500 && '...'}
          </div>
        </div>
      )}
      
      {card.warnings && card.warnings.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-amber-600">
            {lang === 'ne' ? 'चेतावनीहरू' : 'Warnings'}:
          </div>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            {card.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-600 bg-green-100';
  if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

function getWarningColor(type: string): string {
  switch (type) {
    case 'low': return 'text-red-600 bg-red-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}
