import ProfileCard from "@/components/ProfileCard";
import ResultSummaryCard from "@/components/ResultSummaryCard";
import PlanetTableCard from "@/components/PlanetTableCard";
import YogDoshGrid from "@/components/YogDoshGrid";
import PDFButtonCard from "@/components/PDFButtonCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import KundaliForm from '@/components/kundali/KundaliForm';
import ClientChartView from "@/components/ClientChartView";

// Mock data to avoid blank UI - will be replaced with real data
function getData() {
  return {
    ascSignLabel: "वृष",
    moonSignLabel: "मकर",
    planets: [
      { planet:"Sun", signLabel:"धनु", house:8, degree:null },
      { planet:"Mars",signLabel:"धनु", house:8, degree:null },
      { planet:"Saturn",signLabel:"कुम्भ", house:10, degree:null },
      { planet:"Moon",signLabel:"मकर", house:9, degree:null },
    ],
    yogas: [{label:"गजकेसरी", factors:["Jupiter","Moon"]}],
    doshas: [{label:"मंगल दोष", factors:["Mars"]}],
  };
}

export default function KundaliPage() {
  const data = getData();
  
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
