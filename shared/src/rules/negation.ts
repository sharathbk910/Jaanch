// Clause-scoped negation utility for English, Hindi, Hinglish, and Kannada

const NEGATION_WORDS = [
  // English
  'no',
  'not',
  'never',
  'neither',
  'without',
  'free of',
  'do not',
  "don't",
  'does not',
  "doesn't",
  'zero',
  'none',
  // Hindi & Hinglish
  'nahi',
  'nahin',
  'na',
  'bina',
  'koyi nahi',
  'koi nahi',
  'shulk rahit',
  'bina kisi',
  'mat',
  // Kannada
  'illa',
  'illave',
  'shulkavilla',
  'yavude shulkavilla',
  'kodabedi',
  'beda',
  'illade',
];

/**
 * Checks whether a match span at matchIndex in text is preceded or governed by a negation within its clause.
 * Bounded by clause boundaries [.!?;\n] and up to 60 characters / 8 words preceding.
 */
export function isNegatedInClause(text: string, matchIndex: number): boolean {
  if (!text || matchIndex <= 0) return false;

  // Find start of the current clause (punctuation or newline preceding match)
  let clauseStart = matchIndex - 1;
  while (clauseStart > 0 && !/[.!?;\n]/.test(text[clauseStart])) {
    clauseStart--;
  }

  // Segment leading up to the match within the same clause
  const precedingText = text.slice(clauseStart, matchIndex).toLowerCase();

  // Also check immediately following text within 30 chars for postfix negation (e.g. Kannada "shulka illa" or Hindi "fee nahi hai")
  const followingSlice = text.slice(matchIndex, Math.min(text.length, matchIndex + 50)).toLowerCase();

  for (const neg of NEGATION_WORDS) {
    const negRegex = new RegExp(`\\b${neg}\\b`, 'i');
    if (negRegex.test(precedingText) || negRegex.test(followingSlice)) {
      return true;
    }
  }

  return false;
}
