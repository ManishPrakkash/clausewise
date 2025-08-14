import jsPDF from 'jspdf';

class ReportGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.margin = 20;
    this.pageWidth = 210;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  /**
   * Generate a comprehensive land verification report
   */
  generateLandVerificationReport(result) {
    this.doc = new jsPDF('P', 'mm', 'A4');
    this.currentY = 20;

    // Add header
    this.addHeader();
    
    // Add document information
    this.addDocumentInfo(result);
    
    // Add verification summary
    this.addVerificationSummary(result);
    
    // Add detailed verification checks
    this.addVerificationChecks(result);
    
    // Add property details
    this.addPropertyDetails(result);
    
    // Add discrepancies if any
    if (result.discrepancies && result.discrepancies.length > 0) {
      this.addDiscrepancies(result.discrepancies);
    }
    
    // Add footer
    this.addFooter();
    
    return this.doc;
  }

  /**
   * Add report header with logo and title
   */
  addHeader() {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Land Verification Report', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(127, 140, 141);
    this.doc.text('Tamil Nadu Land Records Verification System', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 20;
    
    // Separator line
    this.doc.setDrawColor(189, 195, 199);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;
  }

  /**
   * Add document information section
   */
  addDocumentInfo(result) {
    this.addSectionTitle('Document Information');
    
    const infoData = [
      { label: 'Document Name', value: result.documentName },
      { label: 'Document Type', value: result.documentType },
      { label: 'Verification Date', value: result.uploadDate },
      { label: 'Report ID', value: result.id }
    ];

    this.addKeyValuePairs(infoData);
    this.currentY += 10;
  }

  /**
   * Add verification summary section
   */
  addVerificationSummary(result) {
    this.addSectionTitle('Verification Summary');
    
    // Status indicator
    const statusColor = result.isLegal ? [46, 204, 113] : [231, 76, 60];
    this.doc.setFillColor(...statusColor);
    this.doc.rect(this.margin, this.currentY, 40, 15, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(result.isLegal ? 'VERIFIED' : 'ISSUES', this.margin + 20, this.currentY + 10, { align: 'center' });
    
    // Status text
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(`Status: ${result.status}`, this.margin + 50, this.currentY + 10);
    
    this.currentY += 25;
    
    // Summary grid
    const summaryData = [
      { label: 'Confidence Score', value: `${result.confidence}%` },
      { label: 'Ownership Type', value: result.ownershipType },
      { label: 'Legal Status', value: result.isLegal ? 'Legal & Valid' : 'Issues Found' }
    ];

    this.addSummaryGrid(summaryData);
    this.currentY += 20;
  }

  /**
   * Add verification checks section
   */
  addVerificationChecks(result) {
    this.addSectionTitle('Verification Checks');
    
    if (result.verificationDetails) {
      const checks = Object.entries(result.verificationDetails).map(([key, value]) => ({
        label: key.replace(/([A-Z])/g, ' $1').trim(),
        value: typeof value === 'boolean' ? (value ? 'Verified' : 'Failed') : value,
        status: this.getCheckStatus(value)
      }));

      this.addVerificationTable(checks);
    }
    
    this.currentY += 20; // Increased spacing after table
  }

  /**
   * Add property details section
   */
  addPropertyDetails(result) {
    this.addSectionTitle('Property Details');
    
    const propertyData = [
      { label: 'Survey Number', value: result.surveyNumber },
      { label: 'Area', value: result.area },
      { label: 'Owner', value: result.owner },
      { label: 'District', value: result.district },
      { label: 'Taluk', value: result.taluk },
      { label: 'Village', value: result.village },
      { label: 'Classification', value: result.classification || 'Not specified' }
    ];

    this.addKeyValuePairs(propertyData);
    this.currentY += 10;
  }

  /**
   * Add discrepancies section
   */
  addDiscrepancies(discrepancies) {
    this.addSectionTitle('Discrepancies Found');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(231, 76, 60);
    
    discrepancies.forEach((discrepancy, index) => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      this.doc.text(`• ${discrepancy}`, this.margin + 10, this.currentY);
      this.currentY += 8;
    });
    
    this.currentY += 10;
  }

  /**
   * Add footer with timestamp and page info
   */
  addFooter() {
    const footerY = 280;
    
    // Separator line
    this.doc.setDrawColor(189, 195, 199);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
    
    // Footer text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(127, 140, 141);
    
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.doc.text(`Generated on: ${timestamp}`, this.margin, footerY + 5);
    this.doc.text('Tamil Nadu Land Records Verification System', this.pageWidth - this.margin, footerY + 5, { align: 'right' });
    
    // Page number
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin, footerY + 5, { align: 'right' });
    }
  }

  /**
   * Add section title
   */
  addSectionTitle(title) {
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    this.currentY += 5; // Add extra space before section title
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Underline
    this.doc.setDrawColor(52, 152, 219);
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY);
    
    this.currentY += 15;
  }

  /**
   * Add key-value pairs
   */
  addKeyValuePairs(data) {
    this.doc.setFontSize(10);
    
    data.forEach((item, index) => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      // Label
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(52, 73, 94);
      this.doc.text(item.label + ':', this.margin, this.currentY);
      
      // Value with text wrapping for long values
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(44, 62, 80);
      
      const value = item.value || 'Not specified';
      const maxValueWidth = this.contentWidth - 70; // Leave space for label
      
      if (this.doc.getTextWidth(value) > maxValueWidth) {
        // Split long values into multiple lines
        const words = value.split(' ');
        let currentLine = '';
        let lines = [];
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          if (this.doc.getTextWidth(testLine) <= maxValueWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        // Draw each line
        lines.forEach((line, lineIndex) => {
          this.doc.text(line, this.margin + 60, this.currentY + (lineIndex * 4));
        });
        
        this.currentY += (lines.length * 4) + 4; // Adjust spacing based on number of lines
      } else {
        this.doc.text(value, this.margin + 60, this.currentY);
        this.currentY += 8;
      }
    });
  }

  /**
   * Add summary grid
   */
  addSummaryGrid(data) {
    const gridWidth = this.contentWidth / 3;
    
    data.forEach((item, index) => {
      const x = this.margin + (index * gridWidth);
      
      // Box
      this.doc.setDrawColor(189, 195, 199);
      this.doc.setFillColor(236, 240, 241);
      this.doc.rect(x, this.currentY, gridWidth - 5, 25, 'FD');
      
      // Label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(127, 140, 141);
      this.doc.text(item.label, x + 5, this.currentY + 8);
      
      // Value
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(44, 62, 80);
      this.doc.text(item.value, x + 5, this.currentY + 18);
    });
  }

  /**
   * Add verification table
   */
  addVerificationTable(checks) {
    const tableWidth = this.contentWidth;
    const checkColWidth = tableWidth * 0.6; // 60% for check name
    const statusColWidth = tableWidth * 0.2; // 20% for status
    const resultColWidth = tableWidth * 0.2; // 20% for result
    
    // Table header
    this.doc.setFillColor(52, 152, 219);
    this.doc.rect(this.margin, this.currentY, tableWidth, 12, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Verification Check', this.margin + 5, this.currentY + 8);
    this.doc.text('Status', this.margin + checkColWidth + 5, this.currentY + 8);
    this.doc.text('Result', this.margin + checkColWidth + statusColWidth + 5, this.currentY + 8);
    
    this.currentY += 12;
    
    // Table rows
    checks.forEach((check, index) => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      const rowColor = index % 2 === 0 ? [236, 240, 241] : [255, 255, 255];
      this.doc.setFillColor(...rowColor);
      this.doc.rect(this.margin, this.currentY, tableWidth, 12, 'F'); // Increased row height
      
      // Check name with text wrapping
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(44, 62, 80);
      
      // Split long check names into multiple lines if needed
      const checkName = check.label;
      const maxCharsPerLine = Math.floor(checkColWidth / 3); // Approximate characters per line
      
      if (checkName.length > maxCharsPerLine) {
        // Split into multiple lines
        const words = checkName.split(' ');
        let currentLine = '';
        let lines = [];
        
        words.forEach(word => {
          if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        // Draw each line
        lines.forEach((line, lineIndex) => {
          this.doc.text(line, this.margin + 5, this.currentY + 7 + (lineIndex * 4));
        });
      } else {
        this.doc.text(checkName, this.margin + 5, this.currentY + 7);
      }
      
      // Status icon
      const statusColor = check.status === 'success' ? [46, 204, 113] : 
                         check.status === 'warning' ? [241, 196, 15] : [231, 76, 60];
      this.doc.setFillColor(...statusColor);
      this.doc.circle(this.margin + checkColWidth + 10, this.currentY + 6, 2, 'F');
      
      // Result with text wrapping
      const resultText = check.value;
      if (resultText.length > 8) {
        // Truncate long results
        this.doc.text(resultText.substring(0, 8) + '...', this.margin + checkColWidth + statusColWidth + 5, this.currentY + 7);
      } else {
        this.doc.text(resultText, this.margin + checkColWidth + statusColWidth + 5, this.currentY + 7);
      }
      
      this.currentY += 12; // Increased spacing between rows
    });
  }

  /**
   * Get check status for color coding
   */
  getCheckStatus(value) {
    if (value === true || value === 'Registered' || value === 'Current') {
      return 'success';
    } else if (value === false) {
      return 'error';
    } else {
      return 'warning';
    }
  }

  /**
   * Download the generated report
   */
  downloadReport(result, filename = null) {
    const report = this.generateLandVerificationReport(result);
    const defaultFilename = `land_verification_report_${result.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    report.save(filename || defaultFilename);
  }
}

export default new ReportGenerator();
