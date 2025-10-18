import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export class PDFService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  async generateKundaliPDF(
    kundaliData: KundaliData,
    birthDetails: BirthDetails,
    chartElementId: string = 'north-indian-chart'
  ): Promise<void> {
    try {
      // Set up the document
      this.setupDocument();
      
      // Add header
      this.addHeader(birthDetails.name);
      
      // Add birth details section
      this.addBirthDetails(birthDetails);
      
      // Add ascendant section
      this.addAscendant(kundaliData.ascSignLabel);
      
      // Capture and add chart
      await this.addChart(chartElementId);
      
      // Add planets section
      this.addPlanets(kundaliData.d1);
      
      // Add yogas section
      if (kundaliData.yogas && kundaliData.yogas.length > 0) {
        this.addYogas(kundaliData.yogas);
      }
      
      // Add doshas section
      if (kundaliData.doshas && kundaliData.doshas.length > 0) {
        this.addDoshas(kundaliData.doshas);
      }
      
      // Add footer
      this.addFooter();
      
      // Save the PDF
      const fileName = `${birthDetails.name.replace(/\s+/g, '_')}_Kundali_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF generation failed');
    }
  }

  private setupDocument(): void {
    // Set font
    this.doc.setFont('helvetica');
    
    // Set page margins
    this.doc.setDrawColor(100, 100, 100);
    this.doc.setLineWidth(0.5);
  }

  private addHeader(name: string): void {
    // Title
    this.doc.setFontSize(24);
    this.doc.setTextColor(100, 50, 150);
    this.doc.text('ZSTRO AI ASTROLOGY', 20, 25);
    
    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text(`${name} को कुण्डली`, 20, 35);
    
    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Generated on: ${new Date().toLocaleDateString('en-NP')}`, 20, 42);
    
    // Line separator
    this.doc.line(20, 45, 190, 45);
  }

  private addBirthDetails(birthDetails: BirthDetails): void {
    let yPosition = 55;
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text('जन्म विवरण (Birth Details)', 20, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(11);
    this.doc.setTextColor(80, 80, 80);
    
    // Name
    this.doc.text(`नाम (Name): ${birthDetails.name}`, 20, yPosition);
    yPosition += 8;
    
    // Date
    this.doc.text(`जन्म मिति (Birth Date): ${birthDetails.birthDate}`, 20, yPosition);
    yPosition += 8;
    
    // Time
    this.doc.text(`जन्म समय (Birth Time): ${birthDetails.birthTime}`, 20, yPosition);
    yPosition += 8;
    
    // Place
    this.doc.text(`जन्म स्थान (Birth Place): ${birthDetails.place}`, 20, yPosition);
    yPosition += 15;
    
    // Line separator
    this.doc.line(20, yPosition, 190, yPosition);
  }

  private addAscendant(ascSignLabel: string): void {
    let yPosition = 95;
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text('लग्न (Ascendant)', 20, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(100, 50, 150);
    this.doc.text(ascSignLabel, 20, yPosition);
    
    yPosition += 15;
    
    // Line separator
    this.doc.line(20, yPosition, 190, yPosition);
  }

  private async addChart(chartElementId: string): Promise<void> {
    try {
      const chartElement = document.getElementById(chartElementId);
      if (!chartElement) {
        console.warn('Chart element not found, skipping chart in PDF');
        return;
      }

      // Capture the chart as canvas
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Add new page for chart
      this.doc.addPage();
      
      // Add chart title
      this.doc.setFontSize(16);
      this.doc.setTextColor(50, 50, 50);
      this.doc.text('उत्तर भारतीय कुण्डली (North Indian Chart)', 20, 25);
      
      // Calculate chart dimensions to fit page
      const pageWidth = this.doc.internal.pageSize.getWidth();
      const pageHeight = this.doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - 80; // Leave space for title and margins
      
      const chartWidth = canvas.width;
      const chartHeight = canvas.height;
      
      // Calculate scaling to fit the page
      const scaleX = maxWidth / chartWidth;
      const scaleY = maxHeight / chartHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const finalWidth = chartWidth * scale;
      const finalHeight = chartHeight * scale;
      
      // Center the chart
      const x = (pageWidth - finalWidth) / 2;
      const y = 40;
      
      // Add the chart image
      const imgData = canvas.toDataURL('image/png');
      this.doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
    } catch (error) {
      console.error('Error capturing chart:', error);
      // Continue without chart if there's an error
    }
  }

  private addPlanets(planets: Planet[]): void {
    // Add new page for planets
    this.doc.addPage();
    
    let yPosition = 25;
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text('ग्रहहरू (Planets)', 20, yPosition);
    
    yPosition += 15;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    
    // Create table header
    this.doc.text('ग्रह (Planet)', 20, yPosition);
    this.doc.text('राशि (Sign)', 60, yPosition);
    this.doc.text('घर (House)', 100, yPosition);
    this.doc.text('स्थिति (Status)', 140, yPosition);
    
    yPosition += 5;
    this.doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // Add planet data
    planets.forEach((planet) => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 25;
      }
      
      this.doc.text(planet.planet, 20, yPosition);
      this.doc.text(planet.signLabel, 60, yPosition);
      this.doc.text(planet.house.toString(), 100, yPosition);
      this.doc.text(planet.retro ? 'वक्री (R)' : 'सामान्य', 140, yPosition);
      
      yPosition += 8;
    });
  }

  private addYogas(yogas: Array<{label: string; factors: string[]; key: string}>): void {
    let yPosition = this.doc.internal.pageSize.getHeight() - 50;
    
    // Check if we need a new page
    if (yPosition < 100) {
      this.doc.addPage();
      yPosition = 25;
    }
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 100, 0);
    this.doc.text('योगहरू (Auspicious Yogas)', 20, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    
    yogas.forEach((yoga, index) => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 25;
      }
      
      this.doc.text(`${index + 1}. ${yoga.label}`, 20, yPosition);
      yPosition += 6;
      this.doc.text(`   Factors: ${yoga.factors.join(', ')}`, 25, yPosition);
      yPosition += 6;
      this.doc.text(`   Key: ${yoga.key}`, 25, yPosition);
      yPosition += 10;
    });
  }

  private addDoshas(doshas: Array<{label: string; factors: string[]}>): void {
    let yPosition = this.doc.internal.pageSize.getHeight() - 50;
    
    // Check if we need a new page
    if (yPosition < 100) {
      this.doc.addPage();
      yPosition = 25;
    }
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(200, 50, 50);
    this.doc.text('दोषहरू (Doshas)', 20, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);
    
    doshas.forEach((dosha, index) => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 25;
      }
      
      this.doc.text(`${index + 1}. ${dosha.label}`, 20, yPosition);
      yPosition += 6;
      this.doc.text(`   Affected by: ${dosha.factors.join(', ')}`, 25, yPosition);
      yPosition += 6;
      this.doc.text('   💡 उपाय को लागि ज्योतिषी संग परामर्श गर्नुहोस्', 25, yPosition);
      yPosition += 10;
    });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.line(20, 280, 190, 280);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Generated by ZSTRO AI ASTROLOGY', 20, 285);
      this.doc.text(`Page ${i} of ${pageCount}`, 150, 285);
    }
  }
}

// Export singleton instance
export const pdfService = new PDFService();
