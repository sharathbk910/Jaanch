import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const LookupSchema = z.object({
  entityType: z.enum(['email', 'domain', 'phone', 'upi', 'bank_account']),
  valueHash: z.string().min(10),
});

// Feature-flagged listing verification per Spec
router.post('/analyses/:id/official-listing', (_req: Request, res: Response) => {
  res.status(200).json({
    enabled: false,
    message: 'Official listing check feature is disabled while flag is off.',
  });
});

// Intelligence reports lookup stub (returns empty matches until Phase 4 DB / Phase 7 Intel)
router.post('/reports/lookup', validateBody(LookupSchema), (_req: Request, res: Response) => {
  res.status(200).json({
    data: {
      matches: [],
    },
  });
});

export const stubsRouter = router;

