import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import { createApp } from '../app.js';
import { loadEnv } from '../config/env.js';
import { verifyWhatsAppSignature } from '../routes/whatsapp.js';

describe('WhatsApp Channel Webhook & Sharing (Phase 9)', () => {
  const app = createApp({ enableRateLimiting: false });
  const env = loadEnv();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Signature Verification Utility', () => {
    it('verifies valid HMAC-SHA256 signatures timing-safely', () => {
      const secret = 'test-secret-12345';
      const body = JSON.stringify({ test: 'payload' });
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

      expect(verifyWhatsAppSignature(body, `sha256=${signature}`, secret)).toBe(true);
      expect(verifyWhatsAppSignature(body, 'sha256=invalidhex', secret)).toBe(false);
      expect(verifyWhatsAppSignature(body, 'md5=something', secret)).toBe(false);
      expect(verifyWhatsAppSignature(body, undefined, secret)).toBe(false);
    });
  });

  describe('GET /api/whatsapp/webhook (Meta Webhook Handshake)', () => {
    it('returns challenge with HTTP 200 on matching verification token', async () => {
      const challenge = 'random_challenge_code_12345';
      const res = await request(app)
        .get('/api/whatsapp/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': env.WHATSAPP_VERIFY_TOKEN,
          'hub.challenge': challenge,
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe(challenge);
    });

    it('returns HTTP 403 on mismatched verification token', async () => {
      const res = await request(app)
        .get('/api/whatsapp/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token-abc',
          'hub.challenge': 'some_challenge',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/whatsapp/webhook (Inbound Parsing & Zero-Auto-Send)', () => {
    it('processes inbound scam message and generates advisory without unsolicited external outbound calls', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const inboundPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+919999900000',
                    phone_number_id: 'PHONE_NUMBER_ID',
                  },
                  messages: [
                    {
                      from: '919876543210',
                      id: 'wamid.HBgLMTIzNDU2Nzg5MA==',
                      timestamp: '1700000000',
                      type: 'text',
                      text: {
                        body: 'Congratulations! You are selected for Work From Home job. Pay Rs 2,500 registration fee to upi recruiter@okaxis immediately to confirm.',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post('/api/whatsapp/webhook')
        .send(inboundPayload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.processed).toBe(1);
      expect(res.body.replies[0].to).toBe('919876543210');
      expect(res.body.replies[0].status).toBe('HIGH_CONCERN');
      expect(res.body.replies[0].message).toContain('HIGH CONCERN');
      expect(res.body.replies[0].message).toContain('1930');

      // Zero-Auto-Send Invariant: System never sends unsolicited outbound network dispatches
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('rejects invalid signature when WHATSAPP_APP_SECRET is set', async () => {
      const originalSecret = env.WHATSAPP_APP_SECRET;
      env.WHATSAPP_APP_SECRET = 'active-test-secret';

      try {
        const payload = { object: 'whatsapp_business_account', entry: [] };
        const res = await request(app)
          .post('/api/whatsapp/webhook')
          .send(payload)
          .set('Content-Type', 'application/json')
          .set('x-hub-signature-256', 'sha256=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad');

        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('INVALID_SIGNATURE');
      } finally {
        env.WHATSAPP_APP_SECRET = originalSecret;
      }
    });

    it('rejects invalid payload format with 400', async () => {
      const res = await request(app)
        .post('/api/whatsapp/webhook')
        .send({ invalid: 'non-conforming-schema', entry: 'not-an-array' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('POST /api/whatsapp/share-intent (Confirmed-Only Intent Generator)', () => {
    it('generates a privacy-safe WhatsApp share URL for confirmed scams', async () => {
      const res = await request(app)
        .post('/api/whatsapp/share-intent')
        .send({
          status: 'CONFIRMED_SCAM',
          publicId: 'JNC-INTEL-TEST999',
          matchedIndicators: ['phish-portal.example', '+91 99999 00000'],
          claimedOrg: 'Test Org',
          language: 'en',
        })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.shareUrl).toContain('https://api.whatsapp.com/send?text=');
      expect(res.body.data.safeText).toContain('SCAM ALERT [Jaanch Verification JNC-INTEL-TEST999]');
      expect(res.body.data.safeText).toContain('1930');
      expect(res.body.data.safeText).toContain('cybercrime.gov.in');
    });

    it('validates schema and rejects missing or invalid status', async () => {
      const res = await request(app)
        .post('/api/whatsapp/share-intent')
        .send({
          status: 'INVALID_STATUS_UNKNOWN',
        })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });
  });
});
