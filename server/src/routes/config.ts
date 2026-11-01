import { Router, type Request, type Response } from 'express';
import { loadEnv } from '../config/env.js';

const router = Router();

/**
 * GET /api/config
 * Returns public configuration parameters (Supabase URL and anon key).
 * Invariant: Never returns service-role keys, peppers, or API secrets.
 */
router.get('/config', (_req: Request, res: Response) => {
  const env = loadEnv();
  res.status(200).json({
    data: {
      supabaseUrl: env.SUPABASE_URL,
      supabaseAnonKey: env.SUPABASE_ANON_KEY,
    },
  });
});

export const configRouter = router;

