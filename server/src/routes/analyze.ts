import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  AnalyzeRequestSchema,
  analyzeOffer,
  extractEntities,
  redactText,
  type AnalyzeRequestInput,
  type AnalyzeResult,
  INPUT_LIMITS,
} from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';
import { generateOptionalAISignal } from '../lib/gemini.js';
import { HistoryRepository } from '../lib/historyRepository.js';
import { ThreatIntelRepository } from '../lib/threatIntelRepository.js';
import { type EntityType } from '../lib/hashing.js';

const router = Router();

// Server-level schema with minimum length validation per Decision D12 & Acceptance Criteria
export const ServerAnalyzeRequestSchema = AnalyzeRequestSchema.extend({
  text: AnalyzeRequestSchema.shape.text.refine(
    (val) => val.trim().length >= INPUT_LIMITS.textMin,
    `Input text must be at least ${INPUT_LIMITS.textMin} characters long to analyze reliably`
  ),
  inputType: z.string().optional(),
  channel: z.string().optional(),
  saveToHistory: z.boolean().optional(),
});

type ServerAnalyzeInput = z.infer<typeof ServerAnalyzeRequestSchema>;

router.post(
  '/analyze',
  optionalAuth,
  analyzeRateLimiter(),
  validateBody(ServerAnalyzeRequestSchema),
  async (req: Request, res: Response) => {
    const input = req.body as ServerAnalyzeInput;
    const startTime = Date.now();

    // 1. Run deterministic shared rules
    const result: AnalyzeResult = analyzeOffer(input);

    // 1b. Check threat intelligence repository for confirmed or suspicious indicators
    const rawEntities = extractEntities(input.text);
    const indicatorsToCheck: Array<{ type: EntityType; value: string }> = [];
    if (rawEntities.emails) {
      for (const email of rawEntities.emails) {
        indicatorsToCheck.push({ type: 'email', value: email });
      }
    }
    if (rawEntities.domains) {
      for (const domain of rawEntities.domains) {
        indicatorsToCheck.push({ type: 'domain', value: domain });
      }
    }
    if (rawEntities.phones) {
      for (const phone of rawEntities.phones) {
        indicatorsToCheck.push({ type: 'phone', value: phone });
      }
    }
    if (rawEntities.upiHandles) {
      for (const upi of rawEntities.upiHandles) {
        indicatorsToCheck.push({ type: 'upi', value: upi });
      }
    }

    const intelMatches = await ThreatIntelRepository.checkReportedEntities(
      req.supabase || null,
      indicatorsToCheck
    );

    const confirmedMatch = intelMatches.find((m) => m.status === 'confirmed');
    const suspiciousMatch = intelMatches.find((m) => m.status === 'suspicious' || m.status === 'ai_flagged');

    if (confirmedMatch) {
      // Invariant: CONFIRMED_SCAM is only reachable via moderator-confirmed intelligence record
      result.status = 'CONFIRMED_SCAM';
      result.confidenceScore = 99;
      result.signals.unshift({
        id: `sig_intel_${confirmedMatch.id}`,
        ruleId: 'RULE_CONFIRMED_FRAUD_RECORD',
        title: 'Confirmed Fraud Record Match',
        whyItMatters:
          'This opportunity contains a contact indicator that has been independently investigated and confirmed fraudulent by a human moderator.',
        evidence: `Matches confirmed safety registry record #${confirmedMatch.id.slice(0, 8)} (${confirmedMatch.entityType})`,
        severity: 'critical',
      });
    } else if (suspiciousMatch) {
      if (result.status === 'LIKELY_GENUINE' || result.status === 'NEEDS_REVIEW') {
        result.status = 'HIGH_CONCERN';
      }
      result.signals.unshift({
        id: `sig_intel_${suspiciousMatch.id}`,
        ruleId: 'RULE_SUSPICIOUS_REPORTED_RECORD',
        title: 'Community Reported Suspicious Identifier',
        whyItMatters:
          'This contact identifier has been reported by students and is under active investigation in the trust & safety database.',
        evidence: `Matches reported community indicator #${suspiciousMatch.id.slice(0, 8)} (${suspiciousMatch.reportCount} reports)`,
        severity: 'high',
      });
    }

    // Invariant: Record post-intel status; AI can NEVER change it
    const originalStatus = result.status;

    // 2. Optional Gemini signal only if consent + key
    if (input.consentFlags?.aiAnalysis === true) {
      const aiSignal = await generateOptionalAISignal(input.text);
      if (aiSignal) {
        result.signals.push(aiSignal);
      }
    }

    // Enforce invariant: status cannot be altered by AI
    result.status = originalStatus;

    // 3. Save to history only for authenticated users who opted in with saveToHistory=true
    // Unauthenticated guests and users who don't opt in persist nothing
    if (req.user && input.saveToHistory === true) {
      try {
        const textHash = crypto.createHash('sha256').update(input.text).digest('hex');
        const redactedText =
          input.consentFlags?.shareIndicators === true
            ? redactText(input.text).redactedText
            : null;

        const submissionId = await HistoryRepository.saveSubmission(
          req.supabase || null,
          {
            userId: req.user.id,
            inputType: input.inputType || 'raw_text',
            domain: input.domain || 'other',
            channel: input.channel || 'other',
            textHash,
            redactedText,
            status: result.status,
            confidence: result.confidenceScore,
            signals: result.signals,
          }
        );

        result.auditId = submissionId;
      } catch (err) {
        logger.error({ err }, 'Failed to persist submission to history');
      }
    }

    const durationMs = Date.now() - startTime;

    logger.info(
      {
        requestId: req.id,
        method: 'POST',
        path: '/api/analyze',
        statusCode: 200,
        durationMs,
        isAuthed: Boolean(req.user),
        savedToHistory: Boolean(result.auditId),
      },
      'Offer analysis completed'
    );

    res.status(200).json({
      data: result,
    });
  }
);

export const analyzeRouter = router;
