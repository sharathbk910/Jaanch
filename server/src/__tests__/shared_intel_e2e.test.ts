import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createTestJwt } from '../lib/jwt.js';
import { getTestAuditLogs, clearTestAuditLogs } from '../lib/auditLog.js';
import {
  ThreatIntelRepository,
  clearInMemoryThreatIntel,
  registerUserCreatedAtForTest,
  getInMemoryThreatIntel,
} from '../lib/threatIntelRepository.js';

describe('Phase 7: Shared Scam Intelligence, Promotion & Moderation E2E', () => {
  const app = createApp({ enableRateLimiting: false });

  // Test accounts
  const userA = {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'student.a@college.edu.in',
    role: 'user' as const,
  };

  const userB = {
    id: '22222222-2222-4222-b222-222222222222',
    email: 'student.b@university.ac.in',
    role: 'user' as const,
  };

  const userC = {
    id: '33333333-3333-4333-c333-333333333333',
    email: 'student.c@campus.edu.in',
    role: 'user' as const,
  };

  const newStudent = {
    id: '44444444-4444-4444-d444-444444444444',
    email: 'newbie@campus.edu.in',
    role: 'user' as const,
  };

  const moderator = {
    id: '99999999-9999-4999-m999-999999999999',
    email: 'moderator@jaanch.ai',
    role: 'moderator' as const,
  };

  let tokenA: string;
  let tokenB: string;
  let tokenC: string;
  let tokenNew: string;
  let tokenMod: string;

  // Timestamps
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const justNow = new Date().toISOString();

  beforeEach(async () => {
    clearInMemoryThreatIntel();
    clearTestAuditLogs();

    tokenA = await createTestJwt(userA);
    tokenB = await createTestJwt(userB);
    tokenC = await createTestJwt(userC);
    tokenNew = await createTestJwt(newStudent);
    tokenMod = await createTestJwt(moderator);

    // Register account ages
    registerUserCreatedAtForTest(userA.id, twoDaysAgo);
    registerUserCreatedAtForTest(userB.id, twoDaysAgo);
    registerUserCreatedAtForTest(userC.id, twoDaysAgo);
    registerUserCreatedAtForTest(newStudent.id, justNow); // account < 24h old
  });

  // ---------------------------------------------------------------------------
  // 1. Core End-to-End Flow: Person A reports -> Moderator confirms -> Person B warns
  // ---------------------------------------------------------------------------
  it('E2E: Person A reports a scam -> moderator confirms -> Person B analyzing the offer gets CONFIRMED_SCAM warning', async () => {
    const scamText =
      'URGENT: TCS HR Selection. You are offered Junior Analyst. Deposit ₹3,500 laptop caution money to UPI fake.hr@okaxis within 2 hours or job is cancelled.';

    // Step 1: Person B analyzes offer before report -> gets heuristic status HIGH_CONCERN (not confirmed)
    const initialAnalyze = await request(app)
      .post('/api/analyze')
      .send({ text: scamText, domain: 'job', channel: 'whatsapp' });

    expect(initialAnalyze.status).toBe(200);
    expect(initialAnalyze.body.data.status).toBe('HIGH_CONCERN');
    expect(initialAnalyze.body.data.status).not.toBe('CONFIRMED_SCAM');

    // Step 2: Person A submits a threat report with consent
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        text: scamText,
        category: 'upfront_fee',
        shareIndicators: true,
      });

    expect(reportRes.status).toBe(201);
    expect(reportRes.body.data.publicId).toMatch(/^JNC-INTEL-/);
    const publicId = reportRes.body.data.publicId;
    const recordId = reportRes.body.data.recordId;

    // Step 3: Person B analyzes again -> record is still only 'reported'/'ai_flagged', NEVER CONFIRMED_SCAM
    const postReportAnalyze = await request(app)
      .post('/api/analyze')
      .send({ text: scamText, domain: 'job' });

    expect(postReportAnalyze.status).toBe(200);
    expect(postReportAnalyze.body.data.status).not.toBe('CONFIRMED_SCAM');

    // Step 4: Moderator reviews queue and confirms the record
    const queueRes = await request(app)
      .get('/api/moderation/queue')
      .set('Authorization', `Bearer ${tokenMod}`);

    expect(queueRes.status).toBe(200);
    const itemInQueue = queueRes.body.data.items.find((i: any) => i.publicId === publicId);
    expect(itemInQueue).toBeDefined();

    const confirmRes = await request(app)
      .post(`/api/moderation/records/${recordId}/action`)
      .set('Authorization', `Bearer ${tokenMod}`)
      .send({
        action: 'confirm',
        reason: 'Investigated fraudulent UPI ID and unauthorized impersonation of Tata Consultancy Services.',
      });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('confirmed');

    // Step 5: Person B analyzes the offer now -> immediately elevated to CONFIRMED_SCAM!
    const finalAnalyze = await request(app)
      .post('/api/analyze')
      .send({ text: scamText, domain: 'job' });

    expect(finalAnalyze.status).toBe(200);
    expect(finalAnalyze.body.data.status).toBe('CONFIRMED_SCAM');
    expect(finalAnalyze.body.data.confidenceScore).toBe(99);
    expect(finalAnalyze.body.data.intelMatch).toBeDefined();
    expect(finalAnalyze.body.data.intelMatch.status).toBe('confirmed');
    expect(finalAnalyze.body.data.intelMatch.publicId).toBe(publicId);
    expect(finalAnalyze.body.data.signals.some((s: any) => s.ruleId === 'RULE_CONFIRMED_FRAUD_RECORD')).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 2. Invariant: One report never auto-confirms
  // ---------------------------------------------------------------------------
  it('guarantees a single report never auto-confirms a record', async () => {
    const text = 'Wipro campus offer. Send ₹2000 registration fee to fake.recruiter@okhdfc';

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    expect(res.status).toBe(201);
    expect(res.body.data.status).not.toBe('confirmed');
    expect(['reported', 'ai_flagged']).toContain(res.body.data.status);
  });

  // ---------------------------------------------------------------------------
  // 3. Wording rule: suspicious/ai_flagged never warns as confirmed
  // ---------------------------------------------------------------------------
  it('suspicious or ai_flagged records attach intelMatch but leave status unconfirmed', async () => {
    const text = 'Offer letter for scholarship. Contact WhatsApp +91 99999 88888 for disbursement.';

    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    const analyzeRes = await request(app)
      .post('/api/analyze')
      .send({ text });

    expect(analyzeRes.status).toBe(200);
    expect(analyzeRes.body.data.status).not.toBe('CONFIRMED_SCAM');
    if (analyzeRes.body.data.intelMatch) {
      expect(analyzeRes.body.data.intelMatch.status).not.toBe('confirmed');
      expect(analyzeRes.body.data.intelMatch.explanation).toContain('Similar to reported messages');
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Domain allowlist guard: legitimate domains CANNOT be confirmed
  // ---------------------------------------------------------------------------
  it('blocks moderator confirmation if any indicator domain is on the domain allowlist', async () => {
    const legitText =
      'Official TCS Campus Offer. Please review your appointment terms at https://nextstep.tcs.com/campus/#/login. Contact careers@tcs.com';

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        text: legitText,
        indicators: [{ type: 'domain', value: 'tcs.com' }],
        shareIndicators: true,
      });

    expect(reportRes.status).toBe(201);
    const recordId = reportRes.body.data.recordId;

    // Moderator attempts to confirm allowlisted organization
    const confirmRes = await request(app)
      .post(`/api/moderation/records/${recordId}/action`)
      .set('Authorization', `Bearer ${tokenMod}`)
      .send({
        action: 'confirm',
        reason: 'Attempting to confirm official domain',
      });

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.error.code).toBe('ALLOWLISTED_DOMAIN_BLOCKED');
    expect(confirmRes.body.error.message).toContain('domain allowlist');
  });

  // ---------------------------------------------------------------------------
  // 5. Cross-user leak tests & privacy
  // ---------------------------------------------------------------------------
  it('guarantees user B cannot inspect user A reports and zero raw submissions are leaked', async () => {
    const secretStudentText =
      'My name is Rahul Sharma, contact +91 98765 43210 with Aadhaar 1234 5678 9012. Selected for TCS with ₹3500 deposit to upi@scam';

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        text: secretStudentText,
        shareIndicators: true,
      });

    expect(reportRes.status).toBe(201);
    const recordId = reportRes.body.data.recordId;

    // Moderator detail endpoint returns ONLY scrubbed text
    const detailRes = await request(app)
      .get(`/api/moderation/records/${recordId}`)
      .set('Authorization', `Bearer ${tokenMod}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.scrubbedText).not.toContain('Rahul Sharma');
    expect(detailRes.body.data.scrubbedText).not.toContain('98765 43210');
    expect(detailRes.body.data.scrubbedText).not.toContain('1234 5678 9012');
    expect(detailRes.body.data.scrubbedText).toContain('[NAME]');
    expect(detailRes.body.data.scrubbedText).toContain('[PHONE]');
    expect(detailRes.body.data.scrubbedText).toContain('[AADHAAR]');
  });

  // ---------------------------------------------------------------------------
  // 6. Duplicate reports deduplication
  // ---------------------------------------------------------------------------
  it('deduplicates identical reports from the same user without creating duplicate rows', async () => {
    const text = 'Duplicate scam report test. Transfer ₹5000 to fraud.upi@okbank for internship.';

    // First report by User A
    const res1 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    expect(res1.status).toBe(201);
    expect(res1.body.data.deduplicated).toBe(false);

    // Second identical report by User A -> recognized as duplicate
    const res2 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    expect(res2.status).toBe(201);
    expect(res2.body.data.deduplicated).toBe(true);
    expect(res2.body.data.publicId).toBe(res1.body.data.publicId);

    // Report by User B on the same scam -> increments distinct corroboration
    const res3 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ text, shareIndicators: true });

    expect(res3.status).toBe(201);
    expect(res3.body.data.publicId).toBe(res1.body.data.publicId);
  });

  // ---------------------------------------------------------------------------
  // 7. Role escalation protection: students cannot access moderation
  // ---------------------------------------------------------------------------
  it('rejects unauthorized students attempting to access moderation routes with 403 Forbidden', async () => {
    const queueRes = await request(app)
      .get('/api/moderation/queue')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(queueRes.status).toBe(403);
    expect(queueRes.body.error.code).toBe('FORBIDDEN');

    const actionRes = await request(app)
      .post('/api/moderation/records/123/action')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ action: 'confirm', reason: 'hacker' });

    expect(actionRes.status).toBe(403);
    expect(actionRes.body.error.code).toBe('FORBIDDEN');
  });

  // ---------------------------------------------------------------------------
  // 8. Promotion rules: 3 distinct reports from accounts >24h -> suspicious
  // ---------------------------------------------------------------------------
  it('promotes record to suspicious upon receiving 3 distinct reports from accounts >24h', async () => {
    const text = 'Multi-reporter promotion test. Send ₹1500 to recruiter.fee@okaxis for immediate appointment.';

    // Report 1: User A (>24h)
    const r1 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });
    expect(r1.body.data.status).toBe('reported');

    // Report 2: New Student (<24h) -> does not count towards promotion
    const rNew = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenNew}`)
      .send({ text, shareIndicators: true });
    expect(rNew.body.data.status).toBe('reported');

    // Report 3: User B (>24h) -> count of qualified = 2
    const r2 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ text, shareIndicators: true });
    expect(r2.body.data.status).toBe('reported');

    // Report 4: User C (>24h) -> count of qualified reaches 3 -> PROMOTES TO SUSPICIOUS!
    const r3 = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenC}`)
      .send({ text, shareIndicators: true });
    expect(r3.body.data.status).toBe('suspicious');
  });

  // ---------------------------------------------------------------------------
  // 9. Contest / Dispute endpoint (POST /api/disputes)
  // ---------------------------------------------------------------------------
  it('allows contesting a record and sets status to disputed', async () => {
    const text = 'Genuine startup contest offer. Review hiring terms at https://legit-startup.in';

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    const publicId = reportRes.body.data.publicId;

    const disputeRes = await request(app)
      .post('/api/disputes')
      .send({
        publicId,
        reason: 'This is a genuine startup registered with MCA CIN U72900KA2025PTC123456.',
        contactEmail: 'founder@legit-startup.in',
      });

    expect(disputeRes.status).toBe(200);
    expect(disputeRes.body.data.status).toBe('disputed');
  });

  // ---------------------------------------------------------------------------
  // 10. Concurrent reports handling
  // ---------------------------------------------------------------------------
  it('safely handles concurrent report submissions for the same text', async () => {
    const text = 'Concurrent stress test offer. Pay ₹2000 registration fee via UPI stress@okaxis';

    const results = await Promise.all([
      request(app).post('/api/reports').set('Authorization', `Bearer ${tokenA}`).send({ text, shareIndicators: true }),
      request(app).post('/api/reports').set('Authorization', `Bearer ${tokenB}`).send({ text, shareIndicators: true }),
      request(app).post('/api/reports').set('Authorization', `Bearer ${tokenC}`).send({ text, shareIndicators: true }),
    ]);

    for (const r of results) {
      expect(r.status).toBe(201);
      expect(r.body.data.publicId).toBe(results[0].body.data.publicId);
    }
  });

  // ---------------------------------------------------------------------------
  // 11. Moderator editing of scrubbed text
  // ---------------------------------------------------------------------------
  it('allows moderator to sanitize scrubbed text with an audit trail', async () => {
    const text = 'Stray name test. Recruiter Priya says pay ₹3000 to upi@scam';

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text, shareIndicators: true });

    const recordId = reportRes.body.data.recordId;

    const editRes = await request(app)
      .patch(`/api/moderation/records/${recordId}/scrubbing`)
      .set('Authorization', `Bearer ${tokenMod}`)
      .send({
        newScrubbedText: 'Sanitized text: Recruiter [NAME] says pay [AMOUNT] to upi@scam',
        reason: 'Masked stray recruiter name missed in initial pass.',
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.data.scrubbedText).toContain('[NAME]');
  });
});
