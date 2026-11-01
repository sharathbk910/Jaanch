import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ThreatIntelRepository, type ThreatEntityStatus } from '../lib/threatIntelRepository.js';
import { logger } from '../lib/logger.js';

const router = Router();

// All moderation routes strictly require authentication AND moderator role
router.use(requireAuth);
router.use(requireRole('moderator'));

export const TransitionStatusSchema = z.object({
  toStatus: z.enum([
    'reported',
    'unverified',
    'ai_flagged',
    'suspicious',
    'confirmed',
    'dismissed',
    'disputed',
  ]),
  notes: z.string().max(1000).optional(),
});

export const ModerationActionSchema = z.object({
  action: z.enum(['confirm', 'dismiss', 'dispute', 'retract']),
  reason: z.string().trim().min(5, 'Mandatory reason must be at least 5 characters').max(1000),
});

export const EditScrubbingSchema = z.object({
  newScrubbedText: z.string().trim().min(10, 'Scrubbed text must be at least 10 characters').max(50000),
  reason: z.string().trim().min(5, 'Mandatory reason must be at least 5 characters').max(1000),
});

/**
 * GET /api/moderation/queue
 * Lists intel records in the moderation triage queue.
 */
router.get('/queue', async (req: Request, res: Response) => {
  const status = req.query.status as ThreatEntityStatus | undefined;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  try {
    const result = await ThreatIntelRepository.listModerationQueue(
      req.supabase || null,
      { status, page, limit }
    );

    res.status(200).json({
      data: {
        items: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (err) {
    logger.error({ err }, 'Moderation queue fetch failed');
    res.status(500).json({
      error: {
        code: 'QUEUE_FETCH_FAILED',
        message: 'Failed to retrieve moderation queue.',
        requestId: req.id,
      },
    });
  }
});

/**
 * GET /api/moderation/records/:id
 * Fetches detail of an intel record (scrubbed text only, no raw submissions).
 */
router.get('/records/:id', async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const recordId = Array.isArray(rawId) ? rawId[0] : String(rawId);

  try {
    const detail = await ThreatIntelRepository.getModerationRecordDetail(
      req.supabase || null,
      recordId
    );

    res.status(200).json({
      data: detail,
    });
  } catch (err: any) {
    const isNotFound = err.message && err.message.includes('not found');
    res.status(isNotFound ? 404 : 500).json({
      error: {
        code: isNotFound ? 'RECORD_NOT_FOUND' : 'RECORD_FETCH_FAILED',
        message: err.message || 'Failed to fetch moderation record detail.',
        requestId: req.id,
      },
    });
  }
});

/**
 * PATCH /api/moderation/records/:id/scrubbing
 * Moderator edits scrubbed text to sanitize PII before public exposure.
 */
router.patch(
  '/records/:id/scrubbing',
  validateBody(EditScrubbingSchema),
  async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const recordId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const { newScrubbedText, reason } = req.body as z.infer<typeof EditScrubbingSchema>;
    const moderatorId = req.user!.id;

    try {
      const result = await ThreatIntelRepository.editScrubbing(req.supabase || null, {
        recordId,
        newScrubbedText,
        moderatorId,
        reason,
      });

      logger.info({ requestId: req.id, recordId, moderatorId }, 'Moderator edited scrubbed text');

      res.status(200).json({
        data: {
          id: result.id,
          scrubbedText: result.scrubbedText,
          message: 'Scrubbed text updated successfully.',
        },
      });
    } catch (err: any) {
      const isNotFound = err.message && err.message.includes('not found');
      res.status(isNotFound ? 404 : 500).json({
        error: {
          code: isNotFound ? 'RECORD_NOT_FOUND' : 'EDIT_SCRUBBING_FAILED',
          message: err.message || 'Failed to edit scrubbed text.',
          requestId: req.id,
        },
      });
    }
  }
);

/**
 * POST /api/moderation/records/:id/action
 * Executes moderation action (confirm, dismiss, dispute, retract) with mandatory reason.
 * BLOCKS confirming if any indicator domain is on domain_allowlist.
 */
router.post(
  '/records/:id/action',
  validateBody(ModerationActionSchema),
  async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const recordId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const { action, reason } = req.body as z.infer<typeof ModerationActionSchema>;
    const moderatorId = req.user!.id;

    try {
      const result = await ThreatIntelRepository.transitionModerationRecord(req.supabase || null, {
        recordId,
        action,
        reason,
        moderatorId,
      });

      logger.info(
        { requestId: req.id, recordId, moderatorId, action, status: result.status },
        'Moderator executed record transition'
      );

      res.status(200).json({
        data: {
          id: result.id,
          status: result.status,
          message: `Record successfully updated to ${result.status}.`,
        },
      });
    } catch (err: any) {
      if (err.code === 'ALLOWLISTED_DOMAIN_BLOCKED') {
        res.status(400).json({
          error: {
            code: 'ALLOWLISTED_DOMAIN_BLOCKED',
            message: err.message,
            requestId: req.id,
          },
        });
        return;
      }

      const isNotFound = err.message && err.message.includes('not found');
      res.status(isNotFound ? 404 : 500).json({
        error: {
          code: isNotFound ? 'RECORD_NOT_FOUND' : 'ACTION_FAILED',
          message: err.message || 'Failed to process moderation action.',
          requestId: req.id,
        },
      });
    }
  }
);

/**
 * GET /api/moderation/entities
 * Lists reported threat entities for human moderator triage and investigation.
 */
router.get('/entities', async (req: Request, res: Response) => {
  const status = req.query.status as ThreatEntityStatus | undefined;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  try {
    const result = await ThreatIntelRepository.listReportedEntities(
      req.supabase || null,
      { status, page, limit }
    );

    res.status(200).json({
      data: {
        items: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (err) {
    logger.error({ err }, 'Moderation entities fetch failed');
    res.status(500).json({
      error: {
        code: 'MODERATION_FETCH_FAILED',
        message: 'Failed to retrieve moderation entity queue.',
        requestId: req.id,
      },
    });
  }
});

/**
 * POST /api/moderation/entities/:id/transition
 * Transitions a reported threat entity across the intelligence lifecycle.
 * Elevating to 'confirmed' flags matching offers as CONFIRMED_SCAM.
 */
router.post(
  '/entities/:id/transition',
  validateBody(TransitionStatusSchema),
  async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const entityId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const { toStatus, notes } = req.body as z.infer<typeof TransitionStatusSchema>;
    const moderatorId = req.user!.id;

    try {
      const updated = await ThreatIntelRepository.transitionEntityStatus(
        req.supabase || null,
        {
          entityId,
          toStatus,
          notes,
          moderatorId,
        }
      );

      logger.info(
        {
          requestId: req.id,
          moderatorId,
          entityId,
          toStatus,
        },
        'Moderator transitioned reported entity status'
      );

      res.status(200).json({
        data: {
          entity: updated,
          message: `Threat indicator successfully transitioned to '${toStatus}'.`,
        },
      });
    } catch (err: any) {
      logger.error({ err }, 'Failed to transition reported entity');
      const statusCode = err?.message?.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: {
          code: 'TRANSITION_FAILED',
          message: err?.message || 'Failed to transition threat entity status.',
          requestId: req.id,
        },
      });
    }
  }
);

export const moderationRouter = router;

