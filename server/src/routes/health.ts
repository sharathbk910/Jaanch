import { Router, type Request, type Response } from 'express';
import { JAANCH_VERSION } from '@jaanch/shared';
import { getPublicSupabaseClient } from '../lib/supabase.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: JAANCH_VERSION,
  });
});

router.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'live',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    const supabase = getPublicSupabaseClient();
    const { error } = await supabase.from('organizations').select('id', { count: 'exact', head: true }).limit(1);

    if (error) {
      res.status(503).json({
        status: 'not_ready',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      status: 'ready',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: JAANCH_VERSION,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    res.status(503).json({
      status: 'not_ready',
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
});

export const healthRouter = router;
