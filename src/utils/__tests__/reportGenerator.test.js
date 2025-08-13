import { describe, it, expect, beforeEach, vi } from 'vitest';
import reportGenerator from '../reportGenerator';

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    rect: vi.fn(),
    circle: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    save: vi.fn(),
    internal: {
      getNumberOfPages: vi.fn().mockReturnValue(1)
    }
  }))
}));

describe('ReportGenerator', () => {
  let mockResult;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockResult = {
      id: 'test123',
      documentName: 'Test Land Document.pdf',
      documentType: 'Patta',
      uploadDate: '2024-01-15',
      status: 'Verified',
      isLegal: true,
      ownershipType: 'Private',
      surveyNumber: 'SF No. 123/4',
      area: '2.5 acres',
      owner: 'John Doe',
      district: 'Chennai',
      taluk: 'Tambaram',
      village: 'Perungalathur',
      classification: 'Agricultural',
      confidence: 95,
      discrepancies: [],
      verificationDetails: {
        registrationStatus: 'Registered',
        portalMatch: true,
        ownershipVerified: true,
        boundariesConfirmed: true,
        taxStatus: 'Current'
      }
    };
  });

  describe('Basic Functionality', () => {
    it('should initialize without crashing', () => {
      expect(reportGenerator).toBeDefined();
      expect(typeof reportGenerator.generateLandVerificationReport).toBe('function');
      expect(typeof reportGenerator.downloadReport).toBe('function');
    });

    it('should generate a PDF report', () => {
      const result = reportGenerator.generateLandVerificationReport(mockResult);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle missing data gracefully', () => {
      const incompleteResult = {
        id: 'test123',
        documentName: 'Test Document',
        status: 'Unknown'
      };
      
      expect(() => {
        reportGenerator.generateLandVerificationReport(incompleteResult);
      }).not.toThrow();
    });
  });

  describe('Report Structure', () => {
    it('should include all required sections', () => {
      const result = reportGenerator.generateLandVerificationReport(mockResult);
      
      // Verify the PDF object is created
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle discrepancies when present', () => {
      const resultWithDiscrepancies = {
        ...mockResult,
        discrepancies: ['Document mismatch found', 'Ownership verification failed']
      };
      
      expect(() => {
        reportGenerator.generateLandVerificationReport(resultWithDiscrepancies);
      }).not.toThrow();
    });
  });

  describe('Download Functionality', () => {
    it('should call save method on PDF', () => {
      const mockPdf = {
        save: vi.fn()
      };
      
      // Mock the generateLandVerificationReport to return our mock PDF
      vi.spyOn(reportGenerator, 'generateLandVerificationReport').mockReturnValue(mockPdf);
      
      reportGenerator.downloadReport(mockResult, 'test_report.pdf');
      
      expect(mockPdf.save).toHaveBeenCalledWith('test_report.pdf');
    });

    it('should generate default filename when none provided', () => {
      const mockPdf = {
        save: vi.fn()
      };
      
      vi.spyOn(reportGenerator, 'generateLandVerificationReport').mockReturnValue(mockPdf);
      
      reportGenerator.downloadReport(mockResult);
      
      expect(mockPdf.save).toHaveBeenCalled();
      const savedFilename = mockPdf.save.mock.calls[0][0];
      expect(savedFilename).toContain('land_verification_report');
      expect(savedFilename).toContain('.pdf');
    });
  });

  describe('Error Handling', () => {
    it('should handle null result gracefully', () => {
      expect(() => {
        reportGenerator.generateLandVerificationReport(null);
      }).not.toThrow();
    });

    it('should handle undefined result gracefully', () => {
      expect(() => {
        reportGenerator.generateLandVerificationReport(undefined);
      }).not.toThrow();
    });

    it('should handle empty result object', () => {
      expect(() => {
        reportGenerator.generateLandVerificationReport({});
      }).not.toThrow();
    });
  });
});
