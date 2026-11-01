import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createTestJwt } from '../lib/jwt.js';
import {
  clearInMemoryHistory,
  getInMemorySubmissions,
} from '../lib/historyRepository.js';

describe('Phase 6D: Auth, Dashboard & Multi-User Isolation Flow', () => {
  const app = createApp({ enableRateLimiting: false });

  const userA = {
    id: 'a1111111-aaaa-4111-aaaa-111111111111',
    email: 'user_a@campus.edu.in',
    role: 'user' as const,
  };

  const userB = {
    id: 'b2222222-bbbb-4222-bbbb-222222222222',
    email: 'user_b@campus.edu.in',
    role: 'user' as const,
  };

  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    clearInMemoryHistory();
    tokenA = await createTestJwt(userA);
    tokenB = await createTestJwt(userB);
  });

  describe('1. Register -> Login -> Analyze with Save -> History -> Delete Flow', () => {
    it('executes full end-to-end lifecycle for an authenticated student', async () => {
      // 1. Authenticated user analyzes an offer with saveToHistory = true
      const analyzeRes = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Congratulations! You are selected as Intern at TCS. Deposit ₹3,500 laptop security deposit via UPI to hr@okaxis.',
          domain: 'internship',
          channel: 'whatsapp',
          inputType: 'offer_letter',
          saveToHistory: true,
          consentFlags: {
            aiAnalysis: false,
            shareIndicators: false,
          },
        });

      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.data.status).toBe('HIGH_CONCERN');
      const auditId = analyzeRes.body.data.auditId;
      expect(auditId).toBeDefined();

      // 2. Fetch history from /api/history
      const historyRes = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.items).toHaveLength(1);
      const savedSubmission = historyRes.body.data.items[0];
      expect(savedSubmission.id).toBe(auditId);
      expect(savedSubmission.domain).toBe('internship');
      expect(savedSubmission.result.status).toBe('HIGH_CONCERN');

      // 3. User views past result via /api/history/:id
      const detailRes = await request(app)
        .get(`/api/history/${auditId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.id).toBe(auditId);
      expect(detailRes.body.data.result.status).toBe('HIGH_CONCERN');

      // 4. User deletes the history entry via DELETE /api/history/:id
      const deleteRes = await request(app)
        .delete(`/api/history/${auditId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.success).toBe(true);
      expect(deleteRes.body.data.deletedId).toBe(auditId);

      // 5. Verify history is now empty
      const historyAfterDelete = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(historyAfterDelete.status).toBe(200);
      expect(historyAfterDelete.body.data.items).toHaveLength(0);
      expect(historyAfterDelete.body.data.pagination.total).toBe(0);
    });
  });

  describe('2. Multi-User Isolation: User B NEVER sees User A History', () => {
    it('guarantees complete isolation between User A and User B', async () => {
      // User A submits an offer
      const resA = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Exclusive offer from Infosys Technologies for campus student. Stipend Rs 25000 per month.',
          domain: 'internship',
          channel: 'email',
          saveToHistory: true,
        });

      const auditIdA = resA.body.data.auditId;
      expect(auditIdA).toBeDefined();

      // User B submits a different offer
      const resB = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          text: 'Immediate hiring for Freelance Typist. Pay Rs 1000 registration fee to start tasks.',
          domain: 'freelance',
          channel: 'telegram',
          saveToHistory: true,
        });

      const auditIdB = resB.body.data.auditId;
      expect(auditIdB).toBeDefined();

      // Check User A history: strictly contains only User A's submission
      const historyA = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(historyA.body.data.items).toHaveLength(1);
      expect(historyA.body.data.items[0].id).toBe(auditIdA);
      expect(historyA.body.data.items[0].id).not.toBe(auditIdB);

      // Check User B history: strictly contains only User B's submission
      const historyB = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(historyB.body.data.items).toHaveLength(1);
      expect(historyB.body.data.items[0].id).toBe(auditIdB);
      expect(historyB.body.data.items[0].id).not.toBe(auditIdA);

      // Cross-tenant access attempt: User B tries to view User A's submission
      const crossGetRes = await request(app)
        .get(`/api/history/${auditIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);

      // Must be 404 Not Found (or 403 Forbidden) to prevent ID enumeration
      expect(crossGetRes.status).toBe(404);

      // Cross-tenant delete attempt: User B tries to delete User A's submission
      const crossDelRes = await request(app)
        .delete(`/api/history/${auditIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(crossDelRes.status).toBe(404);

      // Verify User A submission is still safe and intact
      const verifyA = await request(app)
        .get(`/api/history/${auditIdA}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(verifyA.status).toBe(200);
      expect(verifyA.body.data.id).toBe(auditIdA);
    });
  });

  describe('3. Guest Flow Unchanged', () => {
    it('allows guest users to analyze offers without authentication or saving to database', async () => {
      const guestRes = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Congratulations! You are selected as Software Trainee. Please report at campus center on Monday.',
          domain: 'job',
          channel: 'email',
          saveToHistory: false,
        });

      expect(guestRes.status).toBe(200);
      expect(guestRes.body.data.status).toBe('NEEDS_REVIEW');
      expect(guestRes.body.data.auditId).toBeDefined();

      // Ensure zero submissions were saved into the database store for guests
      const inMemory = getInMemorySubmissions();
      expect(inMemory).toHaveLength(0);

      // Unauthenticated access to /api/history is rejected
      const unauthHistoryRes = await request(app).get('/api/history');
      expect(unauthHistoryRes.status).toBe(401);
      expect(unauthHistoryRes.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
