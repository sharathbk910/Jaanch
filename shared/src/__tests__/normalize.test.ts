import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  normalizeForMatching,
  findSpan,
} from '../normalize/index.js';

describe('Text Normalization & Span Utilities', () => {
  it('normalizes NFKC characters correctly', () => {
    // Full-width characters
    const fullWidth = 'ＴＥＳＴ　１２３';
    expect(normalizeText(fullWidth)).toBe('TEST 123');
  });

  it('strips zero-width and bidirectional formatting characters', () => {
    const textWithZeroWidth = 'T\u200Be\u200Cc\u200Dh\uFEFFCorp\u200E';
    expect(normalizeText(textWithZeroWidth)).toBe('TechCorp');
  });

  it('folds common Cyrillic and Greek homoglyphs to ASCII equivalents', () => {
    // Cyrillic 'а', 'е', 'о', 'р', 'с'
    const homoglyphText = 'T\u0430t\u0430 \u0421onsultancy';
    expect(normalizeText(homoglyphText)).toBe('Tata Consultancy');
  });

  it('collapses multiple whitespace and newlines cleanly', () => {
    const messy = 'Hello   world!\r\n\r\n\tThis   is    Jaanch.  ';
    expect(normalizeText(messy)).toBe('Hello world!\n\nThis is Jaanch.');
  });

  it('preserves rupee amounts and symbols without distortion', () => {
    const rupeeText = 'Stipend: ₹25,000 or Rs. 25000 / INR 25,000';
    expect(normalizeText(rupeeText)).toBe('Stipend: ₹25,000 or Rs. 25000 / INR 25,000');
  });

  it('normalizeForMatching returns lowercase normalized text', () => {
    const text = 'UPFRONT Registration FEE ₹500';
    expect(normalizeForMatching(text)).toBe('upfront registration fee ₹500');
  });

  describe('findSpan() whole-word extraction', () => {
    const sample = 'Congratulations candidate! A refundable security deposit of ₹5000 is required for onboarding kit.';

    it('extracts span around match without cutting words in half', () => {
      const matchWord = 'security deposit';
      const idx = sample.indexOf(matchWord);
      const span = findSpan(sample, idx, matchWord.length, 50);

      expect(span).toContain('security deposit');
      // Must not start or end with a partial word
      const words = span.split(/\s+/);
      expect(words[0].length).toBeGreaterThan(1);
      expect(words[words.length - 1].length).toBeGreaterThan(1);
    });

    it('enforces maximum character budget of <= 160 characters', () => {
      const longText = 'A'.repeat(50) + ' keyword ' + 'B'.repeat(200);
      const span = findSpan(longText, 51, 7, 160);
      expect(span.length).toBeLessThanOrEqual(160);
    });

    it('handles match at the very beginning and very end of string', () => {
      const startSpan = findSpan('Initial match in text', 0, 7, 50);
      expect(startSpan.startsWith('Initial')).toBe(true);

      const endText = 'Some context before trailing match';
      const endSpan = findSpan(endText, endText.indexOf('match'), 5, 50);
      expect(endSpan.endsWith('match')).toBe(true);
    });
  });
});
