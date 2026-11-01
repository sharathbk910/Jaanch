import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { historyRateLimiter } from '../middleware/rateLimiter.js';
import { HistoryRepository } from '../lib/historyRepository.js';
import { writeAuditLog } from '../lib/auditLog.js';

const router = Router();

const HistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  domain: z.string().trim().max(50).optional(),
});

const UuidParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * GET /api/history
 * Paginated retrieval of the authenticated user's own submissions only.
 * RLS enforced at DB and application boundaries.
 */
router.get('/history', requireAuth, historyRateLimiter(), async (req: Request, res: Response) => {
  const parseResult = HistoryQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid pagination or filter parameters.',
        details: parseResult.error.flatten().fieldErrors,
        requestId: req.id,
      },
    });
    return;
  }

  const { page, limit, domain } = parseResult.data;
  const user = req.user!;

  const { items, total } = await HistoryRepository.getHistory(
    req.supabase || null,
    user.id,
    { page, limit, domain }
  );

  res.status(200).json({
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/**
 * DELETE /api/history/:id
 * Deletes a specific submission owned strictly by the authenticated user.
 * Audit-logs the deletion without message content.
 */
router.delete('/history/:id', requireAuth, historyRateLimiter(), async (req: Request, res: Response) => {
  const parseResult = UuidParamSchema.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Submission ID must be a valid UUID.',
        requestId: req.id,
      },
    });
    return;
  }

  const { id } = parseResult.data;
  const user = req.user!;

  const deleted = await HistoryRepository.deleteSubmission(
    req.supabase || null,
    user.id,
    id
  );

  if (!deleted) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'History entry not found or unauthorized to delete.',
        requestId: req.id,
      },
    });
    return;
  }

  await writeAuditLog({
    actor_id: user.id,
    action: 'history.delete',
    entity: 'submission',
    entity_id: id,
    meta: {
      submissionId: id,
    },
  });

  res.status(200).json({
    data: {
      success: true,
      deletedId: id,
    },
  });
});

/**
 * DELETE /api/account/data
 * Privacy erasure: deletes all submissions, results, and personal history for the authenticated user.
 */
router.delete('/account/data', requireAuth, historyRateLimiter(), async (req: Request, res: Response) => {
  const user = req.user!;

  const { deletedCount } = await HistoryRepository.eraseAccountData(
    req.supabase || null,
    user.id
  );

  await writeAuditLog({
    actor_id: user.id,
    action: 'account.data_erasure',
    entity: 'account',
    entity_id: user.id,
    meta: {
      deletedCount,
    },
  });

  res.status(200).json({
    data: {
      success: true,
      deletedCount,
      message: 'All user data and history successfully erased.',
    },
  });
});

/**
 * GET /api/history/moderator/audit-check
 * Protected route requiring moderator role. Tests role verification and audit log generation.
 */
router.get(
  '/history/moderator/audit-check',
  requireAuth,
  requireRole('moderator'),
  async (req: Request, res: Response) => {
    res.status(200).json({
      data: {
        status: 'authorized',
        moderatorId: req.user!.id,
      },
    });
  }
);

export const historyRouter = router;
