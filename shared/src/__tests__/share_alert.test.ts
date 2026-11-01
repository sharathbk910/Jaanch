import { describe, it, expect } from 'vitest';
import { buildScamAlert, sanitizeShareText } from '../share/alertBuilder.js';

describe('Phase 9: WhatsApp Scam-Alert Sharing (shared/src/share)', () => {
  const mockPublicId = 'JNC-INTEL-8842ABCD';
  const mockDate = '2026-11-01T10:00:00.000Z';
  const mockScamText =
    'URGENT: Selected as Software Trainee at TechCorp. Deposit ₹4,500 laptop caution money to UPI hr@okaxis. Contact Rahul on +91 98765 43210 with Aadhaar 1234 5678 9012.';

  describe('Builder Output Across Languages (EN, HI, KN)', () => {
    it('builds English scam alert with verification line, safety tips, and 1930 helpline', () => {
      const res = buildScamAlert({
        language: 'en',
        publicId: mockPublicId,
        confirmedAt: mockDate,
        originalText: mockScamText,
        includeExcerpt: true,
      });

      expect(res.headline).toBe('⚠️ SCAM ALERT: Verified Fraud Warning');
      expect(res.verificationLine).toContain('Matched a moderator-confirmed scam record');
      expect(res.verificationLine).toContain(mockPublicId);
      expect(res.verificationLine).toContain('2026-11-01');
      expect(res.fullMessage).toContain('National Cybercrime Helpline: 1930');
      expect(res.fullMessage).toContain('https://cybercrime.gov.in');
      expect(res.fullMessage).toContain('https://jaanch.ai');
      expect(res.tips.length).toBeGreaterThanOrEqual(3);
      expect(res.shareUrl.startsWith('https://wa.me/?text=')).toBe(true);
    });

    it('builds Hindi scam alert with Devanagari copy and official helpline', () => {
      const res = buildScamAlert({
        language: 'hi',
        publicId: mockPublicId,
        confirmedAt: mockDate,
        originalText: mockScamText,
        includeExcerpt: true,
      });

      expect(res.headline).toContain('धोखाधड़ी चेतावनी');
      expect(res.verificationLine).toContain('मॉडरेटर द्वारा पुष्ट धोखाधड़ी रिकॉर्ड');
      expect(res.verificationLine).toContain(mockPublicId);
      expect(res.fullMessage).toContain('1930');
      expect(res.fullMessage).toContain('https://cybercrime.gov.in');
      expect(res.fullMessage).toContain('https://jaanch.ai');
      expect(res.tips.some((tip) => tip.includes('पंजीकरण'))).toBe(true);
    });

    it('builds Kannada scam alert with Kannada script copy and official helpline', () => {
      const res = buildScamAlert({
        language: 'kn',
        publicId: mockPublicId,
        confirmedAt: mockDate,
        originalText: mockScamText,
        includeExcerpt: true,
      });

      expect(res.headline).toContain('ವಂಚನೆ ಎಚ್ಚರಿಕೆ');
      expect(res.verificationLine).toContain('ಮಾಡರೇಟರ್ ದೃಢಪಡಿಸಿದ ವಂಚನೆ ದಾಖಲೆ');
      expect(res.verificationLine).toContain(mockPublicId);
      expect(res.fullMessage).toContain('1930');
      expect(res.fullMessage).toContain('https://cybercrime.gov.in');
      expect(res.fullMessage).toContain('https://jaanch.ai');
      expect(res.tips.some((tip) => tip.includes('ಶುಲ್ಕ'))).toBe(true);
    });
  });

  describe('Security, Sanitization & PII Masking', () => {
    it('masks raw Aadhaar, phone, and email in excerpt before formatting', () => {
      const res = buildScamAlert({
        language: 'en',
        publicId: mockPublicId,
        originalText: mockScamText,
        includeExcerpt: true,
      });

      // Assert raw PII never appears in formatted message or share URL
      expect(res.fullMessage).not.toContain('1234 5678 9012');
      expect(res.fullMessage).not.toContain('+91 98765 43210');
      expect(res.shareUrl).not.toContain('1234 5678 9012');
      expect(res.shareUrl).not.toContain('+91 98765 43210');
      // Must contain masked redaction tokens
      expect(res.fullMessage).toContain('[AADHAAR]');
      expect(res.fullMessage).toContain('[PHONE]');
    });

    it('completely excludes excerpt when includeExcerpt is false', () => {
      const res = buildScamAlert({
        language: 'en',
        publicId: mockPublicId,
        originalText: mockScamText,
        includeExcerpt: false,
      });

      expect(res.excerpt).toBeUndefined();
      expect(res.fullMessage).not.toContain('Redacted excerpt');
      expect(res.fullMessage).not.toContain('[AADHAAR]');
    });

    it('strips dangerous control and bidirectional override characters', () => {
      const spoofed = 'Hello\u202E\u200F\u0000World\u0007!';
      const clean = sanitizeShareText(spoofed);
      expect(clean).toBe('HelloWorld!');
    });

    it('keeps XSS payloads completely inert as plain text', () => {
      const xssInput = '<script>alert("pwned")</script><img src=x onerror=alert(1)>';
      const res = buildScamAlert({
        language: 'en',
        publicId: mockPublicId,
        originalText: xssInput,
        includeExcerpt: true,
      });

      // No executable execution; raw characters are percent-encoded or plain text
      expect(res.fullMessage).toContain('<script>');
      expect(res.shareUrl).toContain(encodeURIComponent('<script>'));
    });
  });

  describe('URL Encoding & Round-Trip Decode Invariant', () => {
    it('decodes round-trip identically for English, Hindi, Kannada, emoji, ₹, and special characters', () => {
      const testCases = [
        { lang: 'en' as const, name: 'English with ₹ and emoji ⚠️ 🚨' },
        { lang: 'hi' as const, name: 'Hindi Devanagari with symbols & newlines' },
        { lang: 'kn' as const, name: 'Kannada Unicode with symbols & special characters' },
      ];

      for (const tc of testCases) {
        const alert = buildScamAlert({
          language: tc.lang,
          publicId: mockPublicId,
          confirmedAt: mockDate,
          originalText: mockScamText + ' ₹9,999 deposit & verification #445 % 100.',
          includeExcerpt: true,
        });

        const prefix = 'https://wa.me/?text=';
        expect(alert.shareUrl.startsWith(prefix)).toBe(true);

        const encodedQuery = alert.shareUrl.slice(prefix.length);
        const decodedMessage = decodeURIComponent(encodedQuery);

        // Strict Round-Trip Invariant: Decoded string equals original message verbatim
        expect(decodedMessage).toBe(alert.fullMessage);
      }
    });
  });

  describe('Length Handling & Trimming', () => {
    it('trims excerpt first when encoded message exceeds max safe length', () => {
      const longMessage = 'A'.repeat(500) + ' deposit ₹5000 ' + 'B'.repeat(500);

      const res = buildScamAlert({
        language: 'en',
        publicId: mockPublicId,
        originalText: longMessage,
        includeExcerpt: true,
        maxEncodedUrlLength: 1200,
      });

      expect(res.isTrimmed).toBe(true);
      expect(res.trimmedReason).toBeDefined();
      expect(res.shareUrl.length).toBeLessThanOrEqual(1200);
    });
  });
});
