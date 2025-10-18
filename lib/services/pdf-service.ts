// Dynamic imports for client-side only libraries
let jsPDF: any;
let html2canvas: any;

// Load libraries only on client side
if (typeof window !== 'undefined') {
  import('jspdf').then((module) => {
    jsPDF = module.default;
  });
  import('html2canvas').then((module) => {
    html2canvas = module.default;
  });
}

interface Planet {
  planet: string;
  signId: number;
  signLabel: string;
  house: number;
  retro: boolean;
}

interface KundaliData {
  ascSignId: number;
  ascSignLabel: string;
  d1: Planet[];
  yogas: Array<{
    label: string;
    factors: string[];
    key: string;
  }>;
  doshas: Array<{
    label: string;
    factors: string[];
  }>;
}

interface BirthDetails {
  name: string;
  birthDate: string;
  birthTime: string;
  place: string;
}

export const pdfService = {
  async generateKundaliPDF(kundaliData: KundaliData, birthDetails: BirthDetails): Promise<void> {
    // Check if we're on client side
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available on the client side');
    }

    // Wait for libraries to load
    if (!jsPDF || !html2canvas) {
      await new Promise((resolve) => {
        const checkLibraries = () => {
          if (jsPDF && html2canvas) {
            resolve(undefined);
          } else {
            setTimeout(checkLibraries, 100);
          }
        };
        checkLibraries();
      });
    }

    try {
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('कुण्डली रिपोर्ट (Kundali Report)', pageWidth / 2, 30, { align: 'center' });

      // Add birth details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`नाम (Name): ${birthDetails.name}`, margin, 50);
      pdf.text(`जन्म मिति (Birth Date): ${birthDetails.birthDate}`, margin, 60);
      pdf.text(`जन्म समय (Birth Time): ${birthDetails.birthTime}`, margin, 70);
      pdf.text(`जन्म स्थान (Birth Place): ${birthDetails.place}`, margin, 80);

      // Add ascendant information
      pdf.setFont('helvetica', 'bold');
      pdf.text(`लग्न (Ascendant): ${kundaliData.ascSignLabel}`, margin, 95);

      // Add chart (if element exists)
      const chartElement = document.getElementById('kundali-chart');
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth * 0.8;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add new page for chart
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 30, imgWidth, imgHeight);
        } catch (chartError) {
          console.warn('Could not capture chart:', chartError);
          pdf.text('Chart could not be captured', margin, 100);
        }
      }

      // Add planetary positions
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ग्रह स्थिति (Planetary Positions)', margin, 30);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let yPosition = 50;

      kundaliData.d1.forEach((planet, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }

        const retroText = planet.retro ? ' (वक्री)' : '';
        pdf.text(`${planet.planet}: ${planet.signLabel} - घर ${planet.house}${retroText}`, margin, yPosition);
        yPosition += 10;
      });

      // Add yogas
      if (kundaliData.yogas && kundaliData.yogas.length > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('योग (Yogas)', margin, 30);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = 50;

        kundaliData.yogas.forEach((yoga) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }

          pdf.text(`${yoga.label}: ${yoga.factors.join(', ')}`, margin, yPosition);
          yPosition += 10;
        });
      }

      // Add doshas
      if (kundaliData.doshas && kundaliData.doshas.length > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('दोष (Doshas)', margin, 30);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = 50;

        kundaliData.doshas.forEach((dosha) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }

          pdf.text(`${dosha.label}: ${dosha.factors.join(', ')}`, margin, yPosition);
          yPosition += 10;
        });
      }

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        pdf.text('ZSTRO AI ASTROLOGY', margin, pageHeight - 10);
      }

      // Save the PDF
      const fileName = `kundali_${birthDetails.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF generation failed. Please try again.');
    }
  }
};