import rateLimit, { type RateLimitRequestHandler, type Store, type LegacyStore, MemoryStore } from 'express-rate-limit';
import type { Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env.js';
import { PostgresRateLimitStore } from './postgresRateLimitStore.js';

/**
 * Storage interface abstraction for rate limiting.
 * Defaults to in-memory store; persistent Postgres store available for multi-instance scaling.
 */
export interface RateLimitStoreProvider {
  createStore(): Store | LegacyStore;
}

export const defaultStoreProvider: RateLimitStoreProvider = {
  createStore: () => new MemoryStore(),
};

export class PostgresRateLimitStoreProvider implements RateLimitStoreProvider {
  constructor(private readonly client?: SupabaseClient, private readonly prefix?: string) {}

  createStore(): Store {
    return new PostgresRateLimitStore({ client: this.client, prefix: this.prefix });
  }
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
  storeProvider?: RateLimitStoreProvider;
}): RateLimitRequestHandler {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again later.',
    code = 'RATE_LIMIT_EXCEEDED',
    storeProvider = defaultStoreProvider,
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req: Request) => req.app?.get('enableRateLimiting') === false,
    store: storeProvider.createStore(),
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: {
          code,
          message,
          requestId: req.id,
        },
      });
    },
  });
}

export function globalRateLimiter(storeProvider?: RateLimitStoreProvider): RateLimitRequestHandler {
  const env = loadEnv();
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: env.RATE_LIMIT_GLOBAL_PER_15MIN,
    message: 'Global rate limit exceeded. Please try again later.',
    storeProvider,
  });
}

export function analyzeRateLimiter(): RateLimitRequestHandler {
  const env = loadEnv();
  return createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: env.RATE_LIMIT_ANALYZE_GUEST_PER_HOUR,
    message: 'Hourly analysis limit reached. Please wait before submitting more offers.',
    code: 'ANALYZE_RATE_LIMIT_EXCEEDED',
  });
}

export function linkCheckRateLimiter(): RateLimitRequestHandler {
  const env = loadEnv();
  return createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: env.RATE_LIMIT_LINK_PER_HOUR,
    message: 'Hourly link verification limit reached. Please try again later.',
    code: 'LINK_RATE_LIMIT_EXCEEDED',
  });
}

export function historyRateLimiter(): RateLimitRequestHandler {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many history requests. Please try again later.',
    code: 'HISTORY_RATE_LIMIT_EXCEEDED',
  });
}
