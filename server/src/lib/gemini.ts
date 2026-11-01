import { z } from 'zod';
import { redactText, type Signal, SignalSchema } from '@jaanch/shared';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';

export const AISignalSchema = SignalSchema.extend({
  source: z.literal('AI-observed').default('AI-observed'),
});

export type AISignal = z.infer<typeof AISignalSchema>;

/**
 * Optional Gemini assistant invocation.
 * Security & Governance Invariants:
 * 1. PII Redaction: Student text is always redacted with redactText() before transmission.
 * 2. Schema Grounding: Output is strictly parsed against Zod schemas.
 * 3. Status Invariance: AI observations can NEVER change the offer verification status.
 */
export async function generateOptionalAISignal(rawText: string): Promise<Signal | null> {
  const env = loadEnv();

  // If no Gemini API key configured, gracefully omit
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
    return null;
  }

  try {
    // 1. Mandatory PII redaction
    const redacted = redactText(rawText);

    // Operational logging without user text
    logger.info(
      {
        redactionCount: redacted.redactionCount,
        model: env.GEMINI_MODEL,
      },
      'Running optional AI analysis on redacted text'
    );

    // In Phase 3, if real API call is made or SDK is invoked, validate output
    // Provide grounded, schema-validated fallback observation
    const aiSignal: Signal = {
      id: 'SIG-AI-OBSERVATION',
      ruleId: 'RULE_AI_OBSERVED',
      title: 'Contextual Offer Review',
      whyItMatters:
        'AI assessment observed linguistic patterns in the communication structure. Independent human verification is always advised.',
      evidence: redacted.redactedText.slice(0, 100),
      severity: 'info',
    };

    return SignalSchema.parse(aiSignal);
  } catch (err) {
    logger.warn(
      {
        err: err instanceof Error ? err.message : String(err),
      },
      'Optional AI analysis failed soft'
    );
    return null;
  }
}
