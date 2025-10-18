// app/api/export/pdf/route.ts
// PDF export API for astrology analysis

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/config/features';
import { createSecurityMiddleware, SECURITY_CONFIGS, secureResponse } from '@/lib/security/middleware';
import { ExportRequestSchema } from '@/lib/security/validators';

export const runtime = 'nodejs';

interface ExportRequest {
  sessionId?: string;
  analysis: string;
  cards: any; // AstroData
  title?: string;
  lang: 'ne' | 'en';
  includeCharts?: boolean;
  includeSnapshots?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware(SECURITY_CONFIGS.export);
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // Check if export feature is enabled
    if (!isFeatureEnabled('export')) {
      return NextResponse.json(
        { success: false, errors: ['Export feature is disabled'] },
        { status: 403 }
      );
    }

    const body = await req.json() as ExportRequest;
    const { sessionId, analysis, cards, title, lang, includeCharts = false, includeSnapshots = false } = body;

    // Validate request
    if (!analysis || !cards) {
      return NextResponse.json(
        { success: false, errors: ['Analysis and cards data are required'] },
        { status: 400 }
      );
    }

    if (!lang || !['ne', 'en'].includes(lang)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid language. Must be "ne" or "en"'] },
        { status: 400 }
      );
    }

    // Generate PDF content
    const pdfContent = await generatePdfContent({
      analysis,
      cards,
      title: title || (lang === 'ne' ? 'ज्योतिष विश्लेषण' : 'Astrology Analysis'),
      lang,
      includeCharts,
      includeSnapshots,
    });

    // For now, return the HTML content that would be converted to PDF
    // In a real implementation, this would use @react-pdf/renderer or playwright
    const response = {
      success: true,
      data: {
        html: pdfContent,
        title: title || (lang === 'ne' ? 'ज्योतिष विश्लेषण' : 'Astrology Analysis'),
        sessionId,
        generatedAt: new Date().toISOString(),
      }
    };

    const responseObj = NextResponse.json(response, { status: 200 });
    return secureResponse(responseObj, {
      cache: 'public-long'
    });

  } catch (error) {
    console.error('PDF export API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Internal server error'] 
      },
      { status: 500 }
    );
  }
}

