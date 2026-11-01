import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { loadEnv, resetCachedEnv } from '../config/env.js';
import * as safeFetchModule from '../lib/safeFetch.js';

describe('Server Invariants (invariants.test.ts)', () => {
  const app = createApp({ enableRateLimiting: false });

  describe('Invariant 1: AI observation can NEVER change offer verification status', () => {
    it('preserves status identically whether AI analysis is enabled or disabled', async () => {
      const payload = {
        text: 'Infosys Campus Connect: Congratulations! You are selected for Summer Internship 2026. Official notice: We never ask for any payment or registration fee at any stage.',
        domain: 'internship',
        sender: {
          organization: 'Infosys',
          isOfficialCorporateDomain: true,
        },
      };

      const resNoAi = await request(app)
        .post('/api/analyze')
        .send({ ...payload, consentFlags: { aiAnalysis: false } });

      const resWithAi = await request(app)
        .post('/api/analyze')
        .send({ ...payload, consentFlags: { aiAnalysis: true } });

      expect(resNoAi.status).toBe(200);
      expect(resWithAi.status).toBe(200);

      // Status must match exactly
      expect(resWithAi.body.data.status).toBe(resNoAi.body.data.status);
      expect(resWithAi.body.data.status).toBe('LIKELY_GENUINE');
    });

    it('preserves HIGH_CONCERN on scam offers even with AI consent', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Selected for QA Intern. Please pay 2000 rupees registration fees to hr@upi to confirm selection.',
          domain: 'internship',
          consentFlags: { aiAnalysis: true },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.status).not.toBe('CONFIRMED_SCAM');
    });
  });

  describe('Invariant 2: CONFIRMED_SCAM is unreachable from text input alone', () => {
    it('returns HIGH_CONCERN (never CONFIRMED_SCAM) even on maximally adversarial scam messages', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'URGENT IMMEDIATE ACTION: You must pay ₹5000 registration fee right now! Send your debit card PIN and bank OTP within 5 minutes to reserve job at TCS. Contact us at tcs-hr-recruiter@gmail.com or visit http://tcs-careers-online.net/login immediately!',
          domain: 'job',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.status).not.toBe('CONFIRMED_SCAM');
    });
  });

  describe('Invariant 3: The server NEVER fetches URLs found in user messages', () => {
    it('does not trigger safeFetch on URLs embedded in submitted offer text', async () => {
      const safeFetchSpy = vi.spyOn(safeFetchModule, 'safeFetch');

      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Please check the job description and application form at https://malicious-phishing-trap.com/apply and complete registration at https://evil-scam-site.org/register right now.',
          domain: 'job',
        });

      expect(res.status).toBe(200);

      // The server must NEVER have called safeFetch for message URLs
      const calledUrls = safeFetchSpy.mock.calls.map((call) => call[0]);
      expect(calledUrls).not.toContain('https://malicious-phishing-trap.com/apply');
      expect(calledUrls).not.toContain('https://evil-scam-site.org/register');

      safeFetchSpy.mockRestore();
    });
  });

  describe('Invariant 4: Zero secrets in any API response', () => {
    const FORBIDDEN_LITERALS = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'REPORT_HASH_PEPPER',
      'SAFE_BROWSING_API_KEY',
      'change-this-to-a-secure-random-pepper',
      'test-secure-pepper-with-at-least-24-chars',
    ];

    const JWT_REGEX = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;

    async function assertNoSecretsInResponse(res: request.Response) {
      const text = JSON.stringify(res.body);

      for (const token of FORBIDDEN_LITERALS) {
        expect(text).not.toContain(token);
      }

      expect(JWT_REGEX.test(text)).toBe(false);
    }

    it('ensures /api/health exposes zero secret keys', async () => {
      const res = await request(app).get('/api/health');
      await assertNoSecretsInResponse(res);
    });

    it('ensures /api/analyze exposes zero secret keys', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Selected for Summer Internship 2026. Official notice: We never ask for any payment or registration fee at any stage.',
        });
      await assertNoSecretsInResponse(res);
    });

    it('ensures error responses expose zero secret keys or stack traces', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({ text: 'Short' });
      await assertNoSecretsInResponse(res);
      expect(res.body.error).not.toHaveProperty('stack');
    });
  });

  describe('Invariant 5: Production refusal on missing or placeholder pepper', () => {
    it('refuses to start in production if REPORT_HASH_PEPPER is missing or placeholder', () => {
      const savedEnv = { ...process.env };

      try {
        process.env.NODE_ENV = 'production';
        process.env.SUPABASE_URL = 'https://prod.supabase.co';
        process.env.SUPABASE_ANON_KEY = 'real-anon-key-12345';

        // 1. Missing pepper
        delete process.env.REPORT_HASH_PEPPER;
        resetCachedEnv();
        expect(() => loadEnv()).toThrow(/Production startup refused.*REPORT_HASH_PEPPER/);

        // 2. Default placeholder pepper
        process.env.REPORT_HASH_PEPPER = 'change-this-to-a-secure-random-pepper-at-least-24-chars-long';
        resetCachedEnv();
        expect(() => loadEnv()).toThrow(/default placeholder pepper/);

        // 3. Short pepper (<24 chars)
        process.env.REPORT_HASH_PEPPER = 'too-short';
        resetCachedEnv();
        expect(() => loadEnv()).toThrow(/at least 24 characters/);
      } finally {
        process.env = savedEnv;
        resetCachedEnv();
      }
    });
  });
});

