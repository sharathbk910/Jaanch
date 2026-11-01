import { Router, type Request, type Response } from 'express';
import {
  AnalyzeRequestSchema,
  analyzeOffer,
  type AnalyzeRequestInput,
  type AnalyzeResult,
  INPUT_LIMITS,
} from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../lib/logger.js';
import { generateOptionalAISignal } from '../lib/gemini.js';

const router = Router();

// Server-level schema with minimum length validation per Decision D12 & Acceptance Criteria
export const ServerAnalyzeRequestSchema = AnalyzeRequestSchema.extend({
  text: AnalyzeRequestSchema.shape.text.refine(
    (val) => val.trim().length >= INPUT_LIMITS.textMin,
    `Input text must be at least ${INPUT_LIMITS.textMin} characters long to analyze reliably`
  ),
});

router.post(
  '/analyze',
  analyzeRateLimiter(),
  validateBody(ServerAnalyzeRequestSchema),
  async (req: Request, res: Response) => {
    const input = req.body as AnalyzeRequestInput;
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

    const durationMs = Date.now() - startTime;

    logger.info(
      {
        requestId: req.id,
        method: 'POST',
        path: '/api/analyze',
        statusCode: 200,
        durationMs,
      },
      'Offer analysis completed'
    );

    res.status(200).json({
      data: result,
    });
  }
);

export const analyzeRouter = router;
