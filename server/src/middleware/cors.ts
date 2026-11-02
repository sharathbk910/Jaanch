import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { getClientOrigins } from '../config/env.js';

export function corsMiddleware(): RequestHandler {
  const allowedOrigins = getClientOrigins();

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin server requests)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.includes(origin);
      if (isAllowed) {
        return callback(null, true);
      }

      // In non-production, allow localhost/127.0.0.1 on any port (e.g. 5173, 5174, 5175)
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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

