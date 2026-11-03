import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { type Request, type Response } from 'express';
import { createApp } from '../app.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

describe('Server API Endpoints & Middlewares (api.test.ts)', () => {
  const app = createApp({ enableRateLimiting: false });

  describe('GET /api/health', () => {
    it('returns 200 OK with server health, version, and request tracking', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('version', '1.0.0');
      expect(typeof res.body.uptime).toBe('number');
      expect(typeof res.body.timestamp).toBe('string');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  describe('GET /api/history (Auth interface)', () => {
    it('returns 401 UNAUTHORIZED until Phase 4 supplies the implementation', async () => {
      const res = await request(app).get('/api/history');

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });
  });

  describe('POST /api/analyze validation & processing', () => {
    it('rejects missing payload with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'application/json')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(res.body.error.details.some((d: { path: string }) => d.path === 'text')).toBe(true);
    });

    it('rejects text under 20 characters with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({ text: 'Too short text' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(
        res.body.error.details.some(
          (d: { path: string; message: string }) =>
            d.path === 'text' && d.message.includes('at least 20 characters')
        )
      ).toBe(true);
    });

    it('rejects non-JSON Content-Type with 415 Unsupported Media Type', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'text/plain')
        .send('This is a plain text body without json header');

      expect(res.status).toBe(415);
      expect(res.body.error).toHaveProperty('code', 'UNSUPPORTED_MEDIA_TYPE');
    });

    it('rejects payload exceeding 256 KB with 413 PAYLOAD_TOO_LARGE', async () => {
      const largePayload = 'A'.repeat(280 * 1024);
      const res = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'application/json')
        .send({ text: largePayload });

      expect(res.status).toBe(413);
      expect(res.body.error).toHaveProperty('code', 'PAYLOAD_TOO_LARGE');
    });

    it('analyzes legitimate offer with corporate sender and disclaimer as LIKELY_GENUINE', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Infosys Campus Connect: Congratulations! You are selected for Summer Internship 2026. Official notice: We never ask for any payment or registration fee at any stage.',
          domain: 'internship',
          sender: {
            organization: 'Infosys',
            isOfficialCorporateDomain: true,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('LIKELY_GENUINE');
      expect(res.body.data.confidenceScore).toBeGreaterThanOrEqual(70);
      expect(res.body.data.signals.some((s: { ruleId: string }) => s.ruleId === 'RULE_GENUINE_DISCLAIMER')).toBe(true);
    });

    it('identifies upfront fee demands as HIGH_CONCERN', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Selected for QA Intern. Please pay 2000 rupees registration fees to hr@upi to confirm selection.',
          domain: 'internship',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.signals.some((s: { ruleId: string }) => s.ruleId === 'RULE_UPFRONT_FEE')).toBe(true);
    });

    it('identifies Hinglish fee demands as HIGH_CONCERN', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Aapka selection ho gaya hai. Registration fees jama kare turant seat confirm karne ke liye.',
          domain: 'job',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.signals.some((s: { ruleId: string }) => s.ruleId === 'RULE_UPFRONT_FEE')).toBe(true);
    });

    it('identifies Kannada fee demands as HIGH_CONCERN', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Nimma aayke aagide. Dayavittu nodani shulka pavathisi mundina hantadalli.',
          domain: 'job',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.signals.some((s: { ruleId: string }) => s.ruleId === 'RULE_UPFRONT_FEE')).toBe(true);
    });

    it('treats vague unverified offers as NEEDS_REVIEW', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'We are hiring part-time remote data entry assistants. Good hourly pay. Flexible timing.',
          domain: 'job',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('NEEDS_REVIEW');
      expect(res.body.data.unverified.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/link-check (3-level risk enum & observed/unverified)', () => {
    it('returns NO_MAJOR_WARNING_SIGNS for normal domains with observed and unverified arrays', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://careers.google.com/jobs/results' });

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('NO_MAJOR_WARNING_SIGNS');
      expect(Array.isArray(res.body.data.observed)).toBe(true);
      expect(Array.isArray(res.body.data.unverified)).toBe(true);
    }, 15000);

    it('returns HIGH_RISK for lookalike domain impersonating known brand', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://tcs-careers-portal.net/apply' });

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('HIGH_RISK');
      expect(res.body.data.observed.some((o: string) => o.includes('Lookalike'))).toBe(true);
    }, 15000);

    it('returns NEEDS_VERIFICATION for URL shortener', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://bit.ly/3internship' });

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('NEEDS_VERIFICATION');
    });

    it('returns HIGH_RISK for raw IP address hostname', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'http://192.168.1.1/letter.pdf' });

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('HIGH_RISK');
    });

    it('returns HIGH_RISK for punycode lookalike domain', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://xn--micrsoft-qbh.com/login' });

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('HIGH_RISK');
    });
  });

  describe('Security headers, CORS & Rate Limiting', () => {
    it('sets strict API CSP and security headers', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['content-security-policy']).toContain("default-src 'none'");
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('allows CORS from authorized CLIENT_ORIGINS only', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('allows CORS from production Vercel domain and preview subdomains with or without trailing slash', async () => {
      const resProd = await request(app)
        .get('/api/health')
        .set('Origin', 'https://jaanch-mu.vercel.app');
      expect(resProd.status).toBe(200);

      const resSlash = await request(app)
        .get('/api/health')
        .set('Origin', 'https://jaanch-mu.vercel.app/');
      expect(resSlash.status).toBe(200);

      const resPreview = await request(app)
        .get('/api/health')
        .set('Origin', 'https://jaanch-preview-stage.vercel.app');
      expect(resPreview.status).toBe(200);
    });

    it('blocks CORS from unauthorized origins with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://malicious-scam-site.org');

      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty('code', 'CORS_FORBIDDEN');
    });

    it('enforces rate limits per IP and returns 429 RATE_LIMIT_EXCEEDED', async () => {
      const limitedApp = express();
      const testLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 2,
        code: 'TEST_RATE_LIMIT_EXCEEDED',
      });
      limitedApp.use(testLimiter);
      limitedApp.get('/test', (_req: Request, res: Response) => {
        res.status(200).json({ ok: true });
      });

      await request(limitedApp).get('/test');
      await request(limitedApp).get('/test');
      const res3 = await request(limitedApp).get('/test');

      expect(res3.status).toBe(429);
      expect(res3.body.error).toHaveProperty('code', 'TEST_RATE_LIMIT_EXCEEDED');
    });
  });
});

