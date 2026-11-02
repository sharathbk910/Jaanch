import { logger } from '../lib/logger.js';

export interface MLSignalResult {
  source: 'ml';
  signal: 'possible_scam_pattern' | null;
  severity: 'none' | 'low' | 'medium';
  confidence: number;
  top_contributing_terms: string[];
  model_version: string;
}

/**
 * MLService handles client-side communication with the calibrated Jaanch
 * scam detection microservice.
 *
 * Safety Invariants:
 *  - Fail-Open: All network, timeout, and parsing errors return null.
 *  - Consent Enforcement: Aborts immediately if consent is false or text < 50 chars.
 *  - Severity Clamping: Hard-caps output severity at 'medium' (never 'high').
 */
export class MLService {
  public static async analyze(text: string, consent: boolean): Promise<MLSignalResult | null> {
    // 1. Invariant: Only proceed if affirmative consent is granted and input is substantial
    if (!consent || !text || text.trim().length < 50) {
      return null;
    }

    const apiUrl = (process.env.ML_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    const timeoutMs = parseInt(process.env.ML_TIMEOUT_MS || '3000', 10);
    const endpoint = `${apiUrl}/ml/signal`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text,
          consent: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        logger.warn(
          { status: response.status, statusText: response.statusText, endpoint },
          'ML Scam Detection Microservice returned non-2xx status. Failing open.'
        );
        return null;
      }

      const raw = await response.json();

      // Programmatic Guardrail: Severity MUST be clamped to medium maximum
      let clampedSeverity: 'none' | 'low' | 'medium' = 'none';
      if (raw.severity === 'high' || raw.severity === 'critical' || raw.severity === 'medium') {
        clampedSeverity = 'medium';
      } else if (raw.severity === 'low') {
        clampedSeverity = 'low';
      }

      const result: MLSignalResult = {
        source: 'ml',
        signal: raw.signal === 'possible_scam_pattern' ? 'possible_scam_pattern' : null,
        severity: clampedSeverity,
        confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0,
        top_contributing_terms: Array.isArray(raw.top_contributing_terms)
          ? raw.top_contributing_terms.map(String)
          : [],
        model_version: String(raw.model_version || 'tfidf-logreg-v3-tuned-calibrated'),
      };

      return result;
    } catch (error: any) {
      // Fail-Open Exception Shielding
      if (error?.name === 'AbortError') {
        logger.warn({ timeoutMs, endpoint }, 'ML Scam Detection Microservice request timed out. Failing open.');
      } else {
        logger.warn(
          { error: error?.message || String(error), endpoint },
          'ML Scam Detection Microservice unreachable or threw error. Failing open.'
        );
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

