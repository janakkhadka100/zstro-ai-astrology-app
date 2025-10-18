// app/astro-cards/page.tsx
// Test page for AstroCards component

import { Suspense } from "react";
import AstroCards from "@/components/astro/AstroCards";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function AstroCardsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Cards-First Astrology Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Source-of-truth astrology data visualization and analysis
            </p>
          </div>
          
          <Suspense fallback={<div className="text-center py-8">Loading astrology cards...</div>}>
            <AstroCards lang="ne" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
