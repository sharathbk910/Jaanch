import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { logger } from '../lib/logger.js';

const router = Router();

const FeedbackSchema = z.object({
  analysisId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comments: z.string().max(1000).optional(),
});

const PageFeedbackSchema = z.object({
  page: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().max(1000).optional(),
});

router.post(
  '/feedback',
  validateBody(FeedbackSchema),
  (req: Request, res: Response) => {
    logger.info({
      msg: 'Feedback received',
      requestId: req.id,
      path: '/api/feedback',
      statusCode: 200,
    });

    res.status(200).json({
      status: 'received',
      message: 'Thank you for your feedback.',
    });
  }
);

router.post(
  '/feedback/page',
  validateBody(PageFeedbackSchema),
  (req: Request, res: Response) => {
    logger.info({
      msg: 'Page feedback received',
      requestId: req.id,
      path: '/api/feedback/page',
      statusCode: 200,
    });

    res.status(200).json({
      status: 'received',
    });
  }
);

export const feedbackRouter = router;

