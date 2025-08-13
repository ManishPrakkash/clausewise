import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the @huggingface/inference package
vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn()
}));

describe('HuggingFaceService - Simple Tests', () => {
  let service;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Import the service
    const module = await import('../huggingFaceService');
    service = module.default;
  });

  describe('Basic Functionality', () => {
    it('should provide fallback responses when API is not available', async () => {
      // Test fallback summary
      const summary = await service.generateSummary('test document text');
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      
      // Test fallback key points
      const keyPoints = await service.generateKeyPoints('test document text');
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(typeof keyPoints[0]).toBe('string');
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
      
      // Test fallback response generation
      const response = await service.generateResponse('What are the payment terms?', documentData, '');
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Test that the service doesn't crash on errors
      const result = await service.generateResponse('test question', { documentType: 'contract' }, 'test text');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should provide service status information', () => {
      const status = service.getStatus();
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
      expect('available' in status).toBe(true);
      expect('configured' in status).toBe(true);
    });

    it('should check service availability', () => {
      const isAvailable = service.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Document Processing', () => {
    it('should process document data correctly', async () => {
      const documentData = {
        documentType: 'land contract',
        owner: 'John Doe',
        surveyNumber: '123',
        area: '2 acres',
        district: 'Test District',
        taluk: 'Test Taluk',
        village: 'Test Village',
        classification: 'Agricultural',
        ownershipType: 'Individual'
      };
      
      const documentText = 'This is a sample document text for testing purposes.';
      
      const response = await service.generateResponse('test question', documentData, documentText);
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle empty document data', async () => {
      const response = await service.generateResponse('test question', {}, '');
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle missing document text', async () => {
      const documentData = {
        documentType: 'contract',
        owner: 'Test Owner'
      };
      
      const response = await service.generateResponse('test question', documentData, null);
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe('Response Quality', () => {
    it('should provide consistent response format', async () => {
      const questions = [
        'What are the key terms?',
        'What are the payment terms?',
        'What are the risks?',
        'Who is the owner?',
        'What is the survey number?'
      ];
      
      for (const question of questions) {
        const response = await service.generateResponse(question, { documentType: 'contract' }, 'test text');
        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(10); // Should have meaningful content
      }
    });

    it('should handle different document types appropriately', async () => {
      const documentTypes = ['land contract', 'patta', 'chitta', 'title deed'];
      
      for (const docType of documentTypes) {
        const response = await service.generateResponse('What is this document?', { documentType: docType }, 'test text');
        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(10);
      }
    });
  });
});
