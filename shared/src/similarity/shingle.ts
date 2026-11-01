/**
 * Shingle-Jaccard Text Similarity & Explainability
 * Computes k-shingle token overlap and extracts matched common phrases.
 */

export interface ShingleMatchResult {
  similarity: number; // 0.0 to 1.0
  sharedCount: number;
  unionCount: number;
  matchedTokens: string[];
}

/**
 * Normalizes text for shingling (lowercase, collapses whitespace).
 */
export function normalizeForShingling(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F\u0C80-\u0CFF]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts k-character shingles from normalized text.
 */
export function generateCharShingles(text: string, k = 3): Set<string> {
  const normalized = normalizeForShingling(text);
  const shingles = new Set<string>();
  if (normalized.length < k) {
    if (normalized.length > 0) shingles.add(normalized);
    return shingles;
  }
  for (let i = 0; i <= normalized.length - k; i++) {
    shingles.add(normalized.slice(i, i + k));
  }
  return shingles;
}

/**
 * Extracts word shingles (n-grams) from normalized text.
 */
export function generateWordShingles(text: string, n = 2): Set<string> {
  const words = normalizeForShingling(text).split(' ').filter(Boolean);
  const shingles = new Set<string>();
  if (words.length < n) {
    if (words.length > 0) shingles.add(words.join(' '));
    return shingles;
  }
  for (let i = 0; i <= words.length - n; i++) {
    shingles.add(words.slice(i, i + n).join(' '));
  }
  return shingles;
}

/**
 * Computes Jaccard similarity over k-character shingles with token-level explainability.
 */
export function computeShingleJaccard(
  textA: string,
  textB: string,
  k = 3
): ShingleMatchResult {
  const setA = generateCharShingles(textA, k);
  const setB = generateCharShingles(textB, k);

  if (setA.size === 0 || setB.size === 0) {
    return {
      similarity: 0,
      sharedCount: 0,
      unionCount: setA.size + setB.size,
      matchedTokens: [],
    };
  }

  const intersection = new Set<string>();
  for (const item of setA) {
    if (setB.has(item)) {
      intersection.add(item);
    }
  }

  const unionSize = setA.size + setB.size - intersection.size;
  const similarity = unionSize > 0 ? intersection.size / unionSize : 0;

  // Find representative matched words for explainability
  const wordsA = new Set(normalizeForShingling(textA).split(' ').filter((w) => w.length >= 4));
  const wordsB = new Set(normalizeForShingling(textB).split(' ').filter((w) => w.length >= 4));
  const matchedTokens: string[] = [];
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      matchedTokens.push(word);
      if (matchedTokens.length >= 10) break;
    }
  }

  return {
    similarity: Math.round(similarity * 1000) / 1000,
    sharedCount: intersection.size,
    unionCount: unionSize,
    matchedTokens,
  };
}
