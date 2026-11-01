import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createTestJwt } from '../lib/jwt.js';
import { getTestAuditLogs, clearTestAuditLogs } from '../lib/auditLog.js';
import {
  ThreatIntelRepository,
  clearInMemoryThreatIntel,
  seedReportedEntity,
} from '../lib/threatIntelRepository.js';

describe('Phase 7: Shared Intelligence, Cryptographic Hashing & Moderation', () => {
  const app = createApp({ enableRateLimiting: false });

  const studentUser = {
    id: 's1111111-1111-4111-s111-111111111111',
    email: 'student@campus.edu.in',
    role: 'user' as const,
  };

  const moderatorUser = {
    id: 'm2222222-2222-4222-m222-222222222222',
    email: 'moderator@jaanch.ai',
    role: 'moderator' as const,
  };

  let studentToken: string;
  let modToken: string;

  beforeEach(async () => {
    clearInMemoryThreatIntel();
    clearTestAuditLogs();

    studentToken = await createTestJwt(studentUser);
    modToken = await createTestJwt(moderatorUser);
  });

  describe('1. Peppered Cryptographic Indicator Hashing', () => {
    it('produces deterministic SHA-256 hashes for indicators', () => {
      const hash1 = ThreatIntelRepository.hashIndicator('upi', 'scammer.hr@okaxis');
      const hash2 = ThreatIntelRepository.hashIndicator('upi', 'scammer.hr@okaxis');
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('normalizes indicator case and whitespace before hashing', () => {
      const hashLower = ThreatIntelRepository.hashIndicator('domain', 'fake-tcs-careers.net');
      const hashMixed = ThreatIntelRepository.hashIndicator('domain', '  Fake-TCS-Careers.NET  ');
      expect(hashMixed).toBe(hashLower);
    });

    it('produces distinct hashes for different indicator types with the same string', () => {
      const hashEmail = ThreatIntelRepository.hashIndicator('email', 'support@tcs-careers.net');
      const hashDomain = ThreatIntelRepository.hashIndicator('domain', 'support@tcs-careers.net');
      expect(hashEmail).not.toBe(hashDomain);
    });

    it('normalizes phone numbers to standard numeric strings', () => {
      const hash1 = ThreatIntelRepository.hashIndicator('phone', '+91 (98765) 432-10');
      const hash2 = ThreatIntelRepository.hashIndicator('phone', '+919876543210');
      expect(hash1).toBe(hash2);
    });
  });

  describe('2. Community Threat Reporting (POST /api/reports/entity)', () => {
    it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/reports/entity')
        .send({
          entityType: 'upi',
          value: 'fraud.pay@okhdfc',
          channel: 'whatsapp',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid entity types with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/reports/entity')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityType: 'invalid_type',
          value: 'test',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('allows authenticated students to report suspicious entities, starting in unverified status', async () => {
      const res = await request(app)
        .post('/api/reports/entity')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityType: 'upi',
          value: 'fake.recruiter@okicici',
          channel: 'telegram',
          description: 'Demanded ₹2000 registration fee for part-time data entry job',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.reportId).toBeDefined();
      expect(res.body.data.status).toBe('unverified');
      expect(res.body.data.reportCount).toBe(1);
    });

    it('increments report count when another student reports the same indicator', async () => {
      // First report
      await request(app)
        .post('/api/reports/entity')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityType: 'email',
          value: 'hr@fake-wipro-hiring.xyz',
          channel: 'email',
        });

      // Second user
      const student2Token = await createTestJwt({
        id: 's2222222-2222-4222-s222-222222222222',
        email: 'student2@campus.edu.in',
        role: 'user',
      });

      const res2 = await request(app)
        .post('/api/reports/entity')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          entityType: 'email',
          value: 'hr@fake-wipro-hiring.xyz',
          channel: 'whatsapp',
        });

      expect(res2.status).toBe(201);
      expect(res2.body.data.reportCount).toBe(2);
      expect(res2.body.data.status).toBe('unverified');
    });
  });

  describe('3. Threat Intelligence Lookup (POST /api/threat-intel/lookup)', () => {
    it('returns empty matches when indicator is not in database', async () => {
      const res = await request(app)
        .post('/api/threat-intel/lookup')
        .send({
          entities: [{ entityType: 'domain', value: 'google.com' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.matches).toHaveLength(0);
    });

    it('returns match when indicator was previously confirmed or suspicious', async () => {
      // Seed a confirmed indicator
      seedReportedEntity({
        id: 'ent-deposit-scam',
        entityType: 'upi',
        value: 'deposit.now@oksbi',
        status: 'confirmed',
        reportCount: 3,
      });

      // Anyone looks up the entity
      const res = await request(app)
        .post('/api/threat-intel/lookup')
        .send({
          entities: [{ entityType: 'upi', value: 'deposit.now@oksbi' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.matches).toHaveLength(1);
      expect(res.body.data.matches[0].entityType).toBe('upi');
      expect(res.body.data.matches[0].status).toBe('confirmed');
      expect(res.body.data.matches[0].reportCount).toBe(3);
    });

    it('does not leak unverified reports in public threat intelligence lookups', async () => {
      // Student reports an unverified entity
      await request(app)
        .post('/api/reports/entity')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          entityType: 'upi',
          value: 'unverified.target@oksbi',
          channel: 'sms',
        });

      // Public lookup does not return unverified reports
      const res = await request(app)
        .post('/api/threat-intel/lookup')
        .send({
          entities: [{ entityType: 'upi', value: 'unverified.target@oksbi' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.matches).toHaveLength(0);
    });
  });

  describe('4. Moderator Role Guard & Lifecycle Transitions', () => {
    it('rejects regular students attempting to access moderation endpoints with 403 FORBIDDEN', async () => {
      const listRes = await request(app)
        .get('/api/moderation/entities')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(listRes.status).toBe(403);
      expect(listRes.body.error.code).toBe('FORBIDDEN');

      const transRes = await request(app)
        .post('/api/moderation/entities/any-id/transition')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ toStatus: 'confirmed' });

      expect(transRes.status).toBe(403);
      expect(transRes.body.error.code).toBe('FORBIDDEN');
    });

    it('allows authorized moderators to list reported entities', async () => {
      // Seed entity
      seedReportedEntity({
        id: 'ent-1',
        entityType: 'domain',
        value: 'tcs-appointment-letter.com',
        status: 'unverified',
      });

      const res = await request(app)
        .get('/api/moderation/entities')
        .set('Authorization', `Bearer ${modToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe('ent-1');
      expect(res.body.data.items[0].status).toBe('unverified');
    });

    it('allows authorized moderators to transition an entity to confirmed and logs audit trail', async () => {
      seedReportedEntity({
        id: 'ent-target',
        entityType: 'upi',
        value: 'fake.fee@okaxis',
        status: 'unverified',
      });

      const res = await request(app)
        .post('/api/moderation/entities/ent-target/transition')
        .set('Authorization', `Bearer ${modToken}`)
        .send({
          toStatus: 'confirmed',
          notes: 'Corroborated across 5 student reports demanding laptop deposit',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.entity.status).toBe('confirmed');

      // Verify audit log
      const logs = getTestAuditLogs();
      const transitionLog = logs.find((l) => l.action === 'TRANSITION_ENTITY_STATUS');
      expect(transitionLog).toBeDefined();
      expect(transitionLog?.actor_id).toBe(moderatorUser.id);
      expect(transitionLog?.meta?.toStatus).toBe('confirmed');
    });

    it('allows moderator to transition an entity to dismissed or disputed', async () => {
      seedReportedEntity({
        id: 'ent-false-alarm',
        entityType: 'domain',
        value: 'legitimate-startup.in',
        status: 'unverified',
      });

      const res = await request(app)
        .post('/api/moderation/entities/ent-false-alarm/transition')
        .set('Authorization', `Bearer ${modToken}`)
        .send({
          toStatus: 'dismissed',
          notes: 'Verified legitimate startup registered on MCA',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.entity.status).toBe('dismissed');
    });
  });

  describe('5. Decision D2 & Addendum P2: CONFIRMED_SCAM Invariant', () => {
    it('raw text with unconfirmed or unverified indicator NEVER produces CONFIRMED_SCAM', async () => {
      // User reported a UPI handle, but it is ONLY "unverified"
      seedReportedEntity({
        id: 'ent-unverified-upi',
        entityType: 'upi',
        value: 'unverified.upi@okhdfc',
        status: 'unverified',
      });

      const offerText =
        'Congratulations! You have been selected for Internship at Apex Tech. ' +
        'Please pay a refundable security deposit of Rs 1500 to unverified.upi@okhdfc within 2 hours.';

      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: offerText,
          inputType: 'offer_letter',
        });

      expect(res.status).toBe(200);
      // High concern due to upfront fee rules, but STRICTLY NOT CONFIRMED_SCAM
      expect(res.body.data.status).toBe('HIGH_CONCERN');
      expect(res.body.data.status).not.toBe('CONFIRMED_SCAM');
    });

    it('text with MODERATOR-CONFIRMED threat indicator elevates verdict to CONFIRMED_SCAM', async () => {
      // Seed a moderator-confirmed threat indicator
      seedReportedEntity({
        id: 'ent-confirmed-upi',
        entityType: 'upi',
        value: 'known.syndicate@okaxis',
        status: 'confirmed',
        confidence: 99,
      });

      const offerText =
        'Congratulations on your placement at Infosys Technologies. ' +
        'Please send equipment verification fee of Rs 3500 to known.syndicate@okaxis immediately.';

      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: offerText,
          inputType: 'offer_letter',
        });

      expect(res.status).toBe(200);
      // STRICT REQUIREMENT: Status MUST be CONFIRMED_SCAM
      expect(res.body.data.status).toBe('CONFIRMED_SCAM');
      expect(res.body.data.confidenceScore).toBeGreaterThanOrEqual(98);

      // Signals must include the confirmed fraud record rule
      const fraudSignal = res.body.data.signals.find(
        (s: any) => s.ruleId === 'RULE_CONFIRMED_FRAUD_RECORD'
      );
      expect(fraudSignal).toBeDefined();
      expect(fraudSignal.severity).toBe('critical');
      expect(fraudSignal.evidence).toContain('upi');
      expect(fraudSignal.evidence).toContain('ent-conf');
    });

    it('dismissed threat indicators do NOT trigger CONFIRMED_SCAM', async () => {
      seedReportedEntity({
        id: 'ent-dismissed',
        entityType: 'domain',
        value: 'genuine-portal.edu.in',
        status: 'dismissed',
      });

      const offerText =
        'Welcome to the campus research internship! Please submit your project abstract at https://genuine-portal.edu.in.';

      const res = await request(app)
        .post('/api/analyze')
        .send({
          text: offerText,
          inputType: 'offer_letter',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).not.toBe('CONFIRMED_SCAM');
      expect(res.body.data.signals.some((s: any) => s.ruleId === 'RULE_CONFIRMED_FRAUD_RECORD')).toBe(false);
    });
  });
});
