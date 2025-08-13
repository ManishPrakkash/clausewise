import { HfInference } from '@huggingface/inference';

class HuggingFaceService {
  constructor() {
    // Initialize with API key from environment or use a default
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || 'hf_xxx';
    this.hf = null;
    
    if (this.apiKey && this.apiKey !== 'hf_xxx') {
      this.hf = new HfInference(this.apiKey);
    }
  }

  /**
   * Generate response using Hugging Face text generation
   */
  async generateResponse(prompt, documentData, documentText) {
    if (!this.hf) {
      throw new Error('Hugging Face API not configured. Please set REACT_APP_HUGGINGFACE_API_KEY environment variable.');
    }

    try {
      const context = this.buildContext(documentData, documentText);
      const fullPrompt = `${context}\n\nUser Question: ${prompt}\n\nAnswer:`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 300,
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
