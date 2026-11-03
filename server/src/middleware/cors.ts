import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { getClientOrigins } from '../config/env.js';

export function corsMiddleware(): RequestHandler {
  const configuredOrigins = getClientOrigins().map((o) => o.replace(/\/+$/, ''));

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin server requests)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // 1. Explicitly configured origins (with trailing slashes stripped)
      if (configuredOrigins.some((allowed) => allowed === normalizedOrigin)) {
        return callback(null, true);
      }

      // 2. Allow any official Jaanch Vercel deployment (production & preview subdomains)
      if (/^https:\/\/jaanch(-[a-z0-9-]+)?\.vercel\.app$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // 3. Always allow localhost & 127.0.0.1 on any port (for local dev & pairing)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 86400, // 24 hours
  };

  return cors(corsOptions);
}

