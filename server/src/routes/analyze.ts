import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  AnalyzeRequestSchema,
  analyzeOffer,
  extractEntities,
  redactText,
  validateOfferInput,
  type AnalyzeRequestInput,
  type AnalyzeResult,
  INPUT_LIMITS,
} from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';
import { generateOptionalAISignal, runAIAnalysis } from '../lib/gemini.js';
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

    // 0. Validate offer input rule-based requirements
    const validation = validateOfferInput(input.text);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          code: validation.code || 'INVALID_INPUT',
          message: validation.message || 'Invalid input provided for offer analysis',
        },
      });
    }

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

    // 1. Dual-Tier Shared Threat Intelligence Check (exact normalized text match + indicator match)
    const intelMatch = await ThreatIntelRepository.matchIntel(req.supabase || null, {
      text: input.text,
      indicators: indicatorsToCheck,
    });

    if (intelMatch) {
      result.intelMatch = intelMatch;

      if (intelMatch.status === 'confirmed') {
        // Invariant: ONLY confirmed produces CONFIRMED_SCAM and "matches a moderator-confirmed record"
        result.status = 'CONFIRMED_SCAM';
        result.confidenceScore = 99;
        result.signals.unshift({
          id: `sig_intel_${intelMatch.publicId}`,
          ruleId: 'RULE_CONFIRMED_FRAUD_RECORD',
          title: 'Confirmed Fraud Record Match',
          whyItMatters:
            'This opportunity matches a moderator-confirmed record in the shared scam intelligence network.',
          evidence: `Matches confirmed safety registry record #${intelMatch.publicId} (${intelMatch.tier})`,
          severity: 'critical',
        });
      } else if (intelMatch.status === 'suspicious' || intelMatch.status === 'ai_flagged') {
        // suspicious/ai_flagged produce "similar to reported messages" with the verdict unchanged
        result.signals.unshift({
          id: `sig_intel_${intelMatch.publicId}`,
          ruleId: 'RULE_SUSPICIOUS_REPORTED_RECORD',
          title: 'Similar to Reported Messages',
          whyItMatters:
            'This message or its indicators are similar to reported messages under community review.',
          evidence: `Matches reported community record #${intelMatch.publicId}`,
          severity: 'high',
        });
      }
    } else {
      // Fallback check for individual entity indicator lookup
      const legacyMatches = await ThreatIntelRepository.checkReportedEntities(
        req.supabase || null,
        indicatorsToCheck
      );

      const confirmedMatch = legacyMatches.find((m) => m.status === 'confirmed');
      const suspiciousMatch = legacyMatches.find((m) => m.status === 'suspicious' || m.status === 'ai_flagged');

      if (confirmedMatch) {
        result.status = 'CONFIRMED_SCAM';
        result.confidenceScore = 99;
        result.intelMatch = {
          tier: 'indicator_match',
          status: 'confirmed',
          confidenceBand: 'high',
          explanation: 'Matches a moderator-confirmed record in the trust safety network.',
          publicId: confirmedMatch.id.slice(0, 8),
          matchedIndicators: [confirmedMatch.entityType],
        };
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
        result.intelMatch = {
          tier: 'indicator_match',
          status: suspiciousMatch.status,
          confidenceBand: 'medium',
          explanation: 'Similar to reported messages under community review.',
          publicId: suspiciousMatch.id.slice(0, 8),
          matchedIndicators: [suspiciousMatch.entityType],
        };
        result.signals.unshift({
          id: `sig_intel_${suspiciousMatch.id}`,
          ruleId: 'RULE_SUSPICIOUS_REPORTED_RECORD',
          title: 'Similar to Reported Messages',
          whyItMatters:
            'This contact identifier has been reported by students and is under active investigation in the trust & safety database.',
          evidence: `Matches reported community indicator #${suspiciousMatch.id.slice(0, 8)}`,
          severity: 'high',
        });
      }
    }

    // Invariant: Record post-intel status; AI can NEVER change it
    const originalStatus = result.status;

    // 2. Optional Gemini signal only if consent
    if (input.consentFlags?.aiAnalysis === true) {
      const aiAnalysis = await runAIAnalysis({
        rawText: input.text,
        domain: input.domain,
        channel: input.channel,
        claimedOrg: input.sender?.organization || result.extractedEntities.organization || undefined,
        ruleHits: result.signals.map((s) => ({ ruleId: s.ruleId, title: s.title })),
      });

      result.aiStatus = aiAnalysis.aiStatus;
      if (aiAnalysis.overview) {
        result.aiOverview = aiAnalysis.overview;
      }
      if (aiAnalysis.signals.length > 0) {
        result.signals.push(...aiAnalysis.signals);
      }
      if (aiAnalysis.unverified.length > 0) {
        for (const u of aiAnalysis.unverified) {
          if (!result.unverified.includes(u)) {
            result.unverified.push(u);
          }
        }
      }
      if (aiAnalysis.extraSteps.length > 0) {
        for (const step of aiAnalysis.extraSteps) {
          if (!result.recommendedActions.includes(step)) {
            result.recommendedActions.push(step);
          }
        }
      }
    } else {
      result.aiStatus = 'not_requested';
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
