import type { Request, Response, NextFunction } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifySupabaseJwt, type AuthenticatedUser, AuthError } from '../lib/jwt.js';
import { createUserScopedSupabaseClient } from '../lib/supabase.js';
import { writeAuditLog } from '../lib/auditLog.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      supabase?: SupabaseClient;
      rawToken?: string;
    }
  }
}

export type { AuthenticatedUser };

/**
 * Extracts the Bearer token from the Authorization header.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Mandatory authentication middleware.
 * Validates Supabase JWT signature and expiration server-side.
 * Rejects forged, expired, or missing tokens with generic 401.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. No valid bearer token provided.',
        requestId: req.id,
      },
    });
    return;
  }

  try {
    const user = await verifySupabaseJwt(token);
    req.user = user;
    req.rawToken = token;
    req.supabase = createUserScopedSupabaseClient(token);
    next();
  } catch (err: unknown) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid, expired, or unverified authentication token.',
        requestId: req.id,
      },
    });
  }
}

/**
 * Optional authentication middleware.
 * Attaches user session if a valid token is present; guests continue unauthenticated.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const user = await verifySupabaseJwt(token);
    req.user = user;
    req.rawToken = token;
    req.supabase = createUserScopedSupabaseClient(token);
  } catch {
    // Guest fallback: token was invalid/expired, continue as unauthenticated guest
    req.user = undefined;
  }

  next();
}

/**
 * Role-guard middleware requiring specific role ('moderator').
 * Strictly denies regular users with 403 and records an audit log entry.
 */
export function requireRole(requiredRole: 'moderator') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          requestId: req.id,
        },
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      await writeAuditLog({
        actor_id: req.user.id,
        action: 'auth.role_denied',
        entity: 'role_guard',
        entity_id: requiredRole,
        meta: {
          attemptedRole: req.user.role,
          requiredRole,
        },
      });

      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions. Moderator role required.',
          requestId: req.id,
        },
      });
      return;
    }

    await writeAuditLog({
      actor_id: req.user.id,
      action: 'auth.role_accessed',
      entity: 'role_guard',
      entity_id: requiredRole,
      meta: {
        role: requiredRole,
      },
    });

    next();
  };
}
