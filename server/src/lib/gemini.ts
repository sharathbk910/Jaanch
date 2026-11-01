import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  redactText,
  findSpan,
  type Signal,
  type AiStatus,
  SignalSchema,
} from '@jaanch/shared';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';
import { JAANCH_SYSTEM_PROMPT } from '../ai/prompts/system.js';
import {
  buildAnalysisPrompt,
  ANALYSIS_JSON_SCHEMA,
  AnalysisOutputSchema,
  type AnalysisOutput,
} from '../ai/prompts/analysis.js';
import {
  buildChallengePrompt,
  buildChallengeTemplate,
  CHALLENGE_JSON_SCHEMA,
  ChallengeOutputSchema,
  type ChallengeOutput,
} from '../ai/prompts/challenge.js';
import {
  buildSafeReplyPrompt,
  buildSafeReplyTemplate,
  SAFE_REPLY_JSON_SCHEMA,
  SafeReplyOutputSchema,
  type SafeReplyOutput,
} from '../ai/prompts/safeReply.js';
import {
  buildLinkExplainPrompt,
  buildLinkExplainTemplate,
  LINK_EXPLAIN_JSON_SCHEMA,
  LinkExplainOutputSchema,
  type LinkExplainOutput,
  type LinkObservationsData,
} from '../ai/prompts/linkExplain.js';
import {
  buildExtractionPrompt,
  EXTRACTION_JSON_SCHEMA,
  ExtractionOutputSchema,
  type ExtractionOutput,
} from '../ai/prompts/extraction.js';

let clientInstance: GoogleGenAI | null = null;

/**
 * Returns cached Gemini client or initializes a new one if GEMINI_API_KEY is configured.
 */
export function getGemini(): GoogleGenAI | null {
  if (clientInstance) {
    return clientInstance;
  }
  const env = loadEnv();
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
    return null;
  }
  clientInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return clientInstance;
}

/**
 * For testing: resets or overrides the Gemini client instance.
 */
export function setGeminiClientForTest(client: GoogleGenAI | null): void {
  clientInstance = client;
}

/**
 * Executes a structured content generation with Gemini using strict JSON schema,
 * abort signal timeout, and one stricter retry on validation failure.
 */
export async function generateStructured<T>(opts: {
  systemInstruction: string;
  userContent: string;
  jsonSchema: Record<string, unknown>;
  zodSchema: z.ZodType<T>;
  timeoutMs?: number;
}): Promise<T> {
  const ai = getGemini();
  if (!ai) {
    throw new Error('AI_UNAVAILABLE');
  }

  const env = loadEnv();
  const timeoutMs = opts.timeoutMs ?? 20000;

  async function executeCall(content: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai!.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: content,
        config: {
          systemInstruction: opts.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: opts.jsonSchema,
          temperature: 0.2,
          maxOutputTokens: 2048,
          abortSignal: controller.signal,
        },
      });

      const text = response.text || '';
      let rawJson: unknown;
      try {
        rawJson = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('MALFORMED_JSON');
      }

      const parseResult = opts.zodSchema.safeParse(rawJson);
      if (!parseResult.success) {
        throw new Error(`SCHEMA_VALIDATION_FAILED: ${parseResult.error.message}`);
      }

      return parseResult.data;
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    // Primary attempt
    return await executeCall(opts.userContent);
  } catch (firstErr: any) {
    // If aborted due to timeout or unavailable, do not retry
    if (firstErr.name === 'AbortError' || firstErr.message === 'AI_UNAVAILABLE') {
      throw firstErr;
    }

    logger.warn(
      { err: firstErr.message },
      'Gemini primary attempt failed schema/parse validation. Retrying with stricter prompt.'
    );

    // Stricter retry reminder
    const stricterContent = `${opts.userContent}

IMPORTANT: Your previous output failed schema validation (${firstErr.message}). You MUST return ONLY valid JSON matching the exact schema definition without markdown fences, comments, or unexpected fields.`;

    try {
      return await executeCall(stricterContent);
    } catch (secondErr: any) {
      logger.error(
        { err: secondErr.message },
        'Gemini retry attempt failed. Failing soft with invalid_output status.'
      );
      throw new Error('AI_INVALID_OUTPUT');
    }
  }
}

