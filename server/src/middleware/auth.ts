import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware interface.
 * Returns 401 until Phase 4 wires real Supabase JWT verification.
 */
export function authenticate(req: Request, res: Response, _next: NextFunction): void {
  // Phase 4 will verify JWT from req.headers.authorization via Supabase
  res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. User session verification is not yet implemented.',
      requestId: req.id,
    },
  });
}
