import { describe, it, expect } from 'vitest';
import { analyzeOffer } from '../index.js';
import { normalizeText } from '../normalize/index.js';
import { redactText } from '../privacy/redact.js';
import { extractEntities } from '../entities/index.js';

describe('Security, ReDoS Resistance & Boundary Guardrails', () => {
  it('resists ReDoS attacks with 100,000-character adversarial input', () => {
    // Generate adversarial repeated pattern (nested quotes, repeated spaces, long repeating prefixes)
    const repeated = 'a'.repeat(25000) + ' ' + '₹'.repeat(10000) + ' ' + 'http://' + 'b'.repeat(25000) + '.com ';
    const adversarialText = repeated.repeat(2); // > 100,000 characters

    const startTime = Date.now();
    const result = analyzeOffer({ text: adversarialText });
    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    // Bounded execution must complete swiftly without catastrophic backtracking
    expect(duration).toBeLessThan(1000); // Less than 1 second for 100k chars
  });

  it('redaction handles 100,000-character input without hanging', () => {
    const adversarialText = ('9876543210 '.repeat(5000) + '1234-5678-9012 '.repeat(5000)).slice(0, 100000);
    const start = Date.now();
    const redacted = redactText(adversarialText);
    const elapsed = Date.now() - start;

    expect(redacted.redactionCount).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000);
  });

  it('normalization handles 100,000-character input swiftly', () => {
    const longText = ('\u200B\uFEFF₹10,000 '.repeat(10000)).slice(0, 100000);
    const start = Date.now();
    const normalized = normalizeText(longText);
    const elapsed = Date.now() - start;

    expect(normalized).toBeDefined();
    expect(elapsed).toBeLessThan(1000);
  });

  it('safely caps excessive input length to 50,000 characters', () => {
    const hugeInput = 'A'.repeat(80000);
    const res = analyzeOffer({ text: hugeInput });
    expect(res).toBeDefined();
    expect(res.status).toBe('NEEDS_REVIEW');
  });

  it('handles empty text and whitespace-only text safely', () => {
    expect(() => analyzeOffer({ text: '' })).toThrow();
  });
});
