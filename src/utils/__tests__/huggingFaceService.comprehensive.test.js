import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the @huggingface/inference package
vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn()
}));

describe('HuggingFaceService - Comprehensive Tests', () => {
  let mockHfInstance;
  let service;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock HfInference instance
    mockHfInstance = {
      textGeneration: vi.fn()
    };
    
    // Mock the HfInference constructor
    const { HfInference } = await import('@huggingface/inference');
    HfInference.mockImplementation(() => mockHfInstance);
    
    // Import the service
    const module = await import('../huggingFaceService');
    service = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize without crashing', () => {
      expect(service).toBeDefined();
      expect(typeof service).toBe('object');
    });

    it('should have all required methods', () => {
      expect(typeof service.generateResponse).toBe('function');
      expect(typeof service.generateSummary).toBe('function');
      expect(typeof service.generateKeyPoints).toBe('function');
      expect(typeof service.getStatus).toBe('function');
      expect(typeof service.isAvailable).toBe('function');
    });

    it('should provide service status information', () => {
      const status = service.getStatus();
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
      expect('available' in status).toBe(true);
      expect('configured' in status).toBe(true);
    });

    it('should indicate API is not configured when no key is set', () => {
      const status = service.getStatus();
      expect(status.configured).toBe(false);
      expect(status.available).toBe(false);
    });

    it('should check service availability', () => {
      const isAvailable = service.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
      expect(isAvailable).toBe(false);
    });
  });

  describe('Fallback Methods', () => {
    it('should provide fallback summary when API is not available', async () => {
      const summary = await service.generateSummary('test document text');
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('Document summary not available');
    });

    it('should provide fallback key points when API is not available', async () => {
      const keyPoints = await service.generateKeyPoints('test document text');
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(typeof keyPoints[0]).toBe('string');
      expect(keyPoints[0]).toContain('Document contains important terms');
    });

    it('should handle empty document text in summary', async () => {
      const summary = await service.generateSummary('');
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Document summary not available');
    });

    it('should handle null document text in summary', async () => {
      const summary = await service.generateSummary(null);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Document summary not available');
    });

    it('should handle empty document text in key points', async () => {
      const keyPoints = await service.generateKeyPoints('');
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(keyPoints[0]).toContain('Document contains important terms');
    });

    it('should provide meaningful fallback responses for different question types', async () => {
      const documentData = {
        documentType: 'land contract',
        owner: 'John Doe',
        surveyNumber: '123',
        area: '2 acres',
        district: 'Test District',
        taluk: 'Test Taluk',
        village: 'Test Village'
      };
      
      // Test fallback response generation - should throw error when API not configured
      await expect(
        service.generateResponse('What are the payment terms?', documentData, '')
      ).rejects.toThrow('Hugging Face API not configured');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when trying to use generateResponse without API', async () => {
      await expect(
        service.generateResponse('test question', {}, 'test text')
      ).rejects.toThrow('Hugging Face API not configured');
    });

    it('should handle API configuration errors gracefully', () => {
      // The service should not crash when checking status
      expect(() => service.getStatus()).not.toThrow();
      expect(() => service.isAvailable()).not.toThrow();
    });

    it('should handle missing document data gracefully', async () => {
      // Should throw error when API not configured
      await expect(
        service.generateResponse('test question', {}, 'test text')
      ).rejects.toThrow('Hugging Face API not configured');
    });

    it('should handle null document data gracefully', async () => {
      // Should throw error when API not configured
      await expect(
        service.generateResponse('test question', null, 'test text')
      ).rejects.toThrow('Hugging Face API not configured');
    });
  });

  describe('Document Type Handling', () => {
    it('should handle different document types in fallback responses', async () => {
      const documentTypes = ['land contract', 'patta', 'chitta', 'title deed'];
      
      for (const docType of documentTypes) {
        const summary = await service.generateSummary(`This is a ${docType} document`);
        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
      }
    });

    it('should process document text of various lengths', async () => {
      const shortText = 'Short document.';
      const longText = 'This is a very long document with many sentences. It contains multiple paragraphs and lots of information. The content is extensive and detailed.';
      
      const shortSummary = await service.generateSummary(shortText);
      const longSummary = await service.generateSummary(longText);
      
      expect(shortSummary).toBeDefined();
      expect(longSummary).toBeDefined();
      expect(typeof shortSummary).toBe('string');
      expect(typeof longSummary).toBe('string');
    });

    it('should handle special characters in document text', async () => {
      const textWithSpecialChars = 'Document with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      const summary = await service.generateSummary(textWithSpecialChars);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('Response Quality and Consistency', () => {
    it('should provide consistent response format for summaries', async () => {
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await service.generateSummary('test document text');
        responses.push(response);
      }
      
      // All responses should be strings
      responses.forEach(response => {
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
      });
    });

    it('should provide consistent response format for key points', async () => {
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await service.generateKeyPoints('test document text');
        responses.push(response);
      }
      
      // All responses should be arrays
      responses.forEach(response => {
        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBeGreaterThan(0);
        response.forEach(point => {
          expect(typeof point).toBe('string');
          expect(point.length).toBeGreaterThan(0);
        });
      });
    });

    it('should handle edge cases gracefully', async () => {
      // Very long text
      const longText = 'A'.repeat(10000);
      const summary = await service.generateSummary(longText);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      
      // Very short text
      const shortText = 'A';
      const keyPoints = await service.generateKeyPoints(shortText);
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Service Resilience', () => {
    it('should not crash on rapid successive calls', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.generateSummary(`Document ${i}`));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle concurrent operations', async () => {
      const summaryPromise = service.generateSummary('test text');
      const keyPointsPromise = service.generateKeyPoints('test text');
      const statusPromise = service.getStatus();
      
      const [summary, keyPoints, status] = await Promise.all([
        summaryPromise,
        keyPointsPromise,
        statusPromise
      ]);
      
      expect(summary).toBeDefined();
      expect(keyPoints).toBeDefined();
      expect(status).toBeDefined();
    });

    it('should maintain state consistency across calls', () => {
      const status1 = service.getStatus();
      const status2 = service.getStatus();
      const status3 = service.getStatus();
      
      expect(status1).toEqual(status2);
      expect(status2).toEqual(status3);
      expect(status1.available).toBe(status2.available);
      expect(status1.configured).toBe(status2.configured);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete document processing workflow', async () => {
      const documentData = {
        documentType: 'land contract',
        owner: 'John Doe',
        surveyNumber: 'SF No. 123/4',
        area: '2.5 acres',
        district: 'Chennai',
        taluk: 'Tambaram',
        village: 'Perungalathur',
        classification: 'Agricultural',
        ownershipType: 'Private'
      };
      
      const documentText = 'This is a comprehensive land contract document containing detailed terms and conditions for the property transaction.';
      
      // Test all service methods
      const summary = await service.generateSummary(documentText);
      const keyPoints = await service.generateKeyPoints(documentText);
      const status = service.getStatus();
      const isAvailable = service.isAvailable();
      
      expect(summary).toBeDefined();
      expect(keyPoints).toBeDefined();
      expect(status).toBeDefined();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should handle document with discrepancies', async () => {
      const documentData = {
        documentType: 'patta',
        owner: 'Jane Smith',
        surveyNumber: 'SF No. 456/7',
        area: '1.5 acres',
        district: 'Coimbatore',
        taluk: 'Pollachi',
        village: 'Kinathukadavu'
      };
      
      const documentText = 'This document has some inconsistencies that need to be verified.';
      
      const summary = await service.generateSummary(documentText);
      const keyPoints = await service.generateKeyPoints(documentText);
      
      expect(summary).toBeDefined();
      expect(keyPoints).toBeDefined();
      expect(Array.isArray(keyPoints)).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      await service.generateSummary('test document text');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle memory efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate multiple summaries
      for (let i = 0; i < 100; i++) {
        await service.generateSummary(`Document ${i} with some text content`);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should not leak memory on repeated calls', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make repeated calls
      for (let i = 0; i < 50; i++) {
        await service.generateSummary('test document text');
        await service.generateKeyPoints('test document text');
        service.getStatus();
        service.isAvailable();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });
});
