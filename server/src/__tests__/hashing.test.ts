import { describe, it, expect } from 'vitest';
import { hashEntity, normalizeEntityValue } from '../lib/hashing.js';
import { hashEntity as hashEntityMjs, normalizeEntityValue as normalizeEntityValueMjs } from '../../../scripts/hashEntity.mjs';

describe('Entity Hashing & Normalization (hashing.test.ts)', () => {
  const TEST_PEPPER = 'test-salt-pepper-at-least-24-characters-long';

  describe('Entity Normalization', () => {
    it('normalizes email addresses (lowercased, trimmed)', () => {
      expect(normalizeEntityValue('email', '  Recruiter.HR@TechCorp.com  ')).toBe('recruiter.hr@techcorp.com');
      expect(normalizeEntityValue('email', 'student@GMAIL.COM')).toBe('student@gmail.com');
    });

    it('normalizes domains (strips protocol, www, trailing slashes, lowercased)', () => {
      expect(normalizeEntityValue('domain', 'https://www.tcs-careers-portal.net/')).toBe('tcs-careers-portal.net');
      expect(normalizeEntityValue('domain', 'HTTP://INFOSYS-JOBS.ORG/apply')).toBe('infosys-jobs.org');
      expect(normalizeEntityValue('domain', 'subdomain.example.com/')).toBe('subdomain.example.com');
    });

    it('normalizes phone numbers (strips spaces, hyphens, brackets)', () => {
      expect(normalizeEntityValue('phone', '+91 (98765) 432-10')).toBe('+919876543210');
      expect(normalizeEntityValue('phone', '080-1234-5678')).toBe('08012345678');
    });

    it('normalizes UPI handles (lowercased, trimmed)', () => {
      expect(normalizeEntityValue('upi', '  HR-DEPOSIT@OKAXIS  ')).toBe('hr-deposit@okaxis');
    });

    it('normalizes bank accounts (uppercase alphanumeric)', () => {
      expect(normalizeEntityValue('bank_account', 'sbin-0001234 9876543210')).toBe('SBIN00012349876543210');
    });
  });

  describe('Salted SHA-256 Hashing', () => {
    it('generates consistent deterministic 64-character hex hash', () => {
      const hash1 = hashEntity('domain', 'tcs-careers-portal.net', TEST_PEPPER);
      const hash2 = hashEntity('domain', 'https://www.tcs-careers-portal.net/', TEST_PEPPER);

      expect(hash1).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
      expect(hash1).toBe(hash2);
    });

    it('is case-insensitive for email addresses', () => {
      const hash1 = hashEntity('email', 'recruiter@fake-company.com', TEST_PEPPER);
      const hash2 = hashEntity('email', 'RECRUITER@FAKE-COMPANY.COM', TEST_PEPPER);

      expect(hash1).toBe(hash2);
    });

    it('produces different hashes when pepper changes', () => {
      const hashA = hashEntity('email', 'target@example.com', 'pepper-version-alpha-24-chars');
      const hashB = hashEntity('email', 'target@example.com', 'pepper-version-bravo-24-chars');

      expect(hashA).not.toBe(hashB);
    });

    it('guarantees 100% byte-identical output between server library and scripts/hashEntity.mjs', () => {
      const testCases = [
        { type: 'domain', value: 'https://www.phishing-target.net/login' },
        { type: 'email', value: 'HR-Deposit@scam-mail.org' },
        { type: 'phone', value: '+91 98765-43210' },
        { type: 'upi', value: 'scam@okicici' },
        { type: 'bank_account', value: 'HDFC0001234-9876543210' },
      ] as const;

      for (const tc of testCases) {
        const normLib = normalizeEntityValue(tc.type, tc.value);
        const normMjs = normalizeEntityValueMjs(tc.type, tc.value);
        expect(normLib).toBe(normMjs);

        const hashLib = hashEntity(tc.type, tc.value, TEST_PEPPER);
        const hashMjs = hashEntityMjs(tc.type, tc.value, TEST_PEPPER);
        expect(hashLib).toBe(hashMjs);
      }
    });
  });
});

