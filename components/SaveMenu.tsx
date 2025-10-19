"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, MessageSquare } from "lucide-react";

interface SaveMenuProps {
  targetSelector: string;
}

export default function SaveMenu({ targetSelector }: SaveMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = document.querySelector(targetSelector);
      if (!element) {
        alert("Content not found for export");
        return;
      }

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `kundali-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToImage = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      const element = document.querySelector(targetSelector);
      if (!element) {
        alert("Content not found for export");
        return;
      }

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `kundali-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Image export error:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportChatPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF("p", "mm", "a4");
      
      // Add title
      pdf.setFontSize(20);
      pdf.text("Chat Transcript", 20, 20);
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add chat messages (this would need to be passed as props in real implementation)
      pdf.setFontSize(10);
      pdf.text("Chat messages would be added here...", 20, 40);

      const filename = `chat-transcript-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Chat PDF export error:", error);
      alert("Failed to export chat PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center space-x-1"
      >
        <FileText className="w-4 h-4" />
        <span>PDF</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToImage}
        disabled={isExporting}
        className="flex items-center space-x-1"
      >
        <Image className="w-4 h-4" />
        <span>PNG</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportChatPDF}
        disabled={isExporting}
        className="flex items-center space-x-1"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Chat</span>
      </Button>
      
      {isExporting && (
        <div className="text-xs text-gray-500">Exporting...</div>
      )}
    </div>
  );
}
