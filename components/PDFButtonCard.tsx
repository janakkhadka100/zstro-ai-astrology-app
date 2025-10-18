"use client";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const html2canvas = dynamic(()=>import("html2canvas"), { ssr:false });

export default function PDFButtonCard() {
  const onDownload = async () => {
    const mod = await html2canvas;
    const el = document.getElementById("kundali-chart");
    if (!el) { alert("Chart not ready"); return; }
    const canvas = await mod.default(el, { scale: 2, useCORS: true });
    const url = canvas.toDataURL("image/png");
    // replace below with your pdfService
    const a = document.createElement("a");
    a.href = url; a.download = "kundali-chart.png"; a.click();
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 font-medium">PDF</CardHeader>
      <CardContent><Button onClick={onDownload}>PDF डाउनलोड</Button></CardContent>
    </Card>
  );
}
