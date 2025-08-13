import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the @huggingface/inference package
vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn()
}));

describe('ContractAnalysisService', () => {
  let mockHfInstance;
  let contractAnalysisService;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create mock HfInference instance
    mockHfInstance = {
      textGeneration: vi.fn()
    };
    
    // Mock the HfInference constructor
    const { HfInference } = await import('@huggingface/inference');
    HfInference.mockImplementation(() => mockHfInstance);
    
    // Import the service after mocking
    const module = await import('../contractAnalysisService');
    contractAnalysisService = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with IBM Granite model', () => {
      expect(contractAnalysisService.ibmGraniteModel).toBe('ibm/granite-13b-chat-v2');
      expect(contractAnalysisService.apiKey).toBe('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');
    });

    it('should be available after initialization', () => {
      expect(contractAnalysisService.isAvailable()).toBe(true);
    });

    it('should return correct status', () => {
      const status = contractAnalysisService.getStatus();
      expect(status.available).toBe(true);
      expect(status.model).toBe('ibm/granite-13b-chat-v2');
      expect(status.configured).toBe(true);
    });
  });

  describe('Contract Section Analysis', () => {
    it('should analyze all contract sections', async () => {
      const mockResponse = {
        generated_text: `CONTENT: This contract contains clear payment terms with monthly installments of $1000.
ALERTS: Payment schedule is well-defined, but late payment penalties are missing.
CONFIDENCE: High
HAS_CONTENT: Yes`
      };

      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);

      const documentText = 'This is a sample contract with payment terms and duration clauses.';
      const contractType = 'land ownership contract';

      const sections = await contractAnalysisService.analyzeContractSections(documentText, contractType);

      expect(sections).toHaveLength(8);
      expect(sections[0].title).toBe('Payment Terms');
      expect(sections[1].title).toBe('Contract Duration');
      expect(sections[2].title).toBe('Confidentiality Clause');
      expect(sections[3].title).toBe('Termination Clause');
      expect(sections[4].title).toBe('Dispute Resolution');
      expect(sections[5].title).toBe('Liability & Indemnification');
      expect(sections[6].title).toBe('Intellectual Property');
      expect(sections[7].title).toBe('Compliance & Regulations');
    });

    it('should handle analysis failures gracefully', async () => {
      mockHfInstance.textGeneration.mockRejectedValue(new Error('API Error'));

      const documentText = 'Sample contract text.';
      const contractType = 'default';

      const sections = await contractAnalysisService.analyzeContractSections(documentText, contractType);

      expect(sections).toHaveLength(8);
      sections.forEach(section => {
        expect(section.content).toContain('Unable to analyze');
        expect(section.alerts).toHaveLength(1);
        expect(section.alerts[0].level).toBe('error');
        expect(section.confidence).toBe(0);
        expect(section.hasContent).toBe(false);
      });
    });
  });

  describe('Section Analysis Parsing', () => {
    it('should parse well-formatted AI responses correctly', () => {
      const mockResponse = `CONTENT: The contract specifies a 12-month duration with automatic renewal.
ALERTS: No termination notice period is defined.
CONFIDENCE: Medium
HAS_CONTENT: Yes`;

      const section = {
        title: 'Contract Duration',
        key: 'duration',
        description: 'Start date, end date, renewal terms, and extension conditions'
      };

      const analysis = contractAnalysisService.parseSectionAnalysis(mockResponse, section);

      expect(analysis.content).toContain('12-month duration with automatic renewal');
      expect(analysis.alerts).toHaveLength(1);
      expect(analysis.alerts[0].message).toContain('termination notice period');
      expect(analysis.confidence).toBe(60); // Medium confidence
      expect(analysis.hasContent).toBe(true);
    });

    it('should handle malformed responses gracefully', () => {
      const malformedResponse = 'This is not in the expected format.';
      const section = {
        title: 'Payment Terms',
        key: 'payment',
        description: 'Payment schedule, amounts, methods, and terms'
      };

      const analysis = contractAnalysisService.parseSectionAnalysis(malformedResponse, section);

      expect(analysis.content).toContain('Unable to parse analysis');
      expect(analysis.alerts).toHaveLength(1);
      expect(analysis.alerts[0].level).toBe('error');
      expect(analysis.confidence).toBe(0);
      expect(analysis.hasContent).toBe(false);
    });

    it('should handle "no critical issues found" responses', () => {
      const noIssuesResponse = `CONTENT: All payment terms are clearly defined.
ALERTS: No critical issues found.
CONFIDENCE: High
HAS_CONTENT: Yes`;

      const section = {
        title: 'Payment Terms',
        key: 'payment',
        description: 'Payment schedule, amounts, methods, and terms'
      };

      const analysis = contractAnalysisService.parseSectionAnalysis(noIssuesResponse, section);

      expect(analysis.content).toContain('All payment terms are clearly defined');
      expect(analysis.alerts).toHaveLength(1);
      expect(analysis.alerts[0].message).toContain('No critical issues found');
      expect(analysis.alerts[0].level).toBe('info');
      expect(analysis.confidence).toBe(90);
      expect(analysis.hasContent).toBe(true);
    });
  });

  describe('Contract Summary Analysis', () => {
    it('should generate contract summary', async () => {
      const mockResponse = {
        generated_text: `1. Summary: This is a comprehensive land ownership contract with clear terms.
2. Key Terms: • Monthly payments of $1000 • 12-month duration • Automatic renewal
3. Risk Assessment: Low
4. Compliance: Compliant`
      };

      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);

      const documentText = 'Sample contract text for summary analysis.';
      const contractType = 'land ownership contract';

      const summary = await contractAnalysisService.getContractSummary(documentText, contractType);

      expect(summary.summary).toContain('comprehensive land ownership contract');
      expect(summary.keyTerms).toContain('Monthly payments of $1000');
      expect(summary.riskLevel).toBe('Low');
      expect(summary.complianceStatus).toBe('Compliant');
    });

    it('should handle summary generation failures', async () => {
      mockHfInstance.textGeneration.mockRejectedValue(new Error('Summary API Error'));

      const documentText = 'Sample contract text.';
      const contractType = 'default';

      const summary = await contractAnalysisService.getContractSummary(documentText, contractType);

      expect(summary.summary).toContain('could not be completed automatically');
      expect(summary.keyTerms).toContain('Analysis not available');
      expect(summary.riskLevel).toBe('Medium');
      expect(summary.complianceStatus).toBe('Needs Review');
    });
  });

  describe('Prompt Building', () => {
    it('should build appropriate prompts for section analysis', () => {
      const section = {
        title: 'Payment Terms',
        key: 'payment',
        description: 'Payment schedule, amounts, methods, and terms'
      };

      const documentText = 'This contract specifies payment terms.';
      const contractType = 'land ownership contract';

      const prompt = contractAnalysisService.buildSectionAnalysisPrompt(section, documentText, contractType);

      expect(prompt).toContain('Payment Terms');
      expect(prompt).toContain('land ownership contract');
      expect(prompt).toContain('Payment schedule, amounts, methods, and terms');
      expect(prompt).toContain('CONTENT:');
      expect(prompt).toContain('ALERTS:');
      expect(prompt).toContain('CONFIDENCE:');
      expect(prompt).toContain('HAS_CONTENT:');
    });
  });

  describe('Fallback Content Generation', () => {
    it('should generate appropriate fallback content when content exists', () => {
      const section = {
        title: 'Payment Terms',
        key: 'payment',
        description: 'Payment schedule, amounts, methods, and terms'
      };

      const documentText = 'This contract contains payment terms and conditions.';

      const content = contractAnalysisService.generateFallbackContent(section, documentText);

      expect(content).toContain('contains information related to payment terms');
    });

    it('should generate appropriate fallback content when content is missing', () => {
      const section = {
        title: 'Intellectual Property',
        key: 'intellectual',
        description: 'IP ownership, licensing, and usage rights'
      };

      const documentText = 'This contract has no IP clauses.';

      const content = contractAnalysisService.generateFallbackContent(section, documentText);

      expect(content).toContain('No specific information found');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockHfInstance.textGeneration.mockRejectedValue(new Error('Network Error'));

      const documentText = 'Sample contract text.';
      const contractType = 'default';

      await expect(contractAnalysisService.analyzeContractSections(documentText, contractType))
        .resolves.toBeDefined();

      const sections = await contractAnalysisService.analyzeContractSections(documentText, contractType);
      expect(sections).toHaveLength(8);
      
      sections.forEach(section => {
        expect(section.content).toContain('Unable to analyze');
        expect(section.alerts[0].level).toBe('error');
      });
    });

    it('should handle individual section analysis failures', async () => {
      // Mock some sections to succeed and others to fail
      let callCount = 0;
      mockHfInstance.textGeneration.mockImplementation(() => {
        callCount++;
        if (callCount <= 4) {
          return Promise.resolve({
            generated_text: `CONTENT: Analysis successful.
ALERTS: No critical issues found.
CONFIDENCE: High
HAS_CONTENT: Yes`
          });
        } else {
          return Promise.reject(new Error('Section analysis failed'));
        }
      });

      const documentText = 'Sample contract text.';
      const contractType = 'default';

      const sections = await contractAnalysisService.analyzeContractSections(documentText, contractType);

      expect(sections).toHaveLength(8);
      
      // First 4 sections should succeed
      for (let i = 0; i < 4; i++) {
        expect(sections[i].content).toContain('Analysis successful');
        expect(sections[i].confidence).toBe(90);
      }
      
      // Last 4 sections should fail
      for (let i = 4; i < 8; i++) {
        expect(sections[i].content).toContain('Unable to analyze');
        expect(sections[i].confidence).toBe(0);
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large document texts', async () => {
      const largeDocumentText = 'A'.repeat(5000); // 5KB text
      const mockResponse = {
        generated_text: `CONTENT: Analysis completed for large document.
ALERTS: No critical issues found.
CONFIDENCE: High
HAS_CONTENT: Yes`
      };

      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);

      const sections = await contractAnalysisService.analyzeContractSections(largeDocumentText, 'default');

      expect(sections).toHaveLength(8);
      sections.forEach(section => {
        expect(section.content).toContain('Analysis completed for large document');
      });
    });

    it('should handle concurrent analysis requests', async () => {
      const mockResponse = {
        generated_text: `CONTENT: Concurrent analysis successful.
ALERTS: No critical issues found.
CONFIDENCE: High
HAS_CONTENT: Yes`
      };

      mockHfInstance.textGeneration.mockResolvedValue(mockResponse);

      const documentText = 'Sample contract text.';
      const contractType = 'default';

      const promises = [
        contractAnalysisService.analyzeContractSections(documentText, contractType),
        contractAnalysisService.analyzeContractSections(documentText, contractType),
        contractAnalysisService.analyzeContractSections(documentText, contractType)
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveLength(8);
        expect(result[0].content).toContain('Concurrent analysis successful');
      });
    });
  });
});
