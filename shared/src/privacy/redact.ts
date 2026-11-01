// ReDoS-safe, bounded regex patterns for sensitive indicators

// 1. Aadhaar (12 digits, optional spaces or dashes)
const AADHAAR_REGEX = /\b(?:\d{4}[\s-]?){2}\d{4}\b/g;

// 2. Indian Phone numbers (+91-XXXXX-XXXXX, +91XXXXXXXXXX, 0XXXXXXXXXX, 10-digit starting 6-9)
const PHONE_REGEX = /(?:\+91[\s-]?)?(?:\b[6-9]\d{4}[\s-]?\d{5}\b|\b0[6-9]\d{9}\b)/g;

// 3. Email regex: preserves the domain part while masking the local part
const EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;

// 4. Known UPI / VPA banking handles
const UPI_REGEX = /\b[a-zA-Z0-9._-]{2,}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|barodampay|federal|idfcbank|icici|kotak|postbank|sbi|hdfcbank|axisbank|pnb)\b/gi;

// 5. Introductory student names ("My name is Rahul Sharma", "I am Priya", "Student Name: ...")
const NAME_INTRO_REGEX = /\b(?:My name is|I am|Student Name:?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/gi;

export interface RedactionResult {
  redactedText: string;
  redactionCount: number;
}

/**
 * Redacts personal identifying information (PII) from text:
 * - Aadhaar numbers -> [AADHAAR]
 * - Phone numbers -> [PHONE]
 * - Email addresses -> [EMAIL]@domain.ext (Preserves the domain for rule verification)
 * - UPI IDs -> [UPI]
 */
export function redactText(rawText: string): RedactionResult {
  if (!rawText) {
    return { redactedText: '', redactionCount: 0 };
  }

  let count = 0;
  let text = rawText;

  // 1. Redact Aadhaar
  text = text.replace(AADHAAR_REGEX, () => {
    count++;
    return '[AADHAAR]';
  });

  // 2. Redact Phone numbers
  text = text.replace(PHONE_REGEX, () => {
    count++;
    return '[PHONE]';
  });

  // 3. Redact UPI IDs
  text = text.replace(UPI_REGEX, () => {
    count++;
    return '[UPI]';
  });

  // 4. Redact Email addresses while PRESERVING domain
  text = text.replace(EMAIL_REGEX, (_match, _local, domain) => {
    count++;
    return `[EMAIL]@${domain}`;
  });

  // 5. Redact introductory student names
  text = text.replace(NAME_INTRO_REGEX, () => {
    count++;
    return 'My name is [NAME]';
  });

  return {
    redactedText: text,
    redactionCount: count,
  };
}