export interface AIAnalysisResult {
  signals: Signal[];
  unverified: string[];
  extraSteps: string[];
  overview?: string;
  aiStatus: AiStatus;
}

/**
 * Runs optional AI analysis on offer text.
 * Strictly adheres to safety and governance invariants:
 * 1. PII Redaction: Student text is redacted before submission.
 * 2. Grounding: Every AI-suggested signal is grounded in the text via findSpan.
 * 3. Invariants: Rule engine findings take precedence; AI signals never exceed 'high' severity.
 * 4. Fail-soft: Any AI failure returns rule-only result with HTTP 200.
 */
export async function runAIAnalysis(params: {
  rawText: string;
  domain?: string;
  channel?: string;
  claimedOrg?: string;
  ruleHits?: Array<{ ruleId: string; title: string }>;
}): Promise<AIAnalysisResult> {
  const ai = getGemini();

  if (!ai) {
    return {
      signals: [],
      unverified: [],
      extraSteps: [],
      aiStatus: 'disabled',
    };
  }

  const env = loadEnv();

  try {
    // 1. Mandatory PII redaction
    const redacted = redactText(params.rawText);

    logger.info(
      {
        redactionCount: redacted.redactionCount,
        model: env.GEMINI_MODEL,
      },
      'Dispatching redacted text to Gemini analysis'
    );

    const userPrompt = buildAnalysisPrompt({
      domain: params.domain,
      channel: params.channel,
      claimedOrg: params.claimedOrg,
      ruleHits: params.ruleHits,
      redactedText: redacted.redactedText,
    });

    const aiOutput = await generateStructured<AnalysisOutput>({
      systemInstruction: JAANCH_SYSTEM_PROMPT,
      userContent: userPrompt,
      jsonSchema: ANALYSIS_JSON_SCHEMA,
      zodSchema: AnalysisOutputSchema,
      timeoutMs: 20000,
    });

    // Ground AI signals: verify quote existence and re-snap to whole-word boundaries
    const groundedSignals: Signal[] = [];
    const lowerText = redacted.redactedText.toLowerCase();

    for (let i = 0; i < aiOutput.additionalSignals.length; i++) {
      const sig = aiOutput.additionalSignals[i];
      const quote = sig.evidenceQuote.trim();
      const matchIdx = lowerText.indexOf(quote.toLowerCase());

      if (matchIdx === -1) {
        logger.info(
          { ungroundedQuote: quote },
          'Discarding ungrounded AI signal: quote was not found in message text'
        );
        continue;
      }

      // Re-snap to word boundaries within the sentence via findSpan
      const groundedEvidence = findSpan(redacted.redactedText, matchIdx, quote.length, 160);

      // Severity is strictly <= high (AI can never emit critical)
      const severity = sig.severity === 'high' ? 'high' : sig.severity === 'medium' ? 'medium' : 'low';

      groundedSignals.push({
        id: `sig_ai_${sig.category}_${i + 1}`,
        ruleId: `RULE_AI_${sig.category.toUpperCase()}`,
        title: sig.title,
        whyItMatters: sig.whyItMatters,
        evidence: groundedEvidence || quote,
        severity,
        source: 'AI-observed',
      });
    }

    const unverified = aiOutput.unverified.map(
      (u) => `${u.item} — How to verify: ${u.howToVerify}`
    );

    return {
      signals: groundedSignals,
      unverified,
      extraSteps: aiOutput.extraVerificationSteps,
      overview: aiOutput.overview,
      aiStatus: 'success',
    };
  } catch (err: any) {
    let aiStatus: AiStatus = 'api_error';
    if (err.message === 'AI_UNAVAILABLE') {
      aiStatus = 'disabled';
    } else if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('abort')) {
      aiStatus = 'timeout';
    } else if (err.message === 'AI_INVALID_OUTPUT') {
      aiStatus = 'invalid_output';
    }

    logger.warn({ err: err.message, aiStatus }, 'Optional AI analysis failed soft');

    return {
      signals: [],
      unverified: [],
      extraSteps: [],
      aiStatus,
    };
  }
}

/**
 * Generates recruiter challenge email or safe reply using Gemini with template fallback.
 */
