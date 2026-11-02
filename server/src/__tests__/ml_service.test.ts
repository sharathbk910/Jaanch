import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MLService, type MLSignalResult } from '../services/mlService.js';
import { AnalyzeService } from '../services/analyzeService.js';

describe('MLService - Unit Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('aborts immediately and returns null if consent is false', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const result = await MLService.analyze(
      'This is a sufficiently long recruitment text with over fifty characters to test consent.',
      false
    );

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('aborts immediately and returns null if text is under 50 characters', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const result = await MLService.analyze('Short text < 50 chars', true);

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('enforces fail-open: returns null when ML microservice returns 500 error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as any);

    const result = await MLService.analyze(
      'Congratulations! You have been selected for Data Entry Operator. Pay 5000 registration fee.',
      true
    );

    expect(result).toBeNull();
  });

  it('enforces fail-open: returns null when network fails or throws an exception', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:8000'));

    const result = await MLService.analyze(
      'Congratulations! You have been selected for Data Entry Operator. Pay 5000 registration fee.',
      true
    );

    expect(result).toBeNull();
  });

  it('enforces safety invariant: clamps high or critical severity down to medium', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'ml',
        signal: 'possible_scam_pattern',
        severity: 'high', // Should be clamped to medium
        confidence: 0.9957,
        top_contributing_terms: ['data entry', 'fee', 'telegram'],
        model_version: 'tfidf-logreg-v3-tuned-calibrated',
      }),
    } as any);

    const result = await MLService.analyze(
      'Congratulations! You have been selected for Data Entry Operator. Pay 5000 registration fee.',
      true
    );

    expect(result).not.toBeNull();
    expect(result?.severity).toBe('medium');
    expect(result?.confidence).toBe(0.9957);
    expect(result?.top_contributing_terms).toEqual(['data entry', 'fee', 'telegram']);
  });

  it('correctly returns low severity and signal from valid 200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'ml',
        signal: 'possible_scam_pattern',
        severity: 'low',
        confidence: 0.65,
        top_contributing_terms: ['telegram', 'urgent'],
        model_version: 'tfidf-logreg-v3-tuned-calibrated',
      }),
    } as any);

    const result = await MLService.analyze(
      'Join our team as an intern today. Reach out to HR on Telegram for next steps.',
      true
    );

    expect(result).not.toBeNull();
    expect(result?.severity).toBe('low');
    expect(result?.signal).toBe('possible_scam_pattern');
    expect(result?.confidence).toBe(0.65);
  });
});

describe('AnalyzeService - ML Microservice Integration Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('adds supplementary ML signal when ML detects scam patterns and user consented', async () => {
    vi.spyOn(MLService, 'analyze').mockResolvedValue({
      source: 'ml',
      signal: 'possible_scam_pattern',
      severity: 'medium',
      confidence: 0.985,
      top_contributing_terms: ['registration fee', 'data entry', 'deposit', 'telegram'],
      model_version: 'tfidf-logreg-v3-tuned-calibrated',
    });

    const result = await AnalyzeService.analyze({
      text: 'Congratulations! You are selected as Data Entry Operator. Kindly submit your initial details.',
      useAi: true,
    });

    const mlSignal = result.signals.find((s) => s.id === 'ml_scam_pattern_match');
    expect(mlSignal).toBeDefined();
    expect(mlSignal?.title).toBe('Statistical Scam Pattern Detected');
    expect(mlSignal?.severity).toBe('medium');
    expect(mlSignal?.source).toBe('ml');
    expect(mlSignal?.whyItMatters).toContain(
      'Language patterns match known scam templates with 98.5% confidence.'
    );
    expect(mlSignal?.whyItMatters).toContain(
      'Key trigger phrases: registration fee, data entry, deposit, telegram.'
    );
  });

  it('does not add ML signal when ML returns severity "none"', async () => {
    vi.spyOn(MLService, 'analyze').mockResolvedValue({
      source: 'ml',
      signal: null,
      severity: 'none',
      confidence: 0.04,
      top_contributing_terms: [],
      model_version: 'tfidf-logreg-v3-tuned-calibrated',
    });

    const result = await AnalyzeService.analyze({
      text: 'Dear Candidate, We are pleased to invite you for an interview at Tata Consultancy Services for the graduate trainee role. Please note that TCS does not charge any fee at any stage of the recruitment process.',
      domain: 'job',
      useAi: true,
    });

    const mlSignal = result.signals.find((s) => s.id === 'ml_scam_pattern_match');
    expect(mlSignal).toBeUndefined();
    expect(result.status).not.toBe('CONFIRMED_SCAM');
    expect(result.status).not.toBe('HIGH_CONCERN');
  });

  it('safety invariant: deterministic fee scam rules take precedence over ML', async () => {
    vi.spyOn(MLService, 'analyze').mockResolvedValue({
      source: 'ml',
      signal: null,
      severity: 'none', // ML didn't catch it
      confidence: 0.1,
      top_contributing_terms: [],
      model_version: 'tfidf-logreg-v3-tuned-calibrated',
    });

    // Contains blatant upfront fee request
    const result = await AnalyzeService.analyze({
      text: 'Congratulations! Selected as HR intern. Please pay Rs 2500 registration fee via Google Pay.',
      useAi: true,
    });

    // Deterministic rules must trigger HIGH_CONCERN regardless of ML returning none
    expect(result.status).toBe('HIGH_CONCERN');
  });

  it('safety invariant: ML signal alone cannot trigger HIGH_CONCERN or mark posting as Verified', async () => {
    vi.spyOn(MLService, 'analyze').mockResolvedValue({
      source: 'ml',
      signal: 'possible_scam_pattern',
      severity: 'medium',
      confidence: 0.99,
      top_contributing_terms: ['offer', 'bonus'],
      model_version: 'tfidf-logreg-v3-tuned-calibrated',
    });

    // Neutral text with no hard deterministic rule violations
    const result = await AnalyzeService.analyze({
      text: 'Congratulations! Here is your official offer letter for our upcoming summer cohort.',
      useAi: true,
    });

    // May trigger NEEDS_REVIEW, but NEVER HIGH_CONCERN or CONFIRMED_SCAM
    expect(result.status).not.toBe('HIGH_CONCERN');
    expect(result.status).not.toBe('CONFIRMED_SCAM');
    expect(result.status).toBe('NEEDS_REVIEW');
  });
});
