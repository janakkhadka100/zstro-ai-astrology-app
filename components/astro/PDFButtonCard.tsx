"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PDFButtonCardProps {
  data: any; // Pipeline data
  chartId?: string; // Optional chart element ID
  uploadedFiles?: Array<{
    name: string;
    type: string;
    text?: string;
    meta?: any;
  }>; // Uploaded files to include in PDF
}

export function PDFButtonCard({ data, chartId = 'kundali-chart', uploadedFiles = [] }: PDFButtonCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);

      // Check if chart element exists
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        toast.error("Chart not ready. Please wait for the chart to load.");
        return;
      }

      // Dynamic import for client-side libraries
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Capture chart
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Page 1: Header and Chart
      pdf.setFontSize(20);
      pdf.text('जन्मकुण्डली / Kundali Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Ascendant: ${data.ascSignLabel}`, 20, 30);
      pdf.text(`Moon: ${data.planets.find((p: any) => p.planet === "Moon")?.signLabel || "Unknown"}`, 20, 35);

      // Add chart image
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, Math.min(imgHeight, pageHeight - 100));

      // Page 2: Planet Table
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Planet Positions', 20, 20);
      
      let yPosition = 35;
      data.planets.forEach((planet: any, index: number) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        let planetText = `${planet.planet}: ${planet.signLabel} (House ${planet.safeHouse})`;
        if (planet.degree !== null) {
          planetText += ` - ${planet.degree.toFixed(2)}°`;
        }
        pdf.text(planetText, 20, yPosition);
        yPosition += 8;
      });

      // Page 3: Shadbala Table
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Shadbala Analysis', 20, 20);
      
      yPosition = 35;
      data.planets.forEach((planet: any, index: number) => {
        if (!planet.shadbala) return;
        
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        pdf.text(`${planet.planet}:`, 20, yPosition);
        yPosition += 6;
        pdf.text(`  Total: ${planet.shadbala.total.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`  Sthana: ${planet.shadbala.sthana.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`  Dig: ${planet.shadbala.dig.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`  Kala: ${planet.shadbala.kala.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`  Cheshta: ${planet.shadbala.chestha.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`  Naisargika: ${planet.shadbala.naisargika.toFixed(2)}`, 25, yPosition);
        yPosition += 10;
      });

      // Add uploaded files summary if any
      if (uploadedFiles.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text("Uploaded Files Summary", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        uploadedFiles.forEach((file, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.text(`${index + 1}. ${file.name} (${file.type.split('/')[1].toUpperCase()})`, 20, yPosition);
          yPosition += 6;

          if (file.text) {
            pdf.setFontSize(10);
            const textPreview = file.text.slice(0, 200);
            const lines = pdf.splitTextToSize(textPreview, 170);
            lines.forEach((line: string) => {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(line, 25, yPosition);
              yPosition += 4;
            });
            if (file.text.length > 200) {
              pdf.text("...", 25, yPosition);
              yPosition += 4;
            }
          } else {
            pdf.setFontSize(10);
            pdf.text("(No text content extracted)", 25, yPosition);
            yPosition += 4;
          }
          yPosition += 8;
        });
      }

      // Generate filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `kundali-${dateStr}.pdf`;

      // Save PDF
      pdf.save(fileName);
      
      toast.success("PDF generated successfully!");
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Export Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download a complete PDF report with chart, planetary positions, and analysis.
          </p>
          
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>• Includes kundali chart</p>
            <p>• Complete planetary data</p>
            <p>• Shadbala analysis</p>
            <p>• Dasha periods</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
