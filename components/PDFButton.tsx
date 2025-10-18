'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { pdfService } from '@/lib/services/pdf-service';

interface PDFButtonProps {
  kundaliData: any;
  birthDetails: {
    name: string;
    birthDate: string;
    birthTime: string;
    place: string;
  };
}

export default function PDFButton({ kundaliData, birthDetails }: PDFButtonProps) {
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    const target = document.getElementById("kundali-chart");
    if (!target) {
      toast.error("Chart not ready");
      return;
    }

    setBusy(true);
    try {
      await pdfService.generateKundaliPDF(kundaliData, birthDetails);
      toast.success("PDF downloaded successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "PDF download failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={onDownload}
      disabled={busy || !kundaliData}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
    >
      {busy ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </>
      )}
    </Button>
  );
}
