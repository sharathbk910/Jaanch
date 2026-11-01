import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env.js';

let publicClient: SupabaseClient | null = null;

/**
 * Returns public/anon Supabase client for unauthenticated operations (e.g. public registry read).
 */
export function getPublicSupabaseClient(): SupabaseClient {
  if (publicClient) return publicClient;

  const env = loadEnv();
  publicClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return publicClient;
}

/**
 * Creates a per-request user-scoped Supabase client using the caller's JWT.
 * Authoritative Rule D11: Never use the service-role key in runtime request handling.
 * RLS is enforced at the database level using auth.uid() from the provided JWT.
 */
export function createUserScopedSupabaseClient(token: string): SupabaseClient {
  const env = loadEnv();

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
