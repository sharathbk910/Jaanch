import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { isPunycode } from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { linkCheckRateLimiter } from '../middleware/rateLimiter.js';
import { safeFetch, SafeFetchError } from '../lib/safeFetch.js';
import { loadEnv } from '../config/env.js';
import { logger } from '../lib/logger.js';
import net from 'node:net';
import { LinkService } from '../services/linkService.js';

const router = Router();

const LinkCheckSchema = z.object({
  url: z.string().refine(
    (val) => {
      try {
        const u = new URL(val);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(val);
      }
    },
    'Please provide a valid HTTP or HTTPS URL (e.g., https://example.com)'
  ),
  useAi: z.boolean().optional().default(false),
});

interface RdapResult {
  ageDays: number | null;
  status: 'verified' | 'unknown';
  errorReason?: string;
}

/**
 * Fetches domain registration age via RDAP using safeFetch.
 * Failure always yields status: 'unknown', NEVER 'pass'.
 */
export async function queryRdapDomainAge(domain: string): Promise<RdapResult> {
  const env = loadEnv();

  // Raw IPs cannot be checked via domain RDAP
  if (net.isIP(domain) || isPunycode(domain)) {
    return { ageDays: null, status: 'unknown', errorReason: 'Non-standard domain format' };
  }

  // Extract base domain (e.g., sub.example.com -> example.com)
  const parts = domain.split('.');
  const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

  const rdapUrl = `${env.RDAP_BASE_URL.replace(/\/$/, '')}/domain/${encodeURIComponent(baseDomain)}`;

  try {
    const res = await safeFetch(rdapUrl, {
      timeoutMs: env.RDAP_TIMEOUT_MS,
      maxBytes: 256 * 1024,
    });

    if (res.status === 200) {
      const data = await res.json<{ events?: Array<{ eventAction: string; eventDate: string }> }>();
      const regEvent = data.events?.find(
        (e) => e.eventAction === 'registration' || e.eventAction === 'transfer'
      );

      if (regEvent?.eventDate) {
        const regDate = new Date(regEvent.eventDate);
        if (!isNaN(regDate.getTime())) {
          const diffMs = Date.now() - regDate.getTime();
          const ageDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          return { ageDays, status: 'verified' };
        }
      }
    }

    return { ageDays: null, status: 'unknown', errorReason: `RDAP server returned status ${res.status}` };
  } catch (err) {
    logger.debug(
      {
        domain: baseDomain,
        err: err instanceof SafeFetchError ? err.code : 'FETCH_ERROR',
      },
      'RDAP domain age lookup failed soft'
    );
    // Critical Spec Rule: Failure must be "unknown", never "pass"
    return { ageDays: null, status: 'unknown', errorReason: 'RDAP query timed out or unavailable' };
  }
}

router.post(
  '/link-check',
  linkCheckRateLimiter(),
  validateBody(LinkCheckSchema),
  async (req: Request, res: Response) => {
    const { url, useAi } = req.body as { url: string; useAi?: boolean };

    try {
      const result = await LinkService.evaluateUrl(url, Boolean(useAi));
      res.status(200).json({
        data: result,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_URL') {
        res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: 'Unable to parse provided URL',
            requestId: req.id,
          },
        });
        return;
      }
      throw err;
    }
  }
);

export const linksRouter = router;