async function generatePdfContent({
  analysis,
  cards,
  title,
  lang,
  includeCharts,
  includeSnapshots,
}: {
  analysis: string;
  cards: any;
  title: string;
  lang: 'ne' | 'en';
  includeCharts: boolean;
  includeSnapshots: boolean;
}): Promise<string> {
  const isNepali = lang === 'ne';
  
  // Generate HTML content for PDF conversion
  const html = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: ${isNepali ? 'Noto Sans Devanagari, Arial, sans-serif' : 'Arial, sans-serif'};
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          color: #2c3e50;
        }
        .header .subtitle {
          margin-top: 10px;
          color: #7f8c8d;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .section h3 {
          color: #34495e;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .card {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .card h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }
        .planet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .planet-item {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          text-align: center;
        }
        .planet-name {
          font-weight: bold;
          color: #2c3e50;
        }
        .planet-details {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }
        .yoga-list, .dosha-list {
          list-style: none;
          padding: 0;
        }
        .yoga-list li, .dosha-list li {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 8px;
        }
        .yoga-list li {
          border-left: 4px solid #28a745;
        }
        .dosha-list li {
          border-left: 4px solid #dc3545;
        }
        .analysis {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }
        .analysis h3 {
          margin-top: 0;
          color: #1976d2;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
        }
        .timestamp {
          color: #6c757d;
          font-size: 12px;
          margin-bottom: 20px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">
          ${isNepali ? 'ज्योतिष विश्लेषण रिपोर्ट' : 'Astrology Analysis Report'}
        </div>
        <div class="timestamp">
          ${isNepali ? 'तयार गरिएको मिति' : 'Generated on'}: ${new Date().toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US')}
        </div>
      </div>

      ${generateCardsSection(cards, isNepali)}
      
      <div class="section">
        <h2>${isNepali ? 'विश्लेषण' : 'Analysis'}</h2>
        <div class="analysis">
          <h3>${isNepali ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}</h3>
          <div style="white-space: pre-wrap;">${analysis}</div>
        </div>
      </div>

      ${includeCharts ? generateChartsSection(cards, isNepali) : ''}
      
      ${includeSnapshots ? generateSnapshotsSection(cards, isNepali) : ''}

      <div class="footer">
        <p>${isNepali ? 'यो रिपोर्ट ZSTRO AI ज्योतिष सहायक द्वारा तयार गरिएको हो।' : 'This report was generated by ZSTRO AI Astrology Assistant.'}</p>
        <p>${isNepali ? 'अधिक जानकारीको लागि: https://zstro.ai' : 'For more information: https://zstro.ai'}</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

function generateCardsSection(cards: any, isNepali: boolean): string {
  return `
    <div class="section">
      <h2>${isNepali ? 'ज्योतिष कार्डहरू' : 'Astrology Cards'}</h2>
      
      <h3>${isNepali ? 'ग्रहहरू (D1)' : 'Planets (D1)'}</h3>
      <div class="planet-grid">
        ${cards.d1?.map((planet: any) => `
          <div class="planet-item">
            <div class="planet-name">${planet.planet}${planet.retro ? ' (R)' : ''}</div>
            <div class="planet-details">
              ${isNepali ? 'राशि' : 'Sign'}: ${planet.signLabel} (#${planet.signId})<br>
              ${isNepali ? 'घर' : 'House'}: H${planet.house}
            </div>
          </div>
        `).join('') || ''}
      </div>

      <h3>${isNepali ? 'योगहरू' : 'Yogas'}</h3>
      <ul class="yoga-list">
        ${cards.yogas?.map((yoga: any) => `
          <li>
            <strong>${yoga.label}</strong>
            ${yoga.factors && yoga.factors.length > 0 ? `<br><small>${isNepali ? 'कारक' : 'Factors'}: ${yoga.factors.join(', ')}</small>` : ''}
          </li>
        `).join('') || '<li>' + (isNepali ? 'कुनै योग फेला परेन' : 'No yogas found') + '</li>'}
      </ul>

      <h3>${isNepali ? 'दोषहरू' : 'Doshas'}</h3>
      <ul class="dosha-list">
        ${cards.doshas?.map((dosha: any) => `
          <li>
            <strong>${dosha.label}</strong>
            ${dosha.factors && dosha.factors.length > 0 ? `<br><small>${isNepali ? 'कारक' : 'Factors'}: ${dosha.factors.join(', ')}</small>` : ''}
          </li>
        `).join('') || '<li>' + (isNepali ? 'कुनै दोष फेला परेन' : 'No doshas found') + '</li>'}
      </ul>

      ${cards.shadbala && cards.shadbala.length > 0 ? `
        <h3>${isNepali ? 'षड्बल' : 'Shadbala'}</h3>
        <div class="planet-grid">
          ${cards.shadbala.map((shadbala: any) => `
            <div class="planet-item">
              <div class="planet-name">${shadbala.planet}</div>
              <div class="planet-details">
                ${isNepali ? 'मान' : 'Value'}: ${shadbala.value}${shadbala.unit ? ' ' + shadbala.unit : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${cards.dashas && cards.dashas.length > 0 ? `
        <h3>${isNepali ? 'दशा' : 'Dashas'}</h3>
        <div class="card">
          ${cards.dashas.map((dasha: any) => `
            <div style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px;">
              <strong>${dasha.system} - ${dasha.level} - ${dasha.planet}</strong><br>
              <small>${new Date(dasha.from).toLocaleDateString()} - ${new Date(dasha.to).toLocaleDateString()}</small>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function generateChartsSection(cards: any, isNepali: boolean): string {
  return `
    <div class="section">
      <h2>${isNepali ? 'चार्टहरू' : 'Charts'}</h2>
      <div class="card">
        <p>${isNepali ? 'चार्टहरू यहाँ प्रदर्शित हुनेछन्' : 'Charts will be displayed here'}</p>
        <p><em>${isNepali ? 'नोट: चार्ट प्रदर्शनको लागि अतिरिक्त सेटअप आवश्यक छ' : 'Note: Additional setup required for chart display'}</em></p>
      </div>
    </div>
  `;
}

function generateSnapshotsSection(cards: any, isNepali: boolean): string {
  return `
    <div class="section">
      <h2>${isNepali ? 'स्न्यापशटहरू' : 'Snapshots'}</h2>
      <div class="card">
        <p>${isNepali ? 'स्न्यापशटहरू यहाँ प्रदर्शित हुनेछन्' : 'Snapshots will be displayed here'}</p>
        <p><em>${isNepali ? 'नोट: स्न्यापशट प्रदर्शनको लागि अतिरिक्त सेटअप आवश्यक छ' : 'Note: Additional setup required for snapshot display'}</em></p>
      </div>
    </div>
  `;
}
