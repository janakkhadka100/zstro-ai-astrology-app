import ProfileCard from "@/components/ProfileCard";
import ResultSummaryCard from "@/components/ResultSummaryCard";
import PlanetTableCard from "@/components/PlanetTableCard";
import YogDoshGrid from "@/components/YogDoshGrid";
import PDFButtonCard from "@/components/PDFButtonCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import KundaliForm from '@/components/kundali/KundaliForm';
import ClientChartView from "@/components/ClientChartView";

// Real data using normalized astrology system
async function getData() {
  // This would typically fetch from your API or database
  // For now, using the same mock data but structured for the normalized system
  const mockApiData = {
    ascSignId: 2, // वृष
    ascSignLabel: "वृष",
    d1: [
      { planet: "Sun", signId: 9, signLabel: "धनु", house: null },
      { planet: "Mars", signId: 9, signLabel: "धनु", house: null },
      { planet: "Saturn", signId: 11, signLabel: "कुम्भ", house: null },
      { planet: "Moon", signId: 10, signLabel: "मकर", house: null },
    ],
    yogas: [{label:"गजकेसरी", factors:["Jupiter","Moon"]}],
    doshas: [{label:"मंगल दोष", factors:["Mars"]}],
    lang: "ne"
  };

  // Use the normalization system
  const { buildAstroPrompt } = await import("@/lib/astro-prompt");
  const { aiInput } = buildAstroPrompt(mockApiData);

  return {
    ascSignLabel: aiInput.ascSignLabel,
    moonSignLabel: aiInput.planets.find(p => p.planet === "Moon")?.signLabel || "Unknown",
    planets: aiInput.planets.map(p => ({
      planet: p.planet,
      signLabel: p.signLabel,
      house: p.house,
      degree: p.degree
    })),
    yogas: aiInput.yogas,
    doshas: aiInput.doshas,
  };
}

export default async function KundaliPage() {
  const data = await getData();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Top quick summary cards */}
        <ResultSummaryCard asc={data.ascSignLabel} moon={data.moonSignLabel} />

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <ProfileCard />
            <PDFButtonCard />
          </div>

          {/* Right column: Results */}
          <ErrorBoundary>
            <div className="space-y-4">
              <div id="kundali-chart" className="h-56 rounded-2xl border bg-background p-3">
                <ClientChartView />
              </div>
              <PlanetTableCard rows={data.planets} />
              <YogDoshGrid yogas={data.yogas} doshas={data.doshas} />
              
              {/* Kundali Form */}
              <KundaliForm />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
