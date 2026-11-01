import { describe, it, expect } from 'vitest';
import {
  RULE_UPFRONT_FEE,
  RULE_BANK_OTP_DEBIT,
  RULE_COERCIVE_DEADLINE,
  RULE_FREE_EMAIL_CLAIMING_ORG,
  RULE_LOOKALIKE_DOMAIN,
  RULE_OFFICIAL_GOV_FEES,
  RULE_UNVERIFIED_LISTING,
  RULE_GENUINE_DISCLAIMER,
} from '../rules/catalog.js';
import { extractEntities } from '../entities/index.js';
import { normalizeForMatching } from '../normalize/index.js';

function evalRule(rule: any, text: string, sender?: any) {
  const normalized = normalizeForMatching(text);
  const entities = extractEntities(text);
  return rule.evaluate(normalized, text, entities, sender);
}

describe('Deterministic 8-Rule Engine (rules/catalog.ts)', () => {
  describe('RULE_UPFRONT_FEE', () => {
    it('fires on English upfront registration fee', () => {
      const signal = evalRule(
        RULE_UPFRONT_FEE,
        'Congratulations! Pay ₹1,500 registration fee to confirm your internship slot.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_UPFRONT_FEE');
      expect(signal?.severity).toBe('critical');
    });

    it('fires on security deposit for laptop and training charges', () => {
      const signal1 = evalRule(
        RULE_UPFRONT_FEE,
        'Mandatory refundable security deposit required for office equipment.'
      );
      expect(signal1).not.toBeNull();

      const signal2 = evalRule(
        RULE_UPFRONT_FEE,
        'Student must pay upfront training fee of Rs 3000.'
      );
      expect(signal2).not.toBeNull();
    });

    it('fires on Hindi and Hinglish fee demands', () => {
      const signalHi = evalRule(
        RULE_UPFRONT_FEE,
        'Apna seat book karne ke liye panjikaran shulk jama kare.'
      );
      expect(signalHi).not.toBeNull();

      const signalHinglish = evalRule(
        RULE_UPFRONT_FEE,
        'Training shulk deposit bhare kal tak.'
      );
      expect(signalHinglish).not.toBeNull();
    });

    it('fires on Kannada fee demands', () => {
      const signalKn = evalRule(
        RULE_UPFRONT_FEE,
        'Nondani shulka ₹1000 pavatisi ana kodabeku.'
      );
      expect(signalKn).not.toBeNull();
    });

    it('does NOT fire when fee is negated (clause-scoped negation)', () => {
      expect(
        evalRule(RULE_UPFRONT_FEE, 'There is no registration fee or deposit required.')
      ).toBeNull();
      expect(
        evalRule(RULE_UPFRONT_FEE, 'We never charge any training fee for students.')
      ).toBeNull();
      expect(
        evalRule(RULE_UPFRONT_FEE, 'Selection ke liye koi fee nahi lagti.')
      ).toBeNull();
      expect(
        evalRule(RULE_UPFRONT_FEE, 'Abhyarthigalinda yavude shulkavilla.')
      ).toBeNull();
    });
  });

  describe('RULE_BANK_OTP_DEBIT', () => {
    it('fires on OTP request', () => {
      const signal = evalRule(
        RULE_BANK_OTP_DEBIT,
        'Share OTP sent to your phone for profile verification.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_BANK_OTP_DEBIT');
    });

    it('fires on debit card PIN and NetBanking passwords', () => {
      const signal = evalRule(
        RULE_BANK_OTP_DEBIT,
        'Provide debit card number and debit card pin for stipend processing.'
      );
      expect(signal).not.toBeNull();
    });

    it('fires on cheque overpayment scheme', () => {
      const signal = evalRule(
        RULE_BANK_OTP_DEBIT,
        'Deposit cheque and return part of money back to our vendor.'
      );
      expect(signal).not.toBeNull();
    });

    it('does NOT fire when OTP sharing is warned against (negation)', () => {
      const signal = evalRule(
        RULE_BANK_OTP_DEBIT,
        'Security advisory: Never share OTP with anyone, our team will not ask.'
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_COERCIVE_DEADLINE', () => {
    it('fires on short hours urgency in English', () => {
      const signal = evalRule(
        RULE_COERCIVE_DEADLINE,
        'Offer expires in 2 hours. Confirm immediately to avoid cancellation.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_COERCIVE_DEADLINE');
      expect(signal?.severity).toBe('medium');
    });

    it('fires on Hindi and Kannada coercive deadlines', () => {
      const sigHi = evalRule(
        RULE_COERCIVE_DEADLINE,
        'Kewal 2 ghante me offer samapt ho jayega, turant sampark kare.'
      );
      expect(sigHi).not.toBeNull();

      const sigKn = evalRule(
        RULE_COERCIVE_DEADLINE,
        'Kevala 2 gante samaya, tavartavagi begane samparkisi.'
      );
      expect(sigKn).not.toBeNull();
    });

    it('does NOT fire on regular normal application deadlines', () => {
      const signal = evalRule(
        RULE_COERCIVE_DEADLINE,
        'Application deadline is 30th November 2026. Submit your resume before Friday.'
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_FREE_EMAIL_CLAIMING_ORG', () => {
    it('fires when corporate organization is claimed with Gmail / Yahoo', () => {
      const signal = evalRule(
        RULE_FREE_EMAIL_CLAIMING_ORG,
        'Tata Consultancy Services selection letter. Contact hr.tcs.india@gmail.com'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_FREE_EMAIL_CLAIMING_ORG');
    });

    it('does NOT fire when personal communication has no organization claim', () => {
      const signal = evalRule(
        RULE_FREE_EMAIL_CLAIMING_ORG,
        'Hi, reach out to me at researcher@gmail.com for paper review.'
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_LOOKALIKE_DOMAIN', () => {
    it('fires on typosquats and lookalikes', () => {
      const signal = evalRule(
        RULE_LOOKALIKE_DOMAIN,
        'Check portal at http://micros0ft-careers.com/apply.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_LOOKALIKE_DOMAIN');
      expect(signal?.severity).toBe('critical');
    });

    it('does NOT fire on legitimate corporate domain', () => {
      const signal = evalRule(
        RULE_LOOKALIKE_DOMAIN,
        'Check official site at https://careers.tcs.com/apply.'
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_OFFICIAL_GOV_FEES', () => {
    it('fires when government scheme asks for fee', () => {
      const signal = evalRule(
        RULE_OFFICIAL_GOV_FEES,
        'AICTE national internship scheme requires processing fee of ₹999.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_OFFICIAL_GOV_FEES');
    });

    it('fires when government scheme directs to non-gov domain', () => {
      const signal = evalRule(
        RULE_OFFICIAL_GOV_FEES,
        'PMKVY central skill certificate available at http://pmkvy-skills-gov.org.'
      );
      expect(signal).not.toBeNull();
    });

    it('does NOT fire on legitimate gov link without fees', () => {
      const signal = evalRule(
        RULE_OFFICIAL_GOV_FEES,
        'Apply for AICTE scholarship on official portal https://internship.aicte-india.org.'
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_UNVERIFIED_LISTING', () => {
    it('fires when company named without official corporate domain', () => {
      const signal = evalRule(
        RULE_UNVERIFIED_LISTING,
        'Selected for Web Development Internship at Horizon Solutions Pvt. Ltd.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_UNVERIFIED_LISTING');
      expect(signal?.severity).toBe('low');
    });

    it('does NOT fire when sender has verified corporate domain', () => {
      const signal = evalRule(
        RULE_UNVERIFIED_LISTING,
        'Selected for Web Development Internship at Infosys.',
        { organization: 'Infosys', isOfficialCorporateDomain: true }
      );
      expect(signal).toBeNull();
    });
  });

  describe('RULE_GENUINE_DISCLAIMER', () => {
    it('fires on explicit positive non-fee disclaimers', () => {
      const signal = evalRule(
        RULE_GENUINE_DISCLAIMER,
        'We do not charge any fee at any stage of our recruitment process.'
      );
      expect(signal).not.toBeNull();
      expect(signal?.ruleId).toBe('RULE_GENUINE_DISCLAIMER');
      expect(signal?.severity).toBe('info');
    });

    it('fires on Hindi and Kannada positive disclaimers', () => {
      const sigHi = evalRule(
        RULE_GENUINE_DISCLAIMER,
        'Hamare recruitment me kisi bhi shulk ki mang nahi ki jati hai.'
      );
      expect(sigHi).not.toBeNull();

      const sigKn = evalRule(
        RULE_GENUINE_DISCLAIMER,
        'Niyamagalu: Abhyarthigalinda yavude shulkavilla, free of charge.'
      );
      expect(sigKn).not.toBeNull();
    });
  });
});
