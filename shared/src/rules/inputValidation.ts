/**
 * Deterministic rule-based input validation for offer text.
 * Ensures the input is legitimate offer/recruitment communication before running audit heuristics.
 */

export interface InputValidationResult {
  isValid: boolean;
  code?: 'TOO_SHORT' | 'REPETITIVE_TEXT' | 'UNREADABLE' | 'KEYBOARD_MASH' | 'NO_OFFER_CONTEXT';
  message?: string;
}

const OFFER_INDICATOR_REGEX =
  /\b(?:offer|job|intern|internship|hiring|hire|recruitment|recruiter|selected|selection|candidate|interview|application|apply|role|position|stipend|salary|package|ctc|lpa|joining|appointment|trainee|fellowship|scholarship|company|organization|corporate|hr|careers|deposit|fee|fees|charge|charges|payment|pay|paid|upi|bank|account|cheque|debit|credit|otp|verification|verify|document|documents|laptop|security|refund|refundable|probation|contract|freelance|part[\s-]?time|full[\s-]?time|wfh|remote|bonus|incentive|congratulations|urgent|urgently|deadline|naukri|linkedin|telegram|whatsapp|portal|aicte|mca|ncs|nsp|tcs|infosys|wipro|cognizant|accenture|hcl|amazon|google|microsoft|deloitte|ey|pwc|kpmg|panjikaran|vetan|shulk|udyoga|sambala|kelasa|aayke)\b/i;

const CONTACT_OR_FINANCIAL_REGEX =
  /(?:\S+@\S+\.\S+|\b(?:\+?91[\s-]?)?[6-9]\d{9}\b|https?:\/\/|www\.|\b\d+[\s-]?(?:lpa|k|thousand|rupees|inr)\b|₹|\brs\.?\b|@(?:upi|okhdfcbank|okaxis|okicici|oksbi|paytm|ybl))/i;

/**
 * Validates whether the given text is a valid offer, internship, or recruitment message.
 * Returns isValid: false with an explanatory message if input is gibberish, repetitive, or unrelated.
 */
export function validateOfferInput(rawText: string): InputValidationResult {
  const trimmed = (rawText || '').trim();

  // 1. Length rule (minimum 25 characters)
  if (trimmed.length < 25) {
    return {
      isValid: false,
      code: 'TOO_SHORT',
      message: 'Invalid input: Offer text must be at least 25 characters long to audit.',
    };
  }

  // 2. Direct URL link submission (e.g. pasted genuine or scam link)
  const isDirectUrl = /^(https?:\/\/|www\.)\S+$/i.test(trimmed);
  if (isDirectUrl) {
    return { isValid: true };
  }

  // 3. Repetitive characters / low entropy rule
  const charWithoutSpace = trimmed.replace(/\s+/g, '');
  const uniqueChars = new Set(charWithoutSpace.toLowerCase());
  if (charWithoutSpace.length >= 25 && uniqueChars.size < 4) {
    return {
      isValid: false,
      code: 'REPETITIVE_TEXT',
      message: 'Invalid input: The text contains repetitive characters or placeholder content.',
    };
  }

  // 4. Repeated character flood rule (e.g. "aaaaaaaa", "xxxxxxxxx").
  // Restrict to alphabetic characters so standard document divider lines, borders,
  // underlines, and dot leaders (e.g. "----------", "==========", "..........", "__________")
  // commonly produced by OCR or ASCII formatting are not incorrectly rejected.
  if (/([a-zA-Z])\1{7,}/.test(trimmed)) {
    return {
      isValid: false,
      code: 'REPETITIVE_TEXT',
      message: 'Invalid input: The text contains excessive repeated characters.',
    };
  }

  // 3. Word separation rule (must have multiple distinct words, not unbroken string)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 3) {
    return {
      isValid: false,
      code: 'UNREADABLE',
      message: 'Invalid input: Please provide readable text with separate words, not an unbroken sequence of characters.',
    };
  }

  // 4. Vowel / Keyboard mash rule for Latin text
  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 20 && !/[aeiou]/i.test(letters)) {
    return {
      isValid: false,
      code: 'KEYBOARD_MASH',
      message: 'Invalid input: The text appears to be random keyboard keystrokes rather than readable language.',
    };
  }

  // 5. Offer / Employment context relevance rule
  const hasOfferKeywords = OFFER_INDICATOR_REGEX.test(trimmed);
  const hasContactOrFinancial = CONTACT_OR_FINANCIAL_REGEX.test(trimmed);

  if (!hasOfferKeywords && !hasContactOrFinancial) {
    return {
      isValid: false,
      code: 'NO_OFFER_CONTEXT',
      message: 'Invalid input: The text does not appear to be a job offer, internship letter, scholarship, or recruitment message. Please provide valid offer content to audit.',
    };
  }

  return { isValid: true };
}
