import { describe, it, expect } from 'vitest';
import { extractEntities, extractOrganization } from '../entities/index.js';

describe('Entity & Indicator Extraction (entities/index.ts)', () => {
  it('extracts URLs and domains from text', () => {
    const text = 'Visit our career site at https://careers.tcs.com/apply and view http://example.org/intern.';
    const entities = extractEntities(text);
    expect(entities.urls).toEqual([
      'https://careers.tcs.com/apply',
      'http://example.org/intern',
    ]);
    expect(entities.domains).toContain('careers.tcs.com');
    expect(entities.domains).toContain('example.org');
  });

  it('extracts emails and derives domains', () => {
    const text = 'Reach out to recruiter@tcs.com and backup@gmail.com.';
    const entities = extractEntities(text);
    expect(entities.emails).toEqual(['recruiter@tcs.com', 'backup@gmail.com']);
    expect(entities.domains).toContain('tcs.com');
    expect(entities.domains).toContain('gmail.com');
  });

  it('extracts 10-digit Indian phones and formats', () => {
    const text = 'Contact numbers: +91 9876543210 and 8765432109.';
    const entities = extractEntities(text);
    expect(entities.phones).toContain('+919876543210');
    expect(entities.phones).toContain('8765432109');
  });

  it('extracts UPI handles', () => {
    const text = 'Send deposit to payments.tcs@okhdfcbank or help@paytm.';
    const entities = extractEntities(text);
    expect(entities.upiHandles).toEqual(['payments.tcs@okhdfcbank', 'help@paytm']);
  });

  it('extracts Indian currency amounts', () => {
    const text = 'Stipend ₹25,000 per month with bonus of Rs. 5000 and registration fee INR 1000.';
    const entities = extractEntities(text);
    expect(entities.amounts.length).toBeGreaterThanOrEqual(3);
  });

  describe('Conservative Scored Organization Extraction', () => {
    it('identifies known prominent brands', () => {
      expect(extractOrganization('Opportunity at Tata Consultancy Services.')).toBe(
        'Tata Consultancy Services'
      );
      expect(extractOrganization('Infosys campus hiring 2026.')).toBe('Infosys');
      expect(extractOrganization('Internship with TechCorp engineering.')).toBe('TechCorp');
    });

    it('identifies company names with corporate legal suffixes', () => {
      expect(extractOrganization('Welcome to Horizon Solutions Pvt. Ltd. onboarding.')).toContain(
        'Horizon Solutions Pvt. Ltd.'
      );
      expect(extractOrganization('Offer from Nexa Technologies.')).toContain(
        'Nexa Technologies'
      );
    });

    it('identifies organizations preceded by prepositions', () => {
      expect(extractOrganization('Selected for internship at Zenith Analytics.')).toContain(
        'Zenith Analytics'
      );
    });

    it('returns null when organization is uncertain or generic stopwords', () => {
      expect(extractOrganization('Congratulations candidate! You are hired.')).toBeNull();
      expect(extractOrganization('Hello student, please join our whatsapp group.')).toBeNull();
      expect(extractOrganization('Work from home freelance project.')).toBeNull();
    });
  });
});
