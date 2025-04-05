export interface SentenceVector {
  index: number;
  sentence: string;
  vector: Record<string, number>;
}

export interface SimilarityScore {
  index: number;
  score: number;
  rank: number;
  sentence: string;
}

export const createDictionary = (sentences: string[]): string[] => {
  const allWords = sentences
    .join(" ")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return Array.from(new Set(allWords)).sort();
};

export const vectorizeSentences = (sentences: string[]): SentenceVector[] => {
  const dictionary = createDictionary(sentences);

  return sentences.map((sentence, index) => {
    const words = sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const vector: Record<string, number> = {};

    // Initialize all words with 0 count
    dictionary.forEach((word) => {
      vector[word] = 0;
    });

    // Count occurrences of each word
    words.forEach((word) => {
      if (dictionary.includes(word)) {
        vector[word] += 1;
      }
    });

    return {
      index,
      sentence,
      vector,
    };
  });
};

export const calculateCosineSimilarity = (
  vectorA: Record<string, number>,
  vectorB: Record<string, number>
): number => {
  const keys = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of keys) {
    const a = vectorA[key] || 0;
    const b = vectorB[key] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

export const calculateSimilarityScores = (
  queryVector: Record<string, number>,
  sentenceVectors: SentenceVector[]
): SimilarityScore[] => {
  const scores = sentenceVectors.map((sentenceVector) => ({
    index: sentenceVector.index,
    score: calculateCosineSimilarity(queryVector, sentenceVector.vector),
    rank: 0,
    sentence: sentenceVector.sentence,
  }));

  // Sort by score in descending order and assign ranks
  return scores
    .sort((a, b) => b.score - a.score)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
};
