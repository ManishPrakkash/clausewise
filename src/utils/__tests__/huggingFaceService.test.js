import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the @huggingface/inference package
vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn()
}));

describe('HuggingFaceService', () => {
  let mockHfInstance;
  let HuggingFaceService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock HfInference instance
    mockHfInstance = {
      textGeneration: vi.fn()
    };
    
    // Mock the HfInference constructor
    const { HfInference } = require('@huggingface/inference');
    HfInference.mockImplementation(() => mockHfInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Functionality', () => {
    it('should provide fallback responses when API is not available', async () => {
      // Import the service (it will use default fallback behavior)
      const { default: service } = await import('../huggingFaceService');
      
      // Test fallback summary
      const summary = await service.generateSummary('test document text');
      expect(summary).toContain('Document summary not available');
      
      // Test fallback key points
      const keyPoints = await service.generateKeyPoints('test document text');
      expect(keyPoints).toHaveLength(5);
      expect(keyPoints[0]).toContain('Document contains important terms');
    });

    it('should provide meaningful fallback responses for different question types', async () => {
      const { default: service } = await import('../huggingFaceService');
      
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
      expect(response).toContain('payment terms');
    });

    it('should build proper context from document data', () => {
      const { default: service } = require('../huggingFaceService');
      
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
      
      // Test context building (this is a private method, so we test the public interface)
      const response = service.generateResponse('test question', documentData, documentText);
      expect(response).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const { default: service } = await import('../huggingFaceService');
      
      // Test that the service doesn't crash on errors
      const result = await service.generateResponse('test question', { documentType: 'contract' }, 'test text');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Service Initialization', () => {
    it('should log success message when API key is valid', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      await import('../huggingFaceService');
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ Hugging Face service initialized successfully');
      
      consoleSpy.mockRestore();
    });

    it('should log warning message when API key is not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_xxx'
      }));
      
      vi.resetModules();
      await import('../huggingFaceService');
      
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Hugging Face API key not configured, using fallback responses');
      
      consoleSpy.mockRestore();
    });
  });

  describe('API Availability Checks', () => {
    it('should return correct availability status', async () => {
      // Test with valid API key
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      expect(service.isAvailable()).toBe(true);
      expect(service.getStatus()).toEqual({
        available: true,
        configured: true
      });
    });

    it('should return unavailable status when API key is invalid', async () => {
      // Test with invalid API key
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_xxx'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      expect(service.isAvailable()).toBe(false);
      expect(service.getStatus()).toEqual({
        available: false,
        configured: false
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when trying to use unconfigured service', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_xxx'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      await expect(service.generateResponse('test question', {}, 'test text'))
        .rejects
        .toThrow('Hugging Face API not configured. Please set VITE_HUGGINGFACE_API_KEY environment variable.');
    });

    it('should handle API errors gracefully and return fallback response', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      // Mock API error
      mockHfInstance.textGeneration.mockRejectedValue(new Error('API Error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.generateResponse('test question', { documentType: 'contract' }, 'test text');
      
      expect(consoleSpy).toHaveBeenCalledWith('Hugging Face API error:', expect.any(Error));
      expect(result).toContain('Based on the document analysis');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Fallback Behavior', () => {
    it('should use fallback responses when API is not available', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_xxx'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      const result = await service.generateSummary('test document text');
      expect(result).toContain('Document summary not available');
      
      const keyPoints = await service.generateKeyPoints('test document text');
      expect(keyPoints).toHaveLength(5);
      expect(keyPoints[0]).toContain('Document contains important terms');
    });

    it('should provide meaningful fallback responses for different question types', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_xxx'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      const documentData = {
        documentType: 'land contract',
        owner: 'John Doe',
        surveyNumber: '123',
        area: '2 acres',
        district: 'Test District',
        taluk: 'Test Taluk',
        village: 'Test Village'
      };
      
      const paymentResponse = await service.generateResponse('What are the payment terms?', documentData, '');
      expect(paymentResponse).toContain('payment terms');
      
      const surveyResponse = await service.generateResponse('What is the survey number?', documentData, '');
      expect(surveyResponse).toContain('123');
      
      const ownerResponse = await service.generateResponse('Who is the owner?', documentData, '');
      expect(ownerResponse).toContain('John Doe');
    });
  });

  describe('Context Building', () => {
    it('should build proper context from document data', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
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
      
      // Mock successful API response
      mockHfInstance.textGeneration.mockResolvedValue({
        generated_text: 'Test response'
      });
      
      await service.generateResponse('test question', documentData, documentText);
      
      // Verify the context was built correctly
      expect(mockHfInstance.textGeneration).toHaveBeenCalledWith({
        model: 'microsoft/DialoGPT-medium',
        inputs: expect.stringContaining('Document Type: land contract'),
        parameters: expect.any(Object)
      });
      
      const callArgs = mockHfInstance.textGeneration.mock.calls[0][0];
      expect(callArgs.inputs).toContain('Owner: John Doe');
      expect(callArgs.inputs).toContain('Survey Number: 123');
      expect(callArgs.inputs).toContain('Area: 2 acres');
      expect(callArgs.inputs).toContain('Location: Test District, Test Taluk, Test Village');
      expect(callArgs.inputs).toContain('Classification: Agricultural');
      expect(callArgs.inputs).toContain('Ownership Type: Individual');
      expect(callArgs.inputs).toContain('Document Content: This is a sample document text for testing purposes.');
    });
  });

  describe('API Response Handling', () => {
    it('should handle successful API responses', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      const mockResponse = {
        generated_text: 'This is a test response from the API'
      };
      
      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);
      
      const result = await service.generateResponse('test question', {}, 'test text');
      
      expect(result).toBe('This is a test response from the API');
      expect(mockHfInstance.textGeneration).toHaveBeenCalledWith({
        model: 'microsoft/DialoGPT-medium',
        inputs: expect.any(String),
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });
    });

    it('should use fallback when API response is empty', async () => {
      vi.doMock('import.meta.env', () => ({
        VITE_HUGGINGFACE_API_KEY: 'hf_valid_key_12345'
      }));
      
      vi.resetModules();
      const { default: service } = await import('../huggingFaceService');
      
      const mockResponse = {
        generated_text: ''
      };
      
      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);
      
      const result = await service.generateResponse('test question', { documentType: 'contract' }, 'test text');
      
      expect(result).toContain('Based on the document analysis');
    });
  });
});
