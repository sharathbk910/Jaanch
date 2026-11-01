import rateLimit, { type RateLimitRequestHandler, MemoryStore } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { loadEnv } from '../config/env.js';

/**
 * Storage interface abstraction for rate limiting.
 * Defaults to in-memory store; swappable to Redis in Phase 11.
 */
export interface RateLimitStoreProvider {
  createStore(): InstanceType<typeof MemoryStore>;
}

export const defaultStoreProvider: RateLimitStoreProvider = {
  createStore: () => new MemoryStore(),
};

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

export function globalRateLimiter(): RateLimitRequestHandler {
  const env = loadEnv();
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: env.RATE_LIMIT_GLOBAL_PER_15MIN,
    message: 'Global rate limit exceeded. Please try again later.',
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
