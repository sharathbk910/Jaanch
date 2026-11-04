import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { getClientOrigins } from '../config/env.js';

export function corsMiddleware(): RequestHandler {
  const configuredOrigins = getClientOrigins().map((o) => o.replace(/\/+$/, ''));

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // 1. Allow requests with no origin or string "null" (mobile apps, curl, server-to-server, webviews)
      if (!origin || origin === 'null') {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // 2. Explicitly configured origins (from CLIENT_ORIGINS env) or wildcard
      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.some((allowed) => allowed === normalizedOrigin)
      ) {
        return callback(null, true);
      }

      // 3. Allow ANY Vercel deployment (jaanch-mu.vercel.app, www.jaanch-mu.vercel.app, preview branches)
      if (/^https:\/\/([a-z0-9.-]+\.)?vercel\.app$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // 4. Always allow localhost, 127.0.0.1, and [::1] on ANY port (for local dev & pairing)
      if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // 5. Allow private LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) on ANY port (for mobile/device testing)
      if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // 6. Allow Render deployment domains (onrender.com)
      if (/^https:\/\/([a-z0-9.-]+\.)?onrender\.com$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // 7. Allow hybrid mobile/desktop app protocols (Capacitor, Tauri, Chrome extensions)
      if (/^(capacitor|ionic|tauri|chrome-extension):\/\//i.test(normalizedOrigin)) {
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

