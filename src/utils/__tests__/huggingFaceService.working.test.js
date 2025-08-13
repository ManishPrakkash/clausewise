import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the @huggingface/inference package
vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn()
}));

describe('HuggingFaceService - Working Tests', () => {
  let service;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Import the service
    const module = await import('../huggingFaceService');
    service = module.default;
  });

  describe('Service Status', () => {
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
  });
});
