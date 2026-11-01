import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  AnalyzeRequestSchema,
  analyzeOffer,
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

    // Invariant: Record original status; AI can NEVER change it
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
