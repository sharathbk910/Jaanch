import { Router, type Request, type Response } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/history', authenticate, (req: Request, res: Response) => {
  // Unreachable until Phase 4 supplies the implementation
  res.status(200).json({
    data: {
      analyses: [],
    },
  });
});

export const historyRouter = router;
