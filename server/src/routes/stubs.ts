import { Router, type Request, type Response } from 'express';

const router = Router();

// Feature-flagged listing verification per Spec
router.post('/analyses/:id/official-listing', (_req: Request, res: Response) => {
  res.status(200).json({
    enabled: false,
    message: 'Official listing check feature is disabled while flag is off.',
  });
});

export const stubsRouter = router;

