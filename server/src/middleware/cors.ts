import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { getClientOrigins } from '../config/env.js';

export function corsMiddleware(): RequestHandler {
  const allowedOrigins = getClientOrigins().map((o) => o.replace(/\/+$/, ''));

  return cors((req, callback) => {
    const origin = req.headers.origin;

    // 1. Scoped exception: allow missing origin ONLY on specific server-to-server endpoints:
    // - /api/health (Render cloud platform health check & uptime monitors)
    // - /api/whatsapp/webhook (Meta WhatsApp Cloud API server-to-server webhook dispatches)
    // - or during unit test execution where Supertest does not synthesize an Origin header
    const isServerToServerRoute =
      req.path === '/api/health' ||
      req.path === '/health' ||
      req.path.startsWith('/api/whatsapp/webhook') ||
      process.env.NODE_ENV === 'test';

    if (!origin) {
      if (isServerToServerRoute) {
        return callback(null, { origin: true });
      }
      return callback(new Error('CORS blocked: Missing Origin header is not authorized'));
    }

    // 2. Reject string "null" (sandboxed/opaque origins)
    if (origin === 'null') {
      return callback(new Error("CORS blocked: Origin 'null' is not authorized"));
    }

    // 3. Strict allowlist matching against CLIENT_ORIGINS (exact match with trailing slashes normalized)
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        exposedHeaders: ['X-Request-Id'],
        credentials: true,
        maxAge: 86400, // 24 hours
      });
    }

    // 4. Any origin not explicitly listed in CLIENT_ORIGINS is rejected
    return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized`));
  });
}


