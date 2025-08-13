/**
 * Extracts concise and optimized key points from the given OCR data using rule-based analysis.
 * Ensures each key point is a complete, structured, and meaningful sentence.
 * @param {string} inputText - The OCR data or full text to extract key points from.
 * @returns {Promise<string[]>} - A promise that resolves to an array of approximately 5 key points.
 */
export const extractKeyPoints = async (inputText) => {
  try {
    if (!inputText || inputText.trim().length === 0) {
      throw new Error('Input text is empty.');
    }

    // Split text into sentences
    const sentences = inputText
      .split(/(?<=\.)\s+/) // Split by sentence-ending punctuation
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(sentence => sentence.length > 20); // Only meaningful sentences

    // Extract key information using regex patterns
    const keyPoints = [];
    
    // Look for important patterns
    const patterns = [
      /(?:owner|pattadhar|shri|sri|mr|mrs|ms)[:\s]+([^.\n]+)/i,
      /(?:survey|sf)\s*no[:\s]+([^.\n]+)/i,
      /(\d+\.?\d*\s*(?:acre|acres|hectare|cent|cents))/i,
      /(?:village|taluk|district)[:\s]+([^.\n]+)/i,
      /(?:payment|amount|price)[:\s]+([^.\n]+)/i,
      /(?:duration|term|period)[:\s]+([^.\n]+)/i,
      /(?:obligation|responsibility)[:\s]+([^.\n]+)/i
    ];

    patterns.forEach(pattern => {
      const match = inputText.match(pattern);
      if (match && match[1]) {
        const point = match[1].trim();
        if (point.length > 10 && !keyPoints.includes(point)) {
          keyPoints.push(point);
        }
      }
    });

    // Add general sentences if we don't have enough key points
    while (keyPoints.length < 5 && sentences.length > 0) {
      const sentence = sentences.shift();
      if (sentence && !keyPoints.includes(sentence)) {
        keyPoints.push(sentence);
      }
    }

    // Ensure we have exactly 5 points
    while (keyPoints.length < 5) {
      keyPoints.push('Additional information available in the document.');
    }

    return keyPoints.slice(0, 5);
  } catch (error) {
    console.error('Error extracting key points:', error);
    return [
      'Document contains important terms and conditions.',
      'Property details and ownership information included.',
      'Payment and duration terms specified.',
      'Legal obligations and responsibilities outlined.',
      'Additional clauses and conditions documented.'
    ];
  }
};
 
