import { HfInference } from '@huggingface/inference';

class ContractAnalysisService {
  constructor() {
    // Initialize with the provided Hugging Face API key
    this.apiKey = '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';
    this.hf = new HfInference(this.apiKey);
    this.ibmGraniteModel = 'ibm/granite-13b-chat-v2';
    
    console.log('✅ Contract Analysis Service initialized with IBM Granite model');
  }

  /**
   * Analyze contract sections using IBM Granite model
   */
  async analyzeContractSections(documentText, contractType = 'default') {
    try {
      console.log('Starting contract analysis with IBM Granite...');
      
      const sections = [
        {
          title: 'Payment Terms',
          key: 'payment',
          description: 'Payment schedule, amounts, methods, and terms'
        },
        {
          title: 'Contract Duration',
          key: 'duration',
          description: 'Start date, end date, renewal terms, and extension conditions'
        },
        {
          title: 'Confidentiality Clause',
          key: 'confidentiality',
          description: 'Non-disclosure terms, data protection, and privacy measures'
        },
        {
          title: 'Termination Clause',
          key: 'termination',
          description: 'Termination conditions, notice periods, and exit procedures'
        },
        {
          title: 'Dispute Resolution',
          key: 'dispute',
          description: 'Arbitration, mediation, governing law, and jurisdiction'
        },
        {
          title: 'Liability & Indemnification',
          key: 'liability',
          description: 'Liability limits, indemnification, and insurance requirements'
        },
        {
          title: 'Intellectual Property',
          key: 'intellectual',
          description: 'IP ownership, licensing, and usage rights'
        },
        {
          title: 'Compliance & Regulations',
          key: 'compliance',
          description: 'Regulatory compliance, audit rights, and reporting requirements'
        }
      ];

      const analyzedSections = await Promise.all(
        sections.map(async (section) => {
          try {
            const analysis = await this.analyzeSection(section, documentText, contractType);
            return {
              ...section,
              content: analysis.content,
              alerts: analysis.alerts,
              confidence: analysis.confidence,
              hasContent: analysis.hasContent
            };
          } catch (error) {
            console.error(`Error analyzing section ${section.title}:`, error);
            return {
              ...section,
              content: `Unable to analyze ${section.title.toLowerCase()} due to processing error.`,
              alerts: [{
                message: `Analysis failed for ${section.title.toLowerCase()}. Please review manually.`,
                level: 'error',
                category: section.key
              }],
              confidence: 0,
              hasContent: false
            };
          }
        })
      );

      return analyzedSections;
    } catch (error) {
      console.error('Error in contract analysis:', error);
      throw new Error(`Contract analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a specific contract section
   */
  async analyzeSection(section, documentText, contractType) {
    try {
      const prompt = this.buildSectionAnalysisPrompt(section, documentText, contractType);
      
      const response = await this.hf.textGeneration({
        model: this.ibmGraniteModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      const generatedText = response.generated_text || '';
      
      // Parse the response to extract content and alerts
      const analysis = this.parseSectionAnalysis(generatedText, section);
      
      return analysis;
    } catch (error) {
      console.error(`Error analyzing section ${section.title}:`, error);
      throw error;
    }
  }

  /**
   * Build prompt for section analysis
   */
  buildSectionAnalysisPrompt(section, documentText, contractType) {
    return `You are a legal contract analyst. Analyze the following contract document for ${section.title.toLowerCase()} information.

Contract Type: ${contractType}
Section: ${section.title}
Description: ${section.description}

Document Text:
${documentText.substring(0, 2000)}

Please provide a comprehensive analysis in the following format:

CONTENT: [Provide a detailed analysis of what is found or missing regarding ${section.title.toLowerCase()}. Be specific about terms, conditions, and any ambiguities.]

ALERTS: [List specific issues, missing elements, or concerns found. If no issues, state "No critical issues found."]

CONFIDENCE: [High/Medium/Low based on clarity and completeness of information]

HAS_CONTENT: [Yes/No - whether the document contains relevant information for this section]

Focus on identifying:
1. What is clearly stated
2. What is missing or unclear
3. Potential risks or ambiguities
4. Compliance with standard practices

Be concise but thorough in your analysis.`;
  }

  /**
   * Parse the AI-generated analysis response
   */
  parseSectionAnalysis(response, section) {
    try {
      const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let content = '';
      let alerts = [];
      let confidence = 'Medium';
      let hasContent = false;

      let currentSection = '';
      
      for (const line of lines) {
        if (line.startsWith('CONTENT:')) {
          currentSection = 'content';
          content = line.replace('CONTENT:', '').trim();
        } else if (line.startsWith('ALERTS:')) {
          currentSection = 'alerts';
          const alertText = line.replace('ALERTS:', '').trim();
          if (alertText.toLowerCase() !== 'no critical issues found.') {
            alerts.push({
              message: alertText,
              level: 'warning',
              category: section.key
            });
          }
        } else if (line.startsWith('CONFIDENCE:')) {
          confidence = line.replace('CONFIDENCE:', '').trim();
        } else if (line.startsWith('HAS_CONTENT:')) {
          hasContent = line.replace('HAS_CONTENT:', '').trim().toLowerCase() === 'yes';
        } else if (currentSection === 'content' && line.length > 0) {
          content += ' ' + line;
        } else if (currentSection === 'alerts' && line.length > 0 && !line.startsWith('CONTENT:') && !line.startsWith('CONFIDENCE:') && !line.startsWith('HAS_CONTENT:')) {
          if (line.toLowerCase() !== 'no critical issues found.') {
            alerts.push({
              message: line,
              level: 'warning',
              category: section.key
            });
          }
        }
      }

      // If parsing failed, provide fallback analysis
      if (!content) {
        content = this.generateFallbackContent(section, documentText);
        alerts = this.generateFallbackAlerts(section);
        confidence = 'Low';
        hasContent = false;
      }

      // Convert confidence to percentage
      const confidenceMap = {
        'High': 90,
        'Medium': 60,
        'Low': 30
      };

      return {
        content: content || `Analysis of ${section.title.toLowerCase()} is not available.`,
        alerts: alerts.length > 0 ? alerts : [{
          message: `No critical issues found in ${section.title.toLowerCase()}.`,
          level: 'info',
          category: section.key
        }],
        confidence: confidenceMap[confidence] || 60,
        hasContent: hasContent
      };
    } catch (error) {
      console.error('Error parsing section analysis:', error);
      return {
        content: `Unable to parse analysis for ${section.title.toLowerCase()}.`,
        alerts: [{
          message: `Analysis parsing failed for ${section.title.toLowerCase()}.`,
          level: 'error',
          category: section.key
        }],
        confidence: 0,
        hasContent: false
      };
    }
  }

  /**
   * Generate fallback content when AI analysis fails
   */
  generateFallbackContent(section, documentText) {
    const docText = documentText.toLowerCase();
    const sectionKey = section.key.toLowerCase();
    
    if (docText.includes(sectionKey) || docText.includes(section.title.toLowerCase())) {
      return `The document contains information related to ${section.title.toLowerCase()}, but detailed analysis could not be performed. Please review this section manually.`;
    } else {
      return `No specific information found regarding ${section.title.toLowerCase()}. This section may need attention or clarification.`;
    }
  }

  /**
   * Generate fallback alerts when AI analysis fails
   */
  generateFallbackAlerts(section) {
    return [{
      message: `Analysis for ${section.title.toLowerCase()} could not be completed automatically. Manual review recommended.`,
      level: 'warning',
      category: section.key
    }];
  }

  /**
   * Get overall contract analysis summary
   */
  async getContractSummary(documentText, contractType) {
    try {
      const prompt = `Analyze this contract document and provide a comprehensive summary.

Contract Type: ${contractType}
Document: ${documentText.substring(0, 1500)}

Please provide:
1. A 2-3 sentence summary of the contract
2. Key terms and conditions
3. Overall risk assessment (Low/Medium/High)
4. Compliance status (Compliant/Needs Review/Non-Compliant)

Format your response clearly with these sections.`;

      const response = await this.hf.textGeneration({
        model: this.ibmGraniteModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      return this.parseContractSummary(response.generated_text || '');
    } catch (error) {
      console.error('Error getting contract summary:', error);
      return this.getFallbackContractSummary(documentText);
    }
  }

  /**
   * Parse contract summary response
   */
  parseContractSummary(response) {
    try {
      const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let summary = '';
      let keyTerms = [];
      let riskLevel = 'Medium';
      let complianceStatus = 'Needs Review';

      let currentSection = '';
      
      for (const line of lines) {
        if (line.toLowerCase().includes('summary:') || line.toLowerCase().includes('1.')) {
          currentSection = 'summary';
          summary = line.replace(/^[^:]*:\s*/, '').trim();
        } else if (line.toLowerCase().includes('key terms:') || line.toLowerCase().includes('2.')) {
          currentSection = 'keyTerms';
        } else if (line.toLowerCase().includes('risk assessment:') || line.toLowerCase().includes('3.')) {
          currentSection = 'risk';
          const riskText = line.replace(/^[^:]*:\s*/, '').trim();
          if (riskText.toLowerCase().includes('low')) riskLevel = 'Low';
          else if (riskText.toLowerCase().includes('high')) riskLevel = 'High';
        } else if (line.toLowerCase().includes('compliance:') || line.toLowerCase().includes('4.')) {
          currentSection = 'compliance';
          const complianceText = line.replace(/^[^:]*:\s*/, '').trim();
          if (complianceText.toLowerCase().includes('compliant')) complianceStatus = 'Compliant';
          else if (complianceText.toLowerCase().includes('non-compliant')) complianceStatus = 'Non-Compliant';
        } else if (currentSection === 'summary' && line.length > 0) {
          summary += ' ' + line;
        } else if (currentSection === 'keyTerms' && line.length > 0) {
          // Extract key terms from bullet points or numbered lists
          if (line.includes('•') || line.includes('-') || line.includes('*')) {
            // Split by bullet points and extract each term
            const terms = line.split(/[•\-*]/).map(t => t.trim()).filter(t => t.length > 0);
            keyTerms.push(...terms);
          } else if (line.match(/^\d+\./)) {
            const term = line.replace(/^\d+\.\s*/, '').trim();
            if (term.length > 0) {
              keyTerms.push(term);
            }
          } else if (line.includes('payments') || line.includes('duration') || line.includes('renewal')) {
            // Extract specific terms mentioned
            const terms = line.split(/[•\-*]/).map(t => t.trim()).filter(t => t.length > 0);
            keyTerms.push(...terms);
          }
        }
      }

      return {
        summary: summary || 'Contract summary not available.',
        keyTerms: keyTerms.length > 0 ? keyTerms : ['Key terms analysis not available.'],
        riskLevel,
        complianceStatus
      };
    } catch (error) {
      console.error('Error parsing contract summary:', error);
      return this.getFallbackContractSummary('');
    }
  }

  /**
   * Get fallback contract summary
   */
  getFallbackContractSummary(documentText) {
    return {
      summary: 'Contract analysis could not be completed automatically. Manual review recommended.',
      keyTerms: ['Analysis not available'],
      riskLevel: 'Medium',
      complianceStatus: 'Needs Review'
    };
  }

  /**
   * Check service availability
   */
  isAvailable() {
    return this.hf !== null;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      model: this.ibmGraniteModel,
      configured: !!this.apiKey
    };
  }
}

export default new ContractAnalysisService();
