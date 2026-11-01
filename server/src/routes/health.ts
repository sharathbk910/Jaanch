import { Router, type Request, type Response } from 'express';
import { JAANCH_VERSION } from '@jaanch/shared';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: JAANCH_VERSION,
  });
});

export const healthRouter = router;
