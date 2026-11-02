import * as jose from 'jose';
import { loadEnv } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'user' | 'moderator';
}

export class AuthError extends Error {
  constructor(message: string, public readonly code: 'EXPIRED_TOKEN' | 'INVALID_SIGNATURE' | 'MALFORMED_TOKEN' | 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
  }
}

const DEFAULT_TEST_SECRET = 'test-supabase-jwt-secret-at-least-32-chars-long!!';

export function getJwtSecret(): string {
  const env = loadEnv();
  return env.SUPABASE_JWT_SECRET || DEFAULT_TEST_SECRET;
}

/**
 * Validates a Supabase JWT token server-side checking signature and expiration.
 * Generic auth errors prevent leaking internal token structures or user existence.
 */
export async function verifySupabaseJwt(token: string): Promise<AuthenticatedUser> {
  if (!token || typeof token !== 'string') {
    throw new AuthError('Authentication token is required', 'UNAUTHORIZED');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new AuthError('Invalid authentication token format', 'MALFORMED_TOKEN');
  }

  const secret = getJwtSecret();
  const secretKey = new TextEncoder().encode(secret);

  try {
    const { payload } = await jose.jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    const id = (payload.sub || payload.id) as string;
    if (!id) {
      throw new AuthError('Token subject identifier missing', 'MALFORMED_TOKEN');
    }

    const email = (payload.email || (payload.user_metadata as Record<string, unknown>)?.email) as string | undefined;

    // Role can come from app_metadata or user_metadata or root claim
    const appMeta = payload.app_metadata as Record<string, unknown> | undefined;
    const userMeta = payload.user_metadata as Record<string, unknown> | undefined;
    const rawRole = (appMeta?.role || userMeta?.role || payload.role || 'user') as string;
    const role: 'user' | 'moderator' = rawRole === 'moderator' ? 'moderator' : 'user';

    return {
      id,
      email,
      role,
    };
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }

    // In development / production, if local signature verification failed (e.g. SUPABASE_JWT_SECRET not set),
    // fall back to verifying the token against the Supabase Auth API directly.
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { getPublicSupabaseClient } = await import('./supabase.js');
        const supabase = getPublicSupabaseClient();
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const u = data.user;
          const rawRole = (u.app_metadata?.role || u.user_metadata?.role || 'user') as string;
          return {
            id: u.id,
            email: u.email,
            role: rawRole === 'moderator' ? 'moderator' : 'user',
          };
        }
      } catch {
        // Fallback failed, proceed to error classification
      }
    }

    if (err && typeof err === 'object' && 'code' in err) {
      const joseErr = err as { code: string; message: string };
      if (joseErr.code === 'ERR_JWT_EXPIRED') {
        throw new AuthError('Authentication token has expired', 'EXPIRED_TOKEN');
      }
      if (joseErr.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || joseErr.code === 'ERR_JWS_INVALID') {
        throw new AuthError('Authentication token signature verification failed', 'INVALID_SIGNATURE');
      }
    }

    throw new AuthError('Invalid or unverified authentication token', 'UNAUTHORIZED');
  }
}

/**
 * Helper to generate valid or expired JWTs for test suites and token verification tests.
 */
export async function createTestJwt(
  user: { id: string; email?: string; role?: 'user' | 'moderator' },
  options: { secret?: string; expiresIn?: string; expired?: boolean } = {}
): Promise<string> {
  const secret = options.secret || getJwtSecret();
  const secretKey = new TextEncoder().encode(secret);

  const role = user.role || 'user';
  const builder = new jose.SignJWT({
    sub: user.id,
    email: user.email,
    role,
    app_metadata: { role },
    user_metadata: { role, email: user.email },
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(options.expired ? Math.floor(Date.now() / 1000) - 3600 : undefined);

  if (options.expired) {
    builder.setExpirationTime(Math.floor(Date.now() / 1000) - 1800);
  } else {
    builder.setExpirationTime(options.expiresIn || '1h');
  }

  return builder.sign(secretKey);
}

