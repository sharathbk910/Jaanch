import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  isPunycode,
  isUrlShortener,
  detectLookalikeDomain,
} from '../links/index.js';

describe('Link & Domain Utilities (links/index.ts)', () => {
  describe('Levenshtein distance', () => {
    it('computes correct edit distance', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('tcs', 'tcs')).toBe(0);
      expect(levenshteinDistance('google', 'g00gle')).toBe(2);
      expect(levenshteinDistance('infosys', 'inf0sys')).toBe(1);
    });
  });

  describe('Punycode / IDN homograph detection', () => {
    it('flags punycode domains', () => {
      expect(isPunycode('xn--microsft-54a.com')).toBe(true);
      expect(isPunycode('microsoft.com')).toBe(false);
    });
  });

  describe('URL shorteners', () => {
    it('detects common URL shortener hosts', () => {
      expect(isUrlShortener('bit.ly')).toBe(true);
      expect(isUrlShortener('tinyurl.com')).toBe(true);
      expect(isUrlShortener('t.co')).toBe(true);
      expect(isUrlShortener('careers.tcs.com')).toBe(false);
    });
  });

  describe('detectLookalikeDomain()', () => {
    it('detects typosquat with number substitution', () => {
      const res = detectLookalikeDomain('micros0ft.com');
      expect(res.isLookalike).toBe(true);
      expect(res.targetBrand).toBe('microsoft');
    });

    it('detects brand keyword additions on unofficial domain', () => {
      const res1 = detectLookalikeDomain('tcs-careers.org');
      expect(res1.isLookalike).toBe(true);
      expect(res1.targetBrand).toBe('tcs');

      const res2 = detectLookalikeDomain('google-jobs.in');
      expect(res2.isLookalike).toBe(true);
      expect(res2.targetBrand).toBe('google');
    });

    it('detects low Levenshtein edit distance', () => {
      const res = detectLookalikeDomain('infossys.com');
      expect(res.isLookalike).toBe(true);
      expect(res.targetBrand).toBe('infosys');
    });

    it('does NOT flag legitimate official domains', () => {
      expect(detectLookalikeDomain('tcs.com').isLookalike).toBe(false);
      expect(detectLookalikeDomain('careers.tcs.com').isLookalike).toBe(false);
      expect(detectLookalikeDomain('microsoft.com').isLookalike).toBe(false);
      expect(detectLookalikeDomain('google.com').isLookalike).toBe(false);
    });

    it('does NOT flag unrelated normal domains', () => {
      expect(detectLookalikeDomain('myuniversity.edu.in').isLookalike).toBe(false);
      expect(detectLookalikeDomain('startup-labs.io').isLookalike).toBe(false);
    });
  });
});
