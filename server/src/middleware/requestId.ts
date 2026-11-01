import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header('X-Request-Id');
  const reqId = incomingId && incomingId.trim().length > 0 ? incomingId.trim() : randomUUID();

  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}
