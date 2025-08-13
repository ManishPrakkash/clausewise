export const summarizeText = async (inputText) => {
  try {
    if (!inputText || inputText.trim().length === 0) {
      throw new Error('Input text is empty.');
    }
    const text = inputText.replace(/\s+/g, ' ').trim();
    const sentences = text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) {
      return 'No summary generated.';
    }

    const scoreSentence = (s) => {
      let score = 0;
      if (s.length > 80) score += 2;
      if (/[;:,]/.test(s)) score += 1;
      if (/(agree|shall|must|owner|survey|area|district|village|taluk|document|contract|payment|date)/i.test(s)) score += 2;
      return score;
    };

    const ranked = sentences
      .map((s, i) => ({ s, i, score: scoreSentence(s) }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, Math.min(3, sentences.length))
      .sort((a, b) => a.i - b.i)
      .map((x) => x.s);

    return ranked.join(' ');
  } catch (error) {
    console.error('Error during summarization:', error);
    return 'No summary available.';
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
