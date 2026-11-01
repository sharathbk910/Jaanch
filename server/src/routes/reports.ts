import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { ThreatIntelRepository } from '../lib/threatIntelRepository.js';
import { type EntityType } from '../lib/hashing.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Rate limiter: 10 reports per day per user
const reportRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  code: 'REPORT_RATE_LIMIT_EXCEEDED',
  message: 'Daily report submission limit reached. Please try again tomorrow.',
});

// Rate limiter: 60 lookups per hour
const lookupRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  code: 'LOOKUP_RATE_LIMIT_EXCEEDED',
  message: 'Threat intelligence lookup rate limit exceeded.',
});

export const ReportEntitySchema = z.object({
  entityType: z.enum(['email', 'domain', 'phone', 'upi', 'bank_account']),
  value: z.string().trim().min(2, 'Indicator value must be at least 2 characters').max(255),
  channel: z.enum(['email', 'whatsapp', 'telegram', 'sms', 'linkedin', 'website', 'other']).optional(),
  description: z.string().max(2000).optional(),
});

export const ThreatIntelLookupSchema = z.object({
  entities: z
    .array(
      z.object({
        entityType: z.enum(['email', 'domain', 'phone', 'upi', 'bank_account']),
        value: z.string().min(1),
      })
    )
    .optional(),
  hashes: z.array(z.string().min(10)).optional(),
});

/**
 * POST /api/reports/entity
 * Authenticated endpoint for reporting a fraudulent entity/indicator.
 * Hashes indicator with REPORT_HASH_PEPPER and stores report in DB.
 */
router.post(
  '/reports/entity',
  requireAuth,
  reportRateLimiter,
  validateBody(ReportEntitySchema),
  async (req: Request, res: Response) => {
    const { entityType, value, channel, description } = req.body as z.infer<typeof ReportEntitySchema>;
    const userId = req.user!.id;

    try {
      const result = await ThreatIntelRepository.submitScamReport(
        req.supabase || null,
        {
          userId,
          entityType: entityType as EntityType,
          rawValue: value,
          channel,
          description,
        }
      );

      logger.info(
        {
          requestId: req.id,
          userId,
          entityType,
          reportId: result.reportId,
        },
        'Community scam report submitted'
      );

      res.status(201).json({
        data: {
          reportId: result.reportId,
          status: result.status,
          reportCount: result.reportCount,
          message: 'Report submitted successfully to the trust & safety verification queue.',
        },
      });
    } catch (err) {
      logger.error({ err }, 'Failed to submit scam report');
      res.status(500).json({
        error: {
          code: 'REPORT_SUBMISSION_FAILED',
          message: 'Failed to process scam report submission.',
          requestId: req.id,
        },
      });
    }
  }
);

/**
 * POST /api/threat-intel/lookup
 * Checks whether indicators or hashes match confirmed or suspicious community records.
 */
router.post(
  '/threat-intel/lookup',
  optionalAuth,
  lookupRateLimiter,
  validateBody(ThreatIntelLookupSchema),
  async (req: Request, res: Response) => {
    const { entities, hashes } = req.body as z.infer<typeof ThreatIntelLookupSchema>;

    let indicatorsToCheck: Array<{ type: EntityType; value: string }> | string[] = [];
    if (entities && entities.length > 0) {
      indicatorsToCheck = entities.map((e) => ({
        type: e.entityType as EntityType,
        value: e.value,
      }));
    } else if (hashes && hashes.length > 0) {
      indicatorsToCheck = hashes;
    }

    try {
      const matches = await ThreatIntelRepository.checkReportedEntities(
        req.supabase || null,
        indicatorsToCheck
      );

      res.status(200).json({
        data: {
          matches,
        },
      });
    } catch (err) {
      logger.error({ err }, 'Failed to query threat intelligence');
      res.status(500).json({
        error: {
          code: 'LOOKUP_FAILED',
          message: 'Failed to complete threat intelligence lookup.',
          requestId: req.id,
        },
      });
    }
  }
);

export const reportsRouter = router;

