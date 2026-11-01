import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createTestJwt } from '../lib/jwt.js';
import { clearInMemoryHistory, getInMemorySubmissions } from '../lib/historyRepository.js';
import { getTestAuditLogs, clearTestAuditLogs } from '../lib/auditLog.js';

describe('Phase 4: Auth, Private History, RLS Isolation & Audit Logs', () => {
  const app = createApp({ enableRateLimiting: false });

  const userA = {
    id: 'a1111111-1111-4111-a111-111111111111',
    email: 'student_a@example.edu.in',
    role: 'user' as const,
  };

  const userB = {
    id: 'b2222222-2222-4222-b222-222222222222',
    email: 'student_b@example.edu.in',
    role: 'user' as const,
  };

  const moderatorUser = {
    id: 'm3333333-3333-4333-m333-333333333333',
    email: 'moderator@jaanch.ai',
    role: 'moderator' as const,
  };

  let tokenA: string;
  let tokenB: string;
  let tokenMod: string;

  beforeEach(async () => {
    clearInMemoryHistory();
    clearTestAuditLogs();

    tokenA = await createTestJwt(userA);
    tokenB = await createTestJwt(userB);
    tokenMod = await createTestJwt(moderatorUser);
  });

  describe('1. JWT Verification & Error Handling', () => {
    it('returns 401 when no token is provided to protected history endpoint', async () => {
      const res = await request(app).get('/api/history');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('No valid bearer token');
    });

    it('returns 401 when an expired JWT is provided', async () => {
      const expiredToken = await createTestJwt(userA, { expired: true });
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('expired');
    });

    it('returns 401 when a forged/tampered token with invalid signature is provided', async () => {
      const forgedToken = await createTestJwt(userA, {
        secret: 'wrong-secret-key-attacker-tried-to-forge-tokens!!',
      });
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when a malformed token string is provided', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', 'Bearer not-even-a-jwt');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('2. User Isolation & Multi-User Accounts (User A vs User B)', () => {
    it('User A can analyze and save to history; User B cannot read User A rows', async () => {
      // 1. User A analyzes an offer and saves to history
      const analyzeRes = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Selected for TCS Internship! Please transfer 5000 rupees registration fee to UPI tcs.hr@icici today.',
          saveToHistory: true,
          domain: 'internship',
          channel: 'whatsapp',
        });

      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.data.auditId).toBeDefined();
      const submissionIdA = analyzeRes.body.data.auditId;

      // 2. User A retrieves history: sees their submission
      const historyA = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(historyA.status).toBe(200);
      expect(historyA.body.data.items).toHaveLength(1);
      expect(historyA.body.data.items[0].id).toBe(submissionIdA);
      expect(historyA.body.data.items[0].domain).toBe('internship');

      // 3. User B retrieves history: gets empty list (isolated)
      const historyB = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(historyB.status).toBe(200);
      expect(historyB.body.data.items).toHaveLength(0);
      expect(historyB.body.data.pagination.total).toBe(0);

      // 4. User B attempts to DELETE User A submission: 404 Not Found
      const deleteAttempt = await request(app)
        .delete(`/api/history/${submissionIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(deleteAttempt.status).toBe(404);

      // 5. User A verifies submission is still intact
      const historyAAfter = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(historyAAfter.body.data.items).toHaveLength(1);

      // 6. User A deletes their own submission: 200 OK
      const deleteA = await request(app)
        .delete(`/api/history/${submissionIdA}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(deleteA.status).toBe(200);
      expect(deleteA.body.data.success).toBe(true);
      expect(deleteA.body.data.deletedId).toBe(submissionIdA);

      // 7. User A history is now empty
      const historyAFinal = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(historyAFinal.body.data.items).toHaveLength(0);
    });
  });

  describe('3. Role Escalation & RBAC Restrictions', () => {
    it('User with role "user" is denied 403 on moderator routes; writes audit log', async () => {
      const res = await request(app)
        .get('/api/history/moderator/audit-check')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Moderator role required');

      // Verify audit log captured role denial
      const logs = getTestAuditLogs();
      const denialLog = logs.find((l) => l.action === 'auth.role_denied');
      expect(denialLog).toBeDefined();
      expect(denialLog?.actor_id).toBe(userA.id);
      expect(denialLog?.meta?.attemptedRole).toBe('user');
    });

    it('Moderator user is permitted 200 on moderator routes; writes audit log', async () => {
      const res = await request(app)
        .get('/api/history/moderator/audit-check')
        .set('Authorization', `Bearer ${tokenMod}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('authorized');
      expect(res.body.data.moderatorId).toBe(moderatorUser.id);

      const logs = getTestAuditLogs();
      const accessLog = logs.find((l) => l.action === 'auth.role_accessed');
      expect(accessLog).toBeDefined();
      expect(accessLog?.actor_id).toBe(moderatorUser.id);
    });
  });

  describe('4. SQL-Injection Payloads are Inert', () => {
    it('rejects SQL injection in page parameter', async () => {
      const res = await request(app)
        .get('/api/history?page=1;DROP%20TABLE%20submissions;--')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects SQL injection in limit parameter', async () => {
      const res = await request(app)
        .get("/api/history?limit=' OR '1'='1")
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('inertly handles SQL injection in domain filter parameter', async () => {
      const res = await request(app)
        .get("/api/history?domain=' OR '1'='1")
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('rejects SQL injection in delete submission id param', async () => {
      const res = await request(app)
        .delete("/api/history/' OR '1'='1")
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('5. Guest vs Authenticated User Persistence Invariants', () => {
    it('unauthenticated guests can still analyze offers without creating history records', async () => {
      const initialSubs = getInMemorySubmissions().length;

      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Selected for TCS Internship! Please transfer 5000 rupees registration fee to UPI tcs.hr@icici today.',
          saveToHistory: true, // Requested, but ignored because caller is a guest
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      // No submission record was created in history
      expect(getInMemorySubmissions().length).toBe(initialSubs);
      expect(getInMemorySubmissions().some((s) => s.id === res.body.data.auditId)).toBe(false);
    });

    it('authenticated user with saveToHistory: false does not persist history', async () => {
      const initialSubs = getInMemorySubmissions().length;

      const res = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Selected for TCS Internship! Please transfer 5000 rupees registration fee to UPI tcs.hr@icici today.',
          saveToHistory: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      // No submission record was created in history
      expect(getInMemorySubmissions().length).toBe(initialSubs);
      expect(getInMemorySubmissions().some((s) => s.id === res.body.data.auditId)).toBe(false);
    });
  });

  describe('6. Privacy Erasure & Account Data Deletion', () => {
    it('DELETE /api/account/data erases all submissions and records an audit log', async () => {
      // 1. User A saves two analyses
      await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'First offer: Please transfer 2000 rupees security deposit to bank account.',
          saveToHistory: true,
        });

      await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Second offer: Pay 1500 registration fee to HR UPI handle.',
          saveToHistory: true,
        });

      const historyBefore = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(historyBefore.body.data.items).toHaveLength(2);

      // 2. User A requests account data erasure
      const eraseRes = await request(app)
        .delete('/api/account/data')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(eraseRes.status).toBe(200);
      expect(eraseRes.body.data.success).toBe(true);
      expect(eraseRes.body.data.deletedCount).toBe(2);

      // 3. History is now empty
      const historyAfter = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(historyAfter.body.data.items).toHaveLength(0);

      // 4. Verify audit log entry
      const logs = getTestAuditLogs();
      const erasureLog = logs.find((l) => l.action === 'account.data_erasure');
      expect(erasureLog).toBeDefined();
      expect(erasureLog?.actor_id).toBe(userA.id);
    });
  });

  describe('7. Audit Log Privacy Invariant', () => {
    it('confirms audit logs NEVER contain raw message text or user input', async () => {
      // Perform deletion which writes to audit log
      const analyzeRes = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Secret offer text that must not be in audit logs: Pay 5000 rupees.',
          saveToHistory: true,
        });

      const submissionId = analyzeRes.body.data.auditId;

      await request(app)
        .delete(`/api/history/${submissionId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      const logs = getTestAuditLogs();
      for (const log of logs) {
        const metaStr = JSON.stringify(log.meta);
        expect(metaStr).not.toContain('Secret offer text');
        expect(metaStr).not.toContain('Pay 5000 rupees');
      }
    });
  });
});
