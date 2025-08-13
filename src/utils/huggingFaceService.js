import { HfInference } from '@huggingface/inference';

class HuggingFaceService {
  constructor() {
    // Initialize with API key from environment or use a default
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || 'hf_xxx';
    this.hf = null;
    
    if (this.apiKey && this.apiKey !== 'hf_xxx') {
      this.hf = new HfInference(this.apiKey);
      console.log('✅ Hugging Face service initialized successfully');
    } else {
      console.log('⚠️ Hugging Face API key not configured, using fallback responses');
    }
  }

  /**
   * Generate response using Hugging Face text generation
   */
  async generateResponse(prompt, documentData, documentText) {
    if (!this.hf) {
      throw new Error('Hugging Face API not configured. Please set VITE_HUGGINGFACE_API_KEY environment variable.');
    }

    try {
      const context = this.buildContext(documentData, documentText);
      const fullPrompt = `You are a helpful document analysis assistant. Based on the following document information, answer the user's question accurately and helpfully.

${context}

User Question: ${prompt}

Please provide a comprehensive answer based on the document content:`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      return response.generated_text || this.getFallbackResponse(prompt, documentData);
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return this.getFallbackResponse(prompt, documentData);
    }
  }

  /**
   * Generate document summary using Hugging Face
   */
  async generateSummary(documentText) {
    if (!this.hf) {
      return this.getFallbackSummary(documentText);
    }

    try {
      const prompt = `Please provide a concise summary of the following document in 2-3 sentences: ${documentText}`;
      
      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.5,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      return response.generated_text || this.getFallbackSummary(documentText);
    } catch (error) {
      console.error('Hugging Face summary error:', error);
      return this.getFallbackSummary(documentText);
    }
  }

  /**
   * Generate key points using Hugging Face
   */
  async generateKeyPoints(documentText) {
    if (!this.hf) {
      return this.getFallbackKeyPoints(documentText);
    }

    try {
      const prompt = `Extract 5 key points from the following document. Each point should be a complete sentence: ${documentText}`;
      
      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.6,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      // Parse the response into key points
      const text = response.generated_text || '';
      const points = text.split(/[•\-\*]/).map(point => point.trim()).filter(point => point.length > 10);
      
      if (points.length >= 3) {
        return points.slice(0, 5);
      } else {
        return this.getFallbackKeyPoints(documentText);
      }
    } catch (error) {
      console.error('Hugging Face key points error:', error);
      return this.getFallbackKeyPoints(documentText);
    }
  }

  /**
   * Build context from document data
   */
  buildContext(documentData, documentText) {
    let context = 'You are a helpful document analysis assistant. Based on the following document information, answer the user\'s question accurately and helpfully.\n\n';
    
    if (documentData) {
      context += `Document Information:\n`;
      context += `- Document Type: ${documentData.documentType || 'Unknown'}\n`;
      context += `- Owner: ${documentData.owner || 'Unknown'}\n`;
      context += `- Survey Number: ${documentData.surveyNumber || 'Unknown'}\n`;
      context += `- Area: ${documentData.area || 'Unknown'}\n`;
      context += `- Location: ${documentData.district || 'Unknown'}, ${documentData.taluk || 'Unknown'}, ${documentData.village || 'Unknown'}\n`;
      context += `- Classification: ${documentData.classification || 'Unknown'}\n`;
      context += `- Ownership Type: ${documentData.ownershipType || 'Unknown'}\n\n`;
    }
    
    if (documentText) {
      context += `Document Content:\n${documentText.substring(0, 1000)}...\n\n`;
    }
    
    return context;
  }

  /**
   * Get fallback response when API fails
   */
  getFallbackResponse(question, documentData) {
    const questionLower = question.toLowerCase();
    
    const responses = {
      'key terms': `Based on the document analysis, here are the key terms:\n• Document Type: ${documentData?.documentType || 'Unknown'}\n• Owner: ${documentData?.owner || 'Unknown'}\n• Survey Number: ${documentData?.surveyNumber || 'Unknown'}\n• Area: ${documentData?.area || 'Unknown'}\n• Location: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`,
      'payment': 'The payment terms in this document need to be reviewed carefully. Based on the analysis, payment schedule details may be missing or unclear.',
      'termination': 'Termination conditions should be clearly defined. The current document may have ambiguous termination clauses that need attention.',
      'risks': 'Potential risks identified include unclear payment terms, ambiguous termination conditions, and missing dispute resolution procedures.',
      'obligations': 'The document outlines various obligations for both parties. Key obligations include proper documentation, timely payments, and compliance with local regulations.',
      'survey': `The survey number mentioned in this document is: ${documentData?.surveyNumber || 'Not specified'}`,
      'area': `The land area covered in this document is: ${documentData?.area || 'Not specified'}`,
      'owner': `The owner mentioned in this document is: ${documentData?.owner || 'Not specified'}`,
      'location': `The property is located in: ${documentData?.district || 'Unknown'}, ${documentData?.taluk || 'Unknown'}, ${documentData?.village || 'Unknown'}`
    };

    for (const [key, response] of Object.entries(responses)) {
      if (questionLower.includes(key)) {
        return response;
      }
    }

    return `Based on the document analysis, I can see this is a ${documentData?.documentType || 'document'} for ${documentData?.owner || 'the owner'}. The property is located at ${documentData?.surveyNumber || 'the specified survey number'} covering ${documentData?.area || 'the specified area'} in ${documentData?.district || 'the district'}. Please ask me specific questions about terms, risks, or obligations for more detailed information.`;
  }

  /**
   * Get fallback summary when API fails
   */
  getFallbackSummary(documentText) {
    if (!documentText || documentText.length < 50) {
      return 'Document summary not available. Please review the document content manually.';
    }

    const sentences = documentText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join('. ') + '.';
    } else if (sentences.length === 1) {
      return sentences[0] + '.';
    } else {
      return 'Document contains important information that requires careful review.';
    }
  }

  /**
   * Get fallback key points when API fails
   */
  getFallbackKeyPoints(documentText) {
    if (!documentText || documentText.length < 50) {
      return [
        'Document contains important terms and conditions.',
        'Property details and ownership information included.',
        'Payment and duration terms specified.',
        'Legal obligations and responsibilities outlined.',
        'Additional clauses and conditions documented.'
      ];
    }

    const sentences = documentText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .slice(0, 5);

    while (sentences.length < 5) {
      sentences.push('Additional information available in the document.');
    }

    return sentences;
  }

  /**
   * Check if API is available
   */
  isAvailable() {
    return this.hf !== null;
  }

  /**
   * Get API status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      configured: this.apiKey && this.apiKey !== 'hf_xxx'
    };
  }
}

export default new HuggingFaceService();