export async function generateChallengeEmail(opts: {
  kind?: 'challenge' | 'safe_reply';
  domain?: string;
  claimedOrg?: string;
  tone?: 'polite' | 'firm';
  senderName?: string;
  useAi?: boolean;
}): Promise<{
  subject: string;
  body: string;
  source: 'ai' | 'template';
  kind: 'challenge' | 'safe_reply';
}> {
  const kind = opts.kind === 'safe_reply' ? 'safe_reply' : 'challenge';
  const shouldTryAi = opts.useAi === true && Boolean(getGemini());

  if (shouldTryAi) {
    try {
      if (kind === 'safe_reply') {
        const prompt = buildSafeReplyPrompt(opts);
        const res = await generateStructured<SafeReplyOutput>({
          systemInstruction: JAANCH_SYSTEM_PROMPT,
          userContent: prompt,
          jsonSchema: SAFE_REPLY_JSON_SCHEMA,
          zodSchema: SafeReplyOutputSchema,
          timeoutMs: 15000,
        });
        return { subject: res.subject, body: res.body, source: 'ai', kind };
      } else {
        const prompt = buildChallengePrompt(opts);
        const res = await generateStructured<ChallengeOutput>({
          systemInstruction: JAANCH_SYSTEM_PROMPT,
          userContent: prompt,
          jsonSchema: CHALLENGE_JSON_SCHEMA,
          zodSchema: ChallengeOutputSchema,
          timeoutMs: 15000,
        });
        return { subject: res.subject, body: res.body, source: 'ai', kind };
      }
    } catch (err: any) {
      logger.warn(
        { err: err.message, kind },
        'AI generation for challenge/safe reply failed; using deterministic template fallback'
      );
    }
  }

  // Deterministic template fallback
  const fallback =
    kind === 'safe_reply' ? buildSafeReplyTemplate(opts) : buildChallengeTemplate(opts);

  return {
    subject: fallback.subject,
    body: fallback.body,
    source: 'template',
    kind,
  };
}

/**
 * Generates plain language explanation for link inspection results using Gemini with template fallback.
 */
export async function explainLinkObservations(
  data: LinkObservationsData,
  useAi = false
): Promise<{
  plainExplanation: string;
  whatToCheckNext: string[];
  source: 'ai' | 'template';
}> {
  const shouldTryAi = useAi && Boolean(getGemini());

  if (shouldTryAi) {
    try {
      const prompt = buildLinkExplainPrompt(data);
      const res = await generateStructured<LinkExplainOutput>({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: LINK_EXPLAIN_JSON_SCHEMA,
        zodSchema: LinkExplainOutputSchema,
        timeoutMs: 15000,
      });
      return {
        plainExplanation: res.plainExplanation,
        whatToCheckNext: res.whatToCheckNext,
        source: 'ai',
      };
    } catch (err: any) {
      logger.warn(
        { err: err.message },
        'AI link explanation failed; falling back to deterministic template'
      );
    }
  }

  const fallback = buildLinkExplainTemplate(data);
  return {
    plainExplanation: fallback.plainExplanation,
    whatToCheckNext: fallback.whatToCheckNext,
    source: 'template',
  };
}

/**
 * Fills in missed extraction fields using Gemini (optional).
 */
export async function fillMissedExtractionFields(
  rawText: string,
  missedFields: string[]
): Promise<ExtractionOutput | null> {
  const ai = getGemini();
  if (!ai || missedFields.length === 0) return null;

  try {
    const redacted = redactText(rawText);
    const prompt = buildExtractionPrompt(redacted.redactedText, missedFields);

    return await generateStructured<ExtractionOutput>({
      systemInstruction: JAANCH_SYSTEM_PROMPT,
      userContent: prompt,
      jsonSchema: EXTRACTION_JSON_SCHEMA,
      zodSchema: ExtractionOutputSchema,
      timeoutMs: 15000,
    });
  } catch (err: any) {
    logger.warn({ err: err.message }, 'AI field extraction fill-in failed soft');
    return null;
  }
}

/**
 * Backwards compatibility helper for existing analyze router signature.
 */
export async function generateOptionalAISignal(rawText: string): Promise<Signal | null> {
  const res = await runAIAnalysis({ rawText });
  return res.signals[0] || null;
}
