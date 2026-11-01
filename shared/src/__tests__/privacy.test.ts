import { describe, it, expect } from 'vitest';
import { redactText } from '../privacy/redact.js';

describe('Privacy Redaction Utility (privacy/redact.ts)', () => {
  it('redacts 12-digit continuous Aadhaar numbers', () => {
    const text = 'Candidate Aadhaar: 123456789012 for verification.';
    const result = redactText(text);
    expect(result.redactedText).toBe('Candidate Aadhaar: [AADHAAR] for verification.');
    expect(result.redactionCount).toBe(1);
  });

  it('redacts spaced and dashed Aadhaar numbers', () => {
    const text = 'UIDAI numbers: 1234 5678 9012 and 9876-5432-1098.';
    const result = redactText(text);
    expect(result.redactedText).toBe('UIDAI numbers: [AADHAAR] and [AADHAAR].');
    expect(result.redactionCount).toBe(2);
  });

  it('redacts Indian phone numbers with +91 or 10-digit formats', () => {
    const text = 'Call recruiter at +91-9876543210 or alternate 9876543210 or 08765432109.';
    const result = redactText(text);
    expect(result.redactedText).toBe('Call recruiter at [PHONE] or alternate [PHONE] or [PHONE].');
    expect(result.redactionCount).toBe(3);
  });

  it('redacts UPI / VPA handles', () => {
    const text = 'Pay registration fee to account student.care@okhdfcbank or scammer@paytm.';
    const result = redactText(text);
    expect(result.redactedText).toBe('Pay registration fee to account [UPI] or [UPI].');
    expect(result.redactionCount).toBe(2);
  });

  it('redacts personal email while strictly PRESERVING the domain', () => {
    const text = 'Contact us at hr.official.tcs@gmail.com or support@outlook.com.';
    const result = redactText(text);
    // Domain must remain intact for rule analysis!
    expect(result.redactedText).toBe('Contact us at [EMAIL]@gmail.com or [EMAIL]@outlook.com.');
    expect(result.redactionCount).toBe(2);
  });

  it('handles composite message with mixed PII', () => {
    const text =
      'Send ₹1000 to hr@okhdfcbank, call +91 98765 43210, mail rahul.sharma@yahoo.co.in with Aadhaar 4521 8963 1245.';
    const result = redactText(text);
    expect(result.redactedText).toContain('[UPI]');
    expect(result.redactedText).toContain('[PHONE]');
    expect(result.redactedText).toContain('[EMAIL]@yahoo.co.in');
    expect(result.redactedText).toContain('[AADHAAR]');
    expect(result.redactionCount).toBe(4);
  });

  it('handles empty or clean text without unwanted modification', () => {
    expect(redactText('').redactedText).toBe('');
    expect(redactText('Normal text with no secrets.').redactedText).toBe('Normal text with no secrets.');
  });
});
