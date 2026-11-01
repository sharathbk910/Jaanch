import type { Store, Options, IncrementResponse, ClientRateLimitInfo } from 'express-rate-limit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceRoleClient } from '../lib/supabase.js';

export interface PostgresRateLimitStoreOptions {
  client?: SupabaseClient;
  prefix?: string;
}

/**
 * Persistent rate limit store backed by Postgres via atomic RPC function.
 * Ensures strict synchronization across multiple server instances.
 */
export class PostgresRateLimitStore implements Store {
  private windowMs: number = 60 * 1000;
  private client: SupabaseClient | null = null;
  prefix: string;

  constructor(options?: PostgresRateLimitStoreOptions) {
    if (options?.client) {
      this.client = options.client;
    }
    this.prefix = options?.prefix ?? 'rl:';
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private getSupabase(): SupabaseClient {
    if (!this.client) {
      this.client = getServiceRoleClient();
    }
    return this.client;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const supabase = this.getSupabase();
    const fullKey = `${this.prefix}${key}`;

    const { data, error } = await supabase
      .from('rate_limits')
      .select('hits, reset_at')
      .eq('key', fullKey)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return {
      totalHits: Number(data.hits),
      resetTime: new Date(data.reset_at),
    };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const supabase = this.getSupabase();
    const fullKey = `${this.prefix}${key}`;

    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: fullKey,
      p_window_ms: this.windowMs,
    });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    const totalHits = Number(row?.total_hits ?? 1);
    const resetTime = row?.reset_time ? new Date(row.reset_time) : new Date(Date.now() + this.windowMs);

    return {
      totalHits,
      resetTime,
    };
  }

  async decrement(key: string): Promise<void> {
    const supabase = this.getSupabase();
    const fullKey = `${this.prefix}${key}`;
    await supabase.rpc('decrement_rate_limit', { p_key: fullKey });
  }

  async resetKey(key: string): Promise<void> {
    const supabase = this.getSupabase();
    const fullKey = `${this.prefix}${key}`;
    await supabase.rpc('reset_rate_limit', { p_key: fullKey });
  }

  async resetAll(): Promise<void> {
    const supabase = this.getSupabase();
    await supabase.from('rate_limits').delete().like('key', `${this.prefix}%`);
  }
}
