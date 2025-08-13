import { describe, it, expect } from 'vitest';
import contractAnalysisService from '../contractAnalysisService';

describe('ContractAnalysisService - Basic Tests', () => {
  describe('Service Structure', () => {
    it('should have the correct IBM Granite model', () => {
      expect(contractAnalysisService.ibmGraniteModel).toBe('ibm/granite-13b-chat-v2');
    });

    it('should have the correct API key', () => {
      expect(contractAnalysisService.apiKey).toBe('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');
    });

    it('should have all required methods', () => {
      expect(typeof contractAnalysisService.analyzeContractSections).toBe('function');
      expect(typeof contractAnalysisService.analyzeSection).toBe('function');
      expect(typeof contractAnalysisService.getContractSummary).toBe('function');
      expect(typeof contractAnalysisService.isAvailable).toBe('function');
      expect(typeof contractAnalysisService.getStatus).toBe('function');
    });
  });

  describe('Section Definitions', () => {
    it('should define all required contract sections', () => {
      const sections = [
        'Payment Terms',
        'Contract Duration',
        'Confidentiality Clause',
        'Termination Clause',
        'Dispute Resolution',
        'Liability & Indemnification',
        'Intellectual Property',
        'Compliance & Regulations'
      ];

      // Test that the service can build prompts for all sections
      sections.forEach(sectionTitle => {
        const section = {
          title: sectionTitle,
          key: sectionTitle.toLowerCase().replace(/\s+/g, '').replace(/&/g, ''),
          description: 'Test description'
        };

        const prompt = contractAnalysisService.buildSectionAnalysisPrompt(
          section,
          'Test document text',
          'test contract'
        );

        expect(prompt).toContain(sectionTitle);
        expect(prompt).toContain('CONTENT:');
        expect(prompt).toContain('ALERTS:');
        expect(prompt).toContain('CONFIDENCE:');
        expect(prompt).toContain('HAS_CONTENT:');
      });
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

  describe('Fallback Alert Generation', () => {
    it('should generate appropriate fallback alerts', () => {
      const section = {
        title: 'Payment Terms',
        key: 'payment',
        description: 'Payment schedule, amounts, methods, and terms'
      };

      const alerts = contractAnalysisService.generateFallbackAlerts(section);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toContain('Analysis for payment terms could not be completed');
      expect(alerts[0].level).toBe('warning');
      expect(alerts[0].category).toBe('payment');
    });
  });

  describe('Service Status', () => {
    it('should return correct service status', () => {
      const status = contractAnalysisService.getStatus();
      
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('model');
      expect(status).toHaveProperty('configured');
      
      expect(typeof status.available).toBe('boolean');
      expect(typeof status.model).toBe('string');
      expect(typeof status.configured).toBe('boolean');
      
      expect(status.model).toBe('ibm/granite-13b-chat-v2');
      expect(status.configured).toBe(true);
    });
  });

  describe('Response Parsing', () => {
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

  describe('Contract Summary Parsing', () => {
    it('should parse contract summary responses correctly', () => {
      const mockResponse = `1. Summary: This is a comprehensive land ownership contract with clear terms.
2. Key Terms: • Monthly payments of $1000 • 12-month duration • Automatic renewal
3. Risk Assessment: Low
4. Compliance: Compliant`;

      const summary = contractAnalysisService.parseContractSummary(mockResponse);
      
      console.log('Parsed summary:', JSON.stringify(summary, null, 2));
      console.log('Mock response:', mockResponse);

      expect(summary.summary).toContain('comprehensive land ownership contract');
      expect(summary.keyTerms).toContain('Monthly payments of $1000');
      expect(summary.riskLevel).toBe('Low');
      expect(summary.complianceStatus).toBe('Compliant');
    });

    it('should handle malformed summary responses', () => {
      const malformedResponse = 'This is not a properly formatted summary.';
      
      const summary = contractAnalysisService.parseContractSummary(malformedResponse);

      expect(summary.summary).toBe('Contract summary not available.');
      expect(summary.keyTerms).toContain('Key terms analysis not available');
      expect(summary.riskLevel).toBe('Medium');
      expect(summary.complianceStatus).toBe('Needs Review');
    });
  });

  describe('Fallback Summary', () => {
    it('should provide fallback contract summary', () => {
      const summary = contractAnalysisService.getFallbackContractSummary('Test document');

      expect(summary.summary).toContain('could not be completed automatically');
      expect(summary.keyTerms).toContain('Analysis not available');
      expect(summary.riskLevel).toBe('Medium');
      expect(summary.complianceStatus).toBe('Needs Review');
    });
  });
});
