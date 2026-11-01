import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { generateChallengeEmail } from '../lib/gemini.js';
import { logger } from '../lib/logger.js';

const router = Router();

export const ChallengeEmailRequestSchema = z.object({
  kind: z.enum(['challenge', 'safe_reply']).default('challenge'),
  domain: z.string().max(50).optional(),
  claimedOrg: z.string().max(100).optional(),
  tone: z.enum(['polite', 'firm']).default('polite'),
  senderName: z.string().max(100).optional(),
  useAi: z.boolean().default(false),
});

export type ChallengeEmailRequest = z.infer<typeof ChallengeEmailRequestSchema>;

/**
 * POST /api/challenge-email
 * Generates structured recruiter challenge email or safe reply draft
 * using optional Gemini assistance with deterministic template fallback.
 */
router.post(
  '/challenge-email',
  validateBody(ChallengeEmailRequestSchema),
  async (req: Request, res: Response) => {
    const input = req.body as ChallengeEmailRequest;

    try {
      const result = await generateChallengeEmail(input);

      logger.info(
        {
          requestId: req.id,
          kind: result.kind,
          source: result.source,
        },
        'Challenge email / safe reply generated'
      );

      res.status(200).json({
        data: result,
      });
    } catch (err: any) {
      logger.error({ err, requestId: req.id }, 'Challenge email generation failed');
      res.status(500).json({
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate response email draft.',
          requestId: req.id,
        },
      });
    }
  }
);

export default router;

