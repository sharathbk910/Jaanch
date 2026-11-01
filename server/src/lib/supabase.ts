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
 * Returns service-role Supabase client for server-only administrative tasks (e.g. audit_logs insertion).
 * Security Requirement: service-role key server-only. Never expose to client or use for user data queries.
 */
export function getServiceRoleClient(): SupabaseClient {
  const env = loadEnv();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  return createClient(env.SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
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
