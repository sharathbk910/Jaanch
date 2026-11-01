const ZERO_WIDTH_BIDI_REGEX = /[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E\u2060-\u206F]/g;

// Common Cyrillic and Greek homoglyphs commonly used in impersonation
const HOMOGLYPH_MAP: Record<string, string> = {
  '\u0430': 'a', // Cyrillic small a
  '\u0435': 'e', // Cyrillic small ie
  '\u043E': 'o', // Cyrillic small o
  '\u0440': 'p', // Cyrillic small er
  '\u0441': 'c', // Cyrillic small es
  '\u0443': 'y', // Cyrillic small u
  '\u0445': 'x', // Cyrillic small ha
  '\u0456': 'i', // Cyrillic small byelorussian-ukrainian i
  '\u03BF': 'o', // Greek small omicron
  '\u03B1': 'a', // Greek small alpha
  '\u03BD': 'v', // Greek small nu
  '\u0410': 'A', // Cyrillic capital A
  '\u0412': 'B', // Cyrillic capital Ve
  '\u0415': 'E', // Cyrillic capital Ie
  '\u041A': 'K', // Cyrillic capital Ka
  '\u041C': 'M', // Cyrillic capital Em
  '\u041D': 'H', // Cyrillic capital En
  '\u041E': 'O', // Cyrillic capital O
  '\u0420': 'P', // Cyrillic capital Er
  '\u0421': 'C', // Cyrillic capital Es
  '\u0422': 'T', // Cyrillic capital Te
  '\u0425': 'X', // Cyrillic capital Ha
};

/**
 * Deterministic text normalization
 * - NFKC unicode canonical normalization
 * - Strips zero-width and bidirectional formatting characters
 * - Folds known homoglyphs to ASCII
 * - Standardizes whitespace
 * - Preserves Indian rupee symbols (₹, Rs, INR)
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  // 1. Unicode NFKC
  let normalized = text.normalize('NFKC');

  // 2. Strip zero-width & bidi
  normalized = normalized.replace(ZERO_WIDTH_BIDI_REGEX, '');

  // 3. Fold homoglyphs
  let folded = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    folded += HOMOGLYPH_MAP[char] || char;
  }

  // 4. Collapse whitespace
  folded = folded
    .replace(/\r\n/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n');

  return folded.trim();
}

/**
 * Returns lowercase normalized text for search & rule matching
 */
export function normalizeForMatching(text: string): string {
  return normalizeText(text).toLowerCase();
}

/**
 * Extract clean, whole-word context span around a match in original text.
 * Max length is clamped to maxChars (default 160).
 * Never slices words in half.
 */
export function findSpan(
  text: string,
  matchIndex: number,
  matchLength: number,
  maxChars = 160
): string {
  if (!text || matchIndex < 0 || matchLength <= 0) return '';

  const totalLen = text.length;
  const matchEnd = Math.min(matchIndex + matchLength, totalLen);

  // If match alone exceeds maxChars, bound cleanly
  if (matchEnd - matchIndex >= maxChars) {
    let sub = text.slice(matchIndex, matchIndex + maxChars);
    const lastSpace = sub.lastIndexOf(' ');
    if (lastSpace > 0) sub = sub.slice(0, lastSpace);
    return sub.trim();
  }

  const remainingBudget = maxChars - (matchEnd - matchIndex);
  const halfBudget = Math.floor(remainingBudget / 2);

  // Expand start to word boundary
  let start = Math.max(0, matchIndex - halfBudget);
  while (start > 0 && !/\s|[.,;:!?\n]/.test(text[start - 1])) {
    start--;
  }

  // Expand end to word boundary
  let end = Math.min(totalLen, matchEnd + halfBudget);
  while (end < totalLen && !/\s|[.,;:!?\n]/.test(text[end])) {
    end++;
  }

  let span = text.slice(start, end).trim();

  // If still too long, trim from outer boundary
  if (span.length > maxChars) {
    span = span.slice(0, maxChars);
    const lastSpace = span.lastIndexOf(' ');
    if (lastSpace > 0) span = span.slice(0, lastSpace);
  }

  return span.trim();
}
