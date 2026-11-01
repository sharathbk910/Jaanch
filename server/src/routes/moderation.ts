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
    const { id } = req.params;
    const { toStatus, notes } = req.body as z.infer<typeof TransitionStatusSchema>;
    const moderatorId = req.user!.id;

    try {
      const updated = await ThreatIntelRepository.transitionEntityStatus(
        req.supabase || null,
        {
          entityId: id,
          toStatus,
          notes,
          moderatorId,
        }
      );

      logger.info(
        {
          requestId: req.id,
          moderatorId,
          entityId: id,
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

