import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Request, type Response } from 'express';
import { PostgresRateLimitStore } from '../middleware/postgresRateLimitStore.js';
import { createRateLimiter, type RateLimitStoreProvider } from '../middleware/rateLimiter.js';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Persistent Postgres Rate Limiting', () => {
  // In-memory mock database state simulating Postgres rate_limits table & RPC
  let simulatedDb: Map<string, { hits: number; resetAt: Date; updatedAt: Date }>;

  function createMockSupabaseClient(): SupabaseClient {
    return {
      rpc: vi.fn(async (fnName: string, params: Record<string, unknown>) => {
        if (fnName === 'increment_rate_limit') {
          const key = params.p_key as string;
          const windowMs = Number(params.p_window_ms);
          const now = new Date();

          let entry = simulatedDb.get(key);
          if (!entry || entry.resetAt <= now) {
            entry = {
              hits: 1,
              resetAt: new Date(now.getTime() + windowMs),
              updatedAt: now,
            };
          } else {
            entry.hits += 1;
            entry.updatedAt = now;
          }
          simulatedDb.set(key, entry);

          return {
            data: [{ total_hits: entry.hits, reset_time: entry.resetAt.toISOString() }],
            error: null,
          };
        }

        if (fnName === 'decrement_rate_limit') {
          const key = params.p_key as string;
          const entry = simulatedDb.get(key);
          if (entry && entry.resetAt > new Date()) {
            entry.hits = Math.max(0, entry.hits - 1);
            entry.updatedAt = new Date();
          }
          return { data: null, error: null };
        }

        if (fnName === 'reset_rate_limit') {
          const key = params.p_key as string;
          simulatedDb.delete(key);
          return { data: null, error: null };
        }

        return { data: null, error: new Error(`Unknown RPC: ${fnName}`) };
      }),
      from: vi.fn((tableName: string) => {
        if (tableName === 'rate_limits') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn((_col: string, val: string) => {
              const entry = simulatedDb.get(val);
              return {
                maybeSingle: async () => ({
                  data: entry ? { hits: entry.hits, reset_at: entry.resetAt.toISOString() } : null,
                  error: null,
                }),
              };
            }),
            delete: vi.fn().mockReturnThis(),
            like: vi.fn(async (_col: string, pattern: string) => {
              const prefix = pattern.replace('%', '');
              for (const k of Array.from(simulatedDb.keys())) {
                if (k.startsWith(prefix)) simulatedDb.delete(k);
              }
              return { data: null, error: null };
            }),
          };
        }
        throw new Error(`Unexpected table: ${tableName}`);
      }),
    } as unknown as SupabaseClient;
  }

  beforeEach(() => {
    simulatedDb = new Map();
  });

  it('coordinates rate limits across two separate server instances sharing Postgres store', async () => {
    const mockSupabase = createMockSupabaseClient();
    const sharedProvider: RateLimitStoreProvider = {
      createStore: () => new PostgresRateLimitStore({ client: mockSupabase, prefix: 'test-shared:' }),
    };

    // Shared rate limiter configured with max 4 requests per minute
    const sharedLimiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: 4,
      message: 'Persistent limit exceeded across instances',
      code: 'PERSISTENT_RATE_LIMIT',
      storeProvider: sharedProvider,
    });

    // Create Instance A
    const appA = express();
    appA.use(express.json());
    appA.use('/api/resource', sharedLimiter, (_req: Request, res: Response) => {
      res.status(200).json({ instance: 'A', ok: true });
    });

    // Create Instance B
    const appB = express();
    appB.use(express.json());
    appB.use('/api/resource', sharedLimiter, (_req: Request, res: Response) => {
      res.status(200).json({ instance: 'B', ok: true });
    });

    // Request 1 to Instance A
    const resA1 = await request(appA).get('/api/resource');
    expect(resA1.status).toBe(200);
    expect(resA1.body.ok).toBe(true);

    // Request 2 to Instance B
    const resB1 = await request(appB).get('/api/resource');
    expect(resB1.status).toBe(200);
    expect(resB1.body.ok).toBe(true);

    // Request 3 to Instance A
    const resA2 = await request(appA).get('/api/resource');
    expect(resA2.status).toBe(200);
    expect(resA2.body.ok).toBe(true);

    // Request 4 to Instance B (this hits the max = 4)
    const resB2 = await request(appB).get('/api/resource');
    expect(resB2.status).toBe(200);
    expect(resB2.body.ok).toBe(true);

    // Request 5 to Instance A: MUST be blocked with 429 across instances
    const resA3 = await request(appA).get('/api/resource');
    expect(resA3.status).toBe(429);
    expect(resA3.body.error.code).toBe('PERSISTENT_RATE_LIMIT');
    expect(resA3.body.error.message).toBe('Persistent limit exceeded across instances');

    // Request 6 to Instance B: MUST also be blocked with 429 across instances
    const resB3 = await request(appB).get('/api/resource');
    expect(resB3.status).toBe(429);
    expect(resB3.body.error.code).toBe('PERSISTENT_RATE_LIMIT');
  });

  it('supports decrement and resetKey operations via Postgres store', async () => {
    const mockSupabase = createMockSupabaseClient();
    const store = new PostgresRateLimitStore({ client: mockSupabase, prefix: 'test-ops:' });
    store.init({ windowMs: 30000 } as any);

    const hit1 = await store.increment('client-1');
    expect(hit1.totalHits).toBe(1);

    const hit2 = await store.increment('client-1');
    expect(hit2.totalHits).toBe(2);

    // Decrement
    await store.decrement('client-1');
    const status = await store.get('client-1');
    expect(status?.totalHits).toBe(1);

    // Reset key
    await store.resetKey('client-1');
    const afterReset = await store.get('client-1');
    expect(afterReset).toBeUndefined();
  });
});
