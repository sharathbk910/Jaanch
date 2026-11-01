import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import {
  ThreatIntelRepository,
  clearInMemoryThreatIntel,
  INTEL_THRESHOLDS,
} from '../lib/threatIntelRepository.js';
import {
  setEmbeddingProviderForTest,
  resetEmbeddingProvider,
  type EmbeddingProvider,
} from '../lib/embeddings.js';

describe('Phase 8: AI/ML Similarity, Semantic Tiers, URL Intelligence & Fallbacks', () => {
  const app = createApp({ enableRateLimiting: false });

  beforeEach(() => {
    clearInMemoryThreatIntel();
    resetEmbeddingProvider();
    vi.restoreAllMocks();
  });

  describe('Tier Ordering & Threshold Boundaries in matchIntel', () => {
    it('prioritizes Exact Text (Tier 1) over Indicator, Similarity, and Semantic', async () => {
      const scrubbed = 'Congratulations! Selected as Software Intern at Apex. Deposit 4500 laptop caution money.';
      const ind = { type: 'upi' as const, value: 'apex@okaxis' };

      // Submit confirmed record
      const res = await ThreatIntelRepository.submitIntelReport(null, {
        userId: 'mod-1',
        scrubbedText: scrubbed,
        indicators: [ind],
      });
      await ThreatIntelRepository.transitionModerationRecord(null, {
        recordId: res.recordId,
        moderatorId: 'mod-1',
        action: 'confirm',
        reason: 'Confirmed scam syndicate record',
      });

      // Query with exact text and matching indicator
      const match = await ThreatIntelRepository.matchIntel(null, {
        text: scrubbed,
        indicators: [ind],
      });

      expect(match).not.toBeNull();
      expect(match?.tier).toBe('exact_text');
      expect(match?.status).toBe('confirmed');
    });

    it('falls back to Indicator Match (Tier 2) when text does not match exactly', async () => {
      const scrubbed = 'Different offer letter text altogether.';
      const ind = { type: 'phone' as const, value: '+91 99999 88888' };

      const res = await ThreatIntelRepository.submitIntelReport(null, {
        userId: 'mod-1',
        scrubbedText: scrubbed,
        indicators: [ind],
      });
      await ThreatIntelRepository.transitionModerationRecord(null, {
        recordId: res.recordId,
        moderatorId: 'mod-1',
        action: 'confirm',
        reason: 'Confirmed fraud phone',
      });

      // Different text, but matching phone
      const match = await ThreatIntelRepository.matchIntel(null, {
        text: 'Hello candidate, call HR on +91 99999 88888 for immediate job joining.',
        indicators: [ind],
      });

      expect(match).not.toBeNull();
      expect(match?.tier).toBe('indicator_match');
      expect(match?.status).toBe('confirmed');
    });

    it('matches via Similarity Tier (Tier 3) with matched tokens when text has high overlap', async () => {
      const recordedScam =
        'Congratulations selected Software Engineering Intern at TechCorp. Refundable security deposit ₹4999 required for laptop kit immediately.';

      const res = await ThreatIntelRepository.submitIntelReport(null, {
        userId: 'mod-1',
        scrubbedText: recordedScam,
      });
      await ThreatIntelRepository.transitionModerationRecord(null, {
        recordId: res.recordId,
        moderatorId: 'mod-1',
        action: 'confirm',
        reason: 'Confirmed laptop deposit trap',
      });

      // Paraphrased query with no indicators
      const queryText =
        'Congratulations selected Software Engineering Intern at TechCorp. Refundable security deposit ₹4999 required for laptop courier.';

      const match = await ThreatIntelRepository.matchIntel(null, {
        text: queryText,
        indicators: [],
      });

      expect(match).not.toBeNull();
      expect(match?.tier).toBe('similarity');
      expect(match?.status).toBe('confirmed');
      expect(match?.similarityScore).toBeGreaterThanOrEqual(INTEL_THRESHOLDS.SIMILARITY_JACCARD_MIN);
      expect(match?.matchedTokens).toBeDefined();
      expect(match?.matchedTokens?.length).toBeGreaterThan(0);
    });

    it('strictly prohibits Similarity tier from matching unverified or reported records', async () => {
      const reportedScam = 'Unverified message submitted by random user without confirmation.';

      await ThreatIntelRepository.submitIntelReport(null, {
        userId: 'user-1',
        scrubbedText: reportedScam,
      });
      // Not confirmed or suspicious (status is reported)

      const match = await ThreatIntelRepository.matchIntel(null, {
        text: reportedScam + ' slightly changed',
        indicators: [],
      });

      // Unverified records must never trigger similarity matches
      expect(match).toBeNull();
    });

    it('matches Semantic Tier (Tier 4) when mock embedding provider is active', async () => {
      const dummyVecA = new Array(768).fill(0.1);
      const dummyVecB = new Array(768).fill(0.1); // Cosine similarity = 1.0

      const mockProvider: EmbeddingProvider = {
        modelId: 'text-embedding-004-mock',
        dimension: 768,
        generateEmbedding: async (text: string) => {
          if (text.includes('crypto')) return dummyVecA;
          return null;
        },
      };

      setEmbeddingProviderForTest(mockProvider);

      const scamText = 'Exclusive crypto task earnings guaranteed daily returns.';
      const res = await ThreatIntelRepository.submitIntelReport(null, {
        userId: 'mod-1',
        scrubbedText: scamText,
      });
      await ThreatIntelRepository.transitionModerationRecord(null, {
        recordId: res.recordId,
        moderatorId: 'mod-1',
        action: 'confirm',
        reason: 'Confirmed crypto task scam',
      });

      // Query with semantically matching text and no indicators
      const match = await ThreatIntelRepository.matchIntel(null, {
        text: 'Join our telegram crypto tasks today.',
        indicators: [],
      });

      expect(match).not.toBeNull();
      expect(match?.tier).toBe('semantic');
      expect(match?.status).toBe('confirmed');
    });

    it('gracefully degrades with keyless fallback when no embedding key is present', async () => {
      // Ensure null embedding provider
      resetEmbeddingProvider();

      const match = await ThreatIntelRepository.matchIntel(null, {
        text: 'Random unrecognized message without any matches.',
        indicators: [],
      });

      expect(match).toBeNull();
    });
  });

  describe('URL Intelligence Endpoint (POST /api/link-check)', () => {
    it('detects numeric IP host and assigns critical severity', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'http://192.168.1.100/login' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('HIGH_RISK');
      expect(res.body.data.signals.some((s: any) => s.id === 'LINK_IP_HOSTNAME')).toBe(true);
    });

    it('detects Punycode / IDN homograph domain', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://xn--tcs-c99a.com/careers' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.signals.some((s: any) => s.id === 'LINK_PUNYCODE')).toBe(true);
    });

    it('detects excessive subdomains (>= 4 levels)', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://login.secure.update.bank.attacker.com/auth' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.signals.some((s: any) => s.id === 'LINK_EXCESSIVE_SUBDOMAINS')).toBe(true);
    });

    it('flags URL shorteners as cannot inspect without external network fetch', async () => {
      const res = await request(app)
        .post('/api/link-check')
        .send({ url: 'https://bit.ly/3xyzABC' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.riskLevel).toBe('NEEDS_VERIFICATION');
      const shortenerSignal = res.body.data.signals.find((s: any) => s.id === 'LINK_SHORTENER');
      expect(shortenerSignal).toBeDefined();
      expect(shortenerSignal.message).toContain('cannot inspect');
    });
  });
});
