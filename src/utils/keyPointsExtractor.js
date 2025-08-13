import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

/**
 * Extracts concise and optimized key points from the given OCR data using Hugging Face's summarization model.
 * Ensures each key point is a complete, structured, and meaningful sentence.
 * @param {string} inputText - The OCR data or full text to extract key points from.
 * @returns {Promise<string[]>} - A promise that resolves to an array of approximately 5 key points.
 */
export const extractKeyPoints = async (inputText) => {
  try {
    if (!inputText || inputText.trim().length === 0) {
      throw new Error('Input text is empty.');
    }

    const { summary_text: summary } = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: inputText, // Use the entire OCR data for summarization
    });

    const summarySentences = summary
      .split(/(?<=\.)\s+/) // Split by sentence-ending punctuation
      .map((s) => s.trim())
      .filter(Boolean);

    const inputSentences = inputText
      .split(/(?<=\.)\s+/) // Split by sentence-ending punctuation
      .map((s) => s.trim())
      .filter(Boolean);

    const combinedSentences = [...summarySentences, ...inputSentences]
      .filter((sentence, index, self) => self.indexOf(sentence) === index) // Remove duplicates
      .map((sentence) => (sentence.endsWith('.') ? sentence : `${sentence}.`)); // Ensure sentences end with a period

    let keyPoints = combinedSentences.slice(0, 5);

    while (keyPoints.length < 5) {
      const fallbackSentence = inputSentences.find(
        (sentence) => !keyPoints.includes(sentence) && sentence.length > 20
      );
      keyPoints.push(fallbackSentence || 'No additional key points available.');
    }

    if (keyPoints[4] === 'No additional key points available.') {
      const additionalSentence = inputSentences.find(
        (sentence) => !keyPoints.includes(sentence) && sentence.length > 20
      );
      if (additionalSentence) {
        keyPoints[4] = additionalSentence;
      }
    }

    return keyPoints;
  } catch (error) {
    console.error('Error extracting key points:', error);
    return ['Error extracting key points.'];
  }
};
 
