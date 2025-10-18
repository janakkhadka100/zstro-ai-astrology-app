"use client";
import dynamic from "next/dynamic";

const ChartView = dynamic(()=>import("@/components/ChartView"), { 
  ssr: false, 
  loading: () => <div className="h-56 bg-muted rounded-2xl" /> 
});

export default function ClientChartView() {
  return <ChartView />;
}
