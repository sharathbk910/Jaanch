import { describe, it, expect } from 'vitest';
import {
  RULE_OTP_SHARING,
  RULE_PHISHING_URGENT_ACTION,
  RULE_IMPERSONATION_AUTHORITY,
  RULE_TASK_SCAM,
  RULE_INVESTMENT_GUARANTEED_RETURNS,
  RULE_REMOTE_ACCESS_APP,
  RULE_UPI_COLLECT_REQUEST,
  normalizeForMatching,
  extractEntities,
} from '../index.js';

function evalRule(rule: any, text: string) {
  const norm = normalizeForMatching(text);
  const entities = extractEntities(text);
  return rule.evaluate(norm, text, entities);
}

describe('Phase 8: New Rule Families (Positive, Negation & Multilingual)', () => {
  describe('RULE_OTP_SHARING', () => {
    it('detects OTP sharing demand in English', () => {
      const signal = evalRule(
        RULE_OTP_SHARING,
        'To confirm your interview slot, share your OTP received on your mobile with the recruiter.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_OTP_SHARING');
      expect(signal?.severity).toBe('critical');
      expect(signal?.category).toBe('credential_theft');
    });

    it('detects OTP sharing in Hindi and Kannada', () => {
      const hindi = evalRule(RULE_OTP_SHARING, 'Turant OTP bhejiye registration complete karne ke liye.');
      expect(hindi).not.toBeNull();

      const kannada = evalRule(RULE_OTP_SHARING, 'Nimma mobilege banda OTP kodi.');
      expect(kannada).not.toBeNull();
    });

    it('ignores educational safety negation', () => {
      const signal = evalRule(
        RULE_OTP_SHARING,
        'Important Security Tip: Never share your OTP with anyone, even if they claim to be HR.'
      );
      expect(signal).toBeNull();

      const hindiNeg = evalRule(RULE_OTP_SHARING, 'Kripya kisi ko bhi apna OTP na de.');
      expect(hindiNeg).toBeNull();
    });
  });

  describe('RULE_PHISHING_URGENT_ACTION', () => {
    it('detects account blocked & KYC suspension phishing lures', () => {
      const signal = evalRule(
        RULE_PHISHING_URGENT_ACTION,
        'Your SBI bank account has been blocked due to incomplete documentation. Click here to verify.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_PHISHING_URGENT_ACTION');
      expect(signal?.category).toBe('phishing_lure');
    });

    it('detects electricity cutoff and SIM deactivation lures in Hindi and Kannada', () => {
      const hindi = evalRule(
        RULE_PHISHING_URGENT_ACTION,
        'Priya grahak, aaj raat bijli cut hogi yadi KYC update kare turant.'
      );
      expect(hindi).not.toBeNull();

      const kannada = evalRule(
        RULE_PHISHING_URGENT_ACTION,
        'Nimma khate raddagide, eegaale documents verify madi.'
      );
      expect(kannada).not.toBeNull();
    });
  });

  describe('RULE_IMPERSONATION_AUTHORITY', () => {
    it('detects digital arrest and police/customs impersonation', () => {
      const signal = evalRule(
        RULE_IMPERSONATION_AUTHORITY,
        'This is a digital arrest warrant from Crime Branch. Your customs parcel contains illegal contraband.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_IMPERSONATION_AUTHORITY');
      expect(signal?.category).toBe('brand_impersonation');
    });

    it('detects CEO gift card emergency lure', () => {
      const signal = evalRule(
        RULE_IMPERSONATION_AUTHORITY,
        'I am in an urgent executive meeting. CEO needs urgent gift cards for partner client immediately.'
      );
      expect(signal).not.toBeNull();
    });
  });

  describe('RULE_TASK_SCAM', () => {
    it('detects YouTube video like/review pay-per-task Ponzi lures', () => {
      const signal = evalRule(
        RULE_TASK_SCAM,
        'Work from home pay-per-task job: like YouTube videos to earn ₹2,500 daily. Join Telegram group.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_TASK_SCAM');
      expect(signal?.category).toBe('task_fraud');
    });

    it('detects task scams in Hindi and Kannada', () => {
      const hindi = evalRule(
        RULE_TASK_SCAM,
        'Ghar baithe video like karke paise kamaye aur Telegram task complete kare.'
      );
      expect(hindi).not.toBeNull();

      const kannada = evalRule(
        RULE_TASK_SCAM,
        'Video like madi hana galisi dina ₹1500.'
      );
      expect(kannada).not.toBeNull();
    });
  });

  describe('RULE_INVESTMENT_GUARANTEED_RETURNS', () => {
    it('detects guaranteed returns and money doubling lures', () => {
      const signal = evalRule(
        RULE_INVESTMENT_GUARANTEED_RETURNS,
        'Special student crypto plan: 100% guaranteed profit and double your money in 7 days.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_INVESTMENT_GUARANTEED_RETURNS');
      expect(signal?.category).toBe('financial_demand');
    });

    it('detects Hindi paisa double and Kannada khachita labha', () => {
      const hindi = evalRule(
        RULE_INVESTMENT_GUARANTEED_RETURNS,
        'Laxmi chit fund scheme: paisa double hoga 21 din me guaranteed.'
      );
      expect(hindi).not.toBeNull();

      const kannada = evalRule(
        RULE_INVESTMENT_GUARANTEED_RETURNS,
        'Khachita labha prathi dina 10% labha.'
      );
      expect(kannada).not.toBeNull();
    });
  });

  describe('RULE_REMOTE_ACCESS_APP', () => {
    it('detects AnyDesk / TeamViewer device takeover demand', () => {
      const signal = evalRule(
        RULE_REMOTE_ACCESS_APP,
        'To configure company VPN and laptop access, please install AnyDesk on your mobile or laptop.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_REMOTE_ACCESS_APP');
      expect(signal?.category).toBe('remote_access');
    });

    it('ignores negated warnings advising not to download remote access tools', () => {
      const safe = evalRule(
        RULE_REMOTE_ACCESS_APP,
        'Security warning: Do not download AnyDesk or TeamViewer for job interviews.'
      );
      expect(safe).toBeNull();
    });
  });

  describe('RULE_UPI_COLLECT_REQUEST', () => {
    it('detects entering UPI PIN to receive money', () => {
      const signal = evalRule(
        RULE_UPI_COLLECT_REQUEST,
        'To receive your internship stipend of ₹15,000, please approve collect request and enter UPI PIN to receive.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_UPI_COLLECT_REQUEST');
      expect(signal?.category).toBe('financial_demand');
    });

    it('detects Hindi PIN to receive money lure', () => {
      const hindi = evalRule(
        RULE_UPI_COLLECT_REQUEST,
        'Refund lene ke liye GooglePay me pin dale paise prapt karne ke liye.'
      );
      expect(hindi).not.toBeNull();
    });
  });
});

