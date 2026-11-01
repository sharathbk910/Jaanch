import { Router, type Request, type Response } from 'express';
import { OFFICIAL_PORTALS, HELPLINE } from '@jaanch/shared';

const router = Router();

router.get('/resources', (_req: Request, res: Response) => {
  res.status(200).json({
    data: {
      officialPortals: OFFICIAL_PORTALS,
      helplines: HELPLINE,
    },
  });
});

export const resourcesRouter = router;

