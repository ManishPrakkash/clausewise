import { HfInference } from '@huggingface/inference'; // Correct import for HfInference

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export const summarizeText = async (inputText) => {
  try {
    if (!inputText || inputText.trim().length === 0) {
      throw new Error('Input text is empty.');
    }

    const { summary_text } = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: inputText.slice(0, 1024), // Limit input to 1024 characters for optimization
    });

    return summary_text || 'No summary generated.';
  } catch (error) {
    console.error('Error during summarization:', error);
    return 'Error summarizing text.';
  }
};

export const detectAlerts = (inputText, triggers) => {
  if (!inputText || !Array.isArray(triggers)) {
    console.error('Invalid input for detectAlerts.');
    return [];
  }

  const alerts = triggers.filter((trigger) => inputText.includes(trigger));
  return alerts;
};
