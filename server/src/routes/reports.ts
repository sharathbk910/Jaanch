import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { redactText, extractEntities, SubmitReportRequestSchema, DisputeRecordRequestSchema } from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { ThreatIntelRepository } from '../lib/threatIntelRepository.js';
import { type EntityType, type IndicatorType } from '../lib/hashing.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Rate limiter: 10 reports per day per user
const reportRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  code: 'REPORT_RATE_LIMIT_EXCEEDED',
  message: 'Daily report submission limit reached. Please try again tomorrow.',
});

// Rate limiter: 10 disputes per hour
const disputeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  code: 'DISPUTE_RATE_LIMIT_EXCEEDED',
  message: 'Dispute submission rate limit exceeded. Please try again later.',
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
 * POST /api/reports
 * Core Phase 7 community scam intelligence reporting endpoint.
 * Requires authentication and explicit shareIndicators consent.
 * Takes the text, scrubs all PII, normalizes and hashes with REPORT_HASH_PEPPER.
 * Deduplicates exact matches and applies multi-user promotion rules.
 */
router.post(
  '/reports',
  requireAuth,
  reportRateLimiter,
  validateBody(SubmitReportRequestSchema),
  async (req: Request, res: Response) => {
    const { text, category, indicators, shareIndicators } = req.body as z.infer<typeof SubmitReportRequestSchema>;
    const userId = req.user!.id;

    if (!shareIndicators) {
      res.status(400).json({
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'Indicator sharing consent is required to submit a scam report to protect other students.',
          requestId: req.id,
        },
      });
      return;
    }

    try {
      // 1. Scrub text with client/shared PII redaction so raw student text is NEVER stored
      const { redactedText } = redactText(text);

      // 2. Extract indicators if none supplied
      let processedIndicators: Array<{ type: IndicatorType; value: string; maskedDisplay?: string }> = [];
      if (indicators && indicators.length > 0) {
        processedIndicators = indicators;
      } else {
        const extracted = extractEntities(text);
        for (const u of extracted.urls) processedIndicators.push({ type: 'url', value: u });
        for (const d of extracted.domains) processedIndicators.push({ type: 'domain', value: d });
        for (const p of extracted.phones) processedIndicators.push({ type: 'phone', value: p });
        for (const upi of extracted.upiHandles) processedIndicators.push({ type: 'upi', value: upi });
      }

      const result = await ThreatIntelRepository.submitIntelReport(req.supabase || null, {
        userId,
        scrubbedText: redactedText,
        category,
        indicators: processedIndicators,
      });

      logger.info(
        {
          requestId: req.id,
          userId,
          publicId: result.publicId,
          status: result.status,
          deduplicated: result.deduplicated,
        },
        'Community scam intel report processed'
      );

      res.status(201).json({
        data: {
          recordId: result.recordId,
          publicId: result.publicId,
          status: result.status,
          deduplicated: result.deduplicated,
          isNewRecord: result.isNewRecord,
          message: 'Report submitted successfully. Your report protects other students across India.',
        },
      });
    } catch (err) {
      logger.error({ err }, 'Failed to submit shared intel report');
      res.status(500).json({
        error: {
          code: 'REPORT_SUBMISSION_FAILED',
          message: 'Failed to process scam intelligence report.',
          requestId: req.id,
        },
      });
    }
  }
);

/**
 * POST /api/disputes
 * Public endpoint allowing anyone to contest a threat intelligence record.
 * Rate-limited and sets record status to 'disputed' pending moderator review.
 */
router.post(
  '/disputes',
  optionalAuth,
  disputeRateLimiter,
  validateBody(DisputeRecordRequestSchema),
  async (req: Request, res: Response) => {
    const { publicId, reason, contactEmail } = req.body as z.infer<typeof DisputeRecordRequestSchema>;

    try {
      const result = await ThreatIntelRepository.disputeIntelRecord(req.supabase || null, {
        publicId,
        reason,
        contactEmail,
      });

      logger.info(
        {
          requestId: req.id,
          publicId,
          status: result.status,
        },
        'Intel record contested by user'
      );

      res.status(200).json({
        data: {
          publicId: result.publicId,
          status: result.status,
          message: 'Record contested successfully and set to disputed pending moderator investigation.',
        },
      });
    } catch (err: any) {
      const isNotFound = err.message && err.message.includes('not found');
      logger.error({ err }, 'Failed to dispute intel record');

      res.status(isNotFound ? 404 : 500).json({
        error: {
          code: isNotFound ? 'RECORD_NOT_FOUND' : 'DISPUTE_FAILED',
          message: err.message || 'Failed to contest record.',
          requestId: req.id,
        },
      });
    }
  }
);

/**
 * POST /api/reports/entity
 * Authenticated endpoint for reporting a single fraudulent entity/indicator.
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

