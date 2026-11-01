import { describe, it, expect } from 'vitest';
import { analyzeOffer, computeStatus } from '../index.js';
import type { Signal, ExtractedEntities } from '../schemas/index.js';

describe('Status Computation Truth Table & Governance Invariants', () => {
  const dummyEntities: ExtractedEntities = {
    urls: [],
    domains: [],
    emails: [],
    phones: [],
    upiHandles: [],
    amounts: [],
    organization: 'TechCorp',
  };

  it('hard disqualifier alone produces HIGH_CONCERN', () => {
    const feeSignal: Signal = {
      id: 'S1',
      ruleId: 'RULE_UPFRONT_FEE',
      title: 'Fee',
      whyItMatters: 'Fees not allowed',
      evidence: '₹1000 fee',
      severity: 'critical',
    };
    const res = computeStatus([feeSignal], dummyEntities);
    expect(res.status).toBe('HIGH_CONCERN');
    expect(res.confidenceScore).toBeGreaterThanOrEqual(90);
  });

  it('single coercive deadline alone produces NEEDS_REVIEW', () => {
    const urgencySignal: Signal = {
      id: 'S2',
      ruleId: 'RULE_COERCIVE_DEADLINE',
      title: 'Urgency',
      whyItMatters: 'Rushed decision',
      evidence: 'expires in 2 hours',
      severity: 'medium',
    };
    const res = computeStatus([urgencySignal], dummyEntities);
    expect(res.status).toBe('NEEDS_REVIEW');
  });

  it('single free email claiming org alone produces NEEDS_REVIEW', () => {
    const freeMailSignal: Signal = {
      id: 'S3',
      ruleId: 'RULE_FREE_EMAIL_CLAIMING_ORG',
      title: 'Free Mail',
      whyItMatters: 'Claims org via Gmail',
      evidence: 'recruiter@gmail.com',
      severity: 'medium',
    };
    const res = computeStatus([freeMailSignal], dummyEntities);
    expect(res.status).toBe('NEEDS_REVIEW');
  });

  it('combining coercive deadline AND free email produces HIGH_CONCERN', () => {
    const signals: Signal[] = [
      {
        id: 'S2',
        ruleId: 'RULE_COERCIVE_DEADLINE',
        title: 'Urgency',
        whyItMatters: 'Rushed decision',
        evidence: 'expires in 2 hours',
        severity: 'medium',
      },
      {
        id: 'S3',
        ruleId: 'RULE_FREE_EMAIL_CLAIMING_ORG',
        title: 'Free Mail',
        whyItMatters: 'Claims org via Gmail',
        evidence: 'recruiter@gmail.com',
        severity: 'medium',
      },
    ];
    const res = computeStatus(signals, dummyEntities);
    expect(res.status).toBe('HIGH_CONCERN');
    expect(res.confidenceScore).toBeGreaterThanOrEqual(80);
  });

  it('positive evidence with ZERO negative signals produces LIKELY_GENUINE', () => {
    const disclaimerSignal: Signal = {
      id: 'S4',
      ruleId: 'RULE_GENUINE_DISCLAIMER',
      title: 'Disclaimer',
      whyItMatters: 'Official policy',
      evidence: 'We never charge fee',
      severity: 'info',
    };
    const res = computeStatus([disclaimerSignal], dummyEntities);
    expect(res.status).toBe('LIKELY_GENUINE');
    expect(res.confidenceScore).toBe(85);
  });

  it('clean text without positive evidence defaults safely to NEEDS_REVIEW', () => {
    const res = computeStatus([], dummyEntities);
    expect(res.status).toBe('NEEDS_REVIEW');
    expect(res.status).not.toBe('LIKELY_GENUINE');
  });

  it('CONFIRMED_SCAM is NEVER produced by the shared core library', () => {
    // Test multiple edge inputs
    const cases = [
      'Registration fee of ₹5000 required at http://micros0ft-careers.com',
      'Pay ₹1000 now within 2 hours or lose offer',
      'PMKVY fee payment at fake-gov-scheme.com',
    ];
    for (const text of cases) {
      const res = analyzeOffer({ text });
      expect(res.status).not.toBe('CONFIRMED_SCAM');
    }
  });

  it('always populates unverified[] list', () => {
    const res = computeStatus([], dummyEntities);
    expect(res.unverified.length).toBeGreaterThan(0);
    expect(res.unverified.some((u) => u.includes('registry') || u.includes('listing'))).toBe(true);
  });

  it('respects consent flag shareIndicators: strips indicators when false', () => {
    const sample = 'Contact recruiter at hr@tcs-scam.com or phone +91 9876543210.';
    const resWithoutConsent = analyzeOffer({
      text: sample,
      consentFlags: { aiAnalysis: false, shareIndicators: false },
    });
    expect(resWithoutConsent.extractedEntities.emails).toEqual([]);
    expect(resWithoutConsent.extractedEntities.phones).toEqual([]);

    const resWithConsent = analyzeOffer({
      text: sample,
      consentFlags: { aiAnalysis: false, shareIndicators: true },
    });
    expect(resWithConsent.extractedEntities.emails.length).toBeGreaterThan(0);
    expect(resWithConsent.extractedEntities.phones.length).toBeGreaterThan(0);
  });
});
