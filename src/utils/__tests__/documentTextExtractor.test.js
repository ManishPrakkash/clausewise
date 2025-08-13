import { describe, it, expect, beforeEach, vi } from 'vitest';
import documentTextExtractor from '../documentTextExtractor';

// Mock Tesseract
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({
      data: { text: 'Mock extracted text from image' }
    })
  }
}));

describe('DocumentTextExtractor', () => {
  let mockFile;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFile = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1024 * 1024 // 1MB
    };
  });

  describe('File Type Detection', () => {
    it('should detect PDF files correctly', () => {
      const pdfFile = { ...mockFile, type: 'application/pdf' };
      expect(documentTextExtractor.getFileType(pdfFile)).toBe('pdf');
    });

    it('should detect Word documents correctly', () => {
      const docFile = { ...mockFile, name: 'test.doc', type: 'application/msword' };
      const docxFile = { ...mockFile, name: 'test.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
      
      expect(documentTextExtractor.getFileType(docFile)).toBe('doc');
      expect(documentTextExtractor.getFileType(docxFile)).toBe('docx');
    });

    it('should detect text files correctly', () => {
      const txtFile = { ...mockFile, name: 'test.txt', type: 'text/plain' };
      expect(documentTextExtractor.getFileType(txtFile)).toBe('txt');
    });

    it('should detect image files correctly', () => {
      const imageFile = { ...mockFile, name: 'test.png', type: 'image/png' };
      expect(documentTextExtractor.getFileType(imageFile)).toBe('image');
    });

    it('should detect file type from extension when MIME type is missing', () => {
      const pdfFile = { ...mockFile, name: 'test.pdf', type: '' };
      expect(documentTextExtractor.getFileType(pdfFile)).toBe('pdf');
    });
  });

  describe('File Validation', () => {
    it('should validate files within size limit', () => {
      const smallFile = { ...mockFile, size: 1024 * 1024 }; // 1MB
      expect(() => documentTextExtractor.validateFile(smallFile)).not.toThrow();
    });

    it('should reject files exceeding size limit', () => {
      const largeFile = { ...mockFile, size: 100 * 1024 * 1024 }; // 100MB
      expect(() => documentTextExtractor.validateFile(largeFile)).toThrow('File size (100 MB) exceeds maximum allowed size (50MB)');
    });

    it('should validate supported file types', () => {
      const supportedTypes = [
        { type: 'application/pdf', name: 'test.pdf' },
        { type: 'application/msword', name: 'test.doc' },
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'test.docx' },
        { type: 'text/plain', name: 'test.txt' },
        { type: 'image/jpeg', name: 'test.jpg' },
        { type: 'image/png', name: 'test.png' }
      ];

      supportedTypes.forEach(file => {
        expect(() => documentTextExtractor.validateFile({ ...mockFile, ...file })).not.toThrow();
      });
    });

    it('should reject unsupported file types', () => {
      const unsupportedFile = { ...mockFile, type: 'application/zip', name: 'test.zip' };
      expect(() => documentTextExtractor.validateFile(unsupportedFile)).toThrow('Unsupported file type: application/zip');
    });
  });

  describe('Text Extraction', () => {
    it('should extract text from text files', async () => {
      const textFile = {
        ...mockFile,
        name: 'test.txt',
        type: 'text/plain',
        text: vi.fn().mockResolvedValue('Sample text content')
      };

      const result = await documentTextExtractor.extractTextFromText(textFile);
      expect(result).toBe('Sample text content');
    });

    it('should extract text from images using OCR', async () => {
      const imageFile = { ...mockFile, name: 'test.png', type: 'image/png' };
      
      const result = await documentTextExtractor.extractTextFromImage(imageFile);
      expect(result).toBe('Mock extracted text from image');
    });

    it('should handle PDF files (currently using OCR fallback)', async () => {
      const pdfFile = { ...mockFile, name: 'test.pdf', type: 'application/pdf' };
      
      const result = await documentTextExtractor.extractTextFromPDF(pdfFile);
      expect(result).toBe('Mock extracted text from image');
    });

    it('should handle Word documents (currently using OCR fallback)', async () => {
      const wordFile = { ...mockFile, name: 'test.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
      
      const result = await documentTextExtractor.extractTextFromWord(wordFile);
      expect(result).toBe('Mock extracted text from image');
    });
  });

  describe('Multiple File Processing', () => {
    it('should process multiple files successfully', async () => {
      const files = [
        { ...mockFile, name: 'test1.pdf', type: 'application/pdf' },
        { ...mockFile, name: 'test2.txt', type: 'text/plain', text: vi.fn().mockResolvedValue('Text content') },
        { ...mockFile, name: 'test3.png', type: 'image/png' }
      ];

      const result = await documentTextExtractor.processMultipleFiles(files);
      
      expect(result.totalFiles).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(3);
    });

    it('should handle processing failures gracefully', async () => {
      // Mock a file that will fail
      const failingFile = {
        ...mockFile,
        name: 'failing.txt',
        type: 'text/plain',
        text: vi.fn().mockRejectedValue(new Error('Read error'))
      };

      const result = await documentTextExtractor.processMultipleFiles([failingFile]);
      
      expect(result.totalFiles).toBe(1);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
      expect(result.failedResults).toHaveLength(1);
      expect(result.failedResults[0].error).toContain('Failed to read text file');
    });
  });

  describe('Utility Functions', () => {
    it('should format file sizes correctly', () => {
      expect(documentTextExtractor.formatFileSize(1024)).toBe('1 KB');
      expect(documentTextExtractor.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(documentTextExtractor.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(documentTextExtractor.formatFileSize(0)).toBe('0 Bytes');
    });

    it('should provide correct processing status messages', () => {
      expect(documentTextExtractor.getProcessingStatus('pdf')).toBe('Extracting text from PDF...');
      expect(documentTextExtractor.getProcessingStatus('doc')).toBe('Extracting text from Word document...');
      expect(documentTextExtractor.getProcessingStatus('docx')).toBe('Extracting text from Word document...');
      expect(documentTextExtractor.getProcessingStatus('txt')).toBe('Reading text file...');
      expect(documentTextExtractor.getProcessingStatus('image')).toBe('Performing OCR on image...');
      expect(documentTextExtractor.getProcessingStatus('unknown')).toBe('Processing file...');
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported file types gracefully', async () => {
      const unsupportedFile = { ...mockFile, type: 'application/zip', name: 'test.zip' };
      
      await expect(documentTextExtractor.extractTextFromFile(unsupportedFile))
        .rejects.toThrow('Unsupported file type: unknown');
    });

    it('should handle OCR failures gracefully', async () => {
      // Mock Tesseract to fail
      const { default: Tesseract } = await import('tesseract.js');
      Tesseract.recognize.mockRejectedValueOnce(new Error('OCR failed'));

      const imageFile = { ...mockFile, name: 'test.png', type: 'image/png' };
      
      await expect(documentTextExtractor.extractTextFromImage(imageFile))
        .rejects.toThrow('Failed to extract text from image using OCR');
    });
  });
});
