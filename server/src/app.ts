import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import { requestIdMiddleware } from './middleware/requestId.js';
import { securityMiddleware } from './middleware/security.js';
import { corsMiddleware } from './middleware/cors.js';
import { httpLogger } from './lib/logger.js';
import { globalRateLimiter, type RateLimitStoreProvider } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import { healthRouter } from './routes/health.js';
import { analyzeRouter } from './routes/analyze.js';
import { linksRouter } from './routes/links.js';
import { resourcesRouter } from './routes/resources.js';
import { feedbackRouter } from './routes/feedback.js';
import { stubsRouter } from './routes/stubs.js';
import { historyRouter } from './routes/history.js';
import { configRouter } from './routes/config.js';
import { reportsRouter } from './routes/reports.js';
import { moderationRouter } from './routes/moderation.js';
import challengeRouter from './routes/challenge.js';
import { whatsappRouter } from './routes/whatsapp.js';

export interface AppOptions {
  enableRateLimiting?: boolean;
  rateLimitStoreProvider?: RateLimitStoreProvider;
}

/**
 * Enforces strict application/json content-type for payload-carrying mutation requests.
 */
function strictJsonContentTypeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const mutationMethods = ['POST', 'PUT', 'PATCH'];
  const hasBody = req.headers['content-length'] && req.headers['content-length'] !== '0';

  if (mutationMethods.includes(req.method) && hasBody) {
    if (!req.is('application/json')) {
      res.status(415).json({
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Content-Type must be application/json for requests with a payload.',
          requestId: req.id,
        },
      });
      return;
    }
  }

  next();
}

export function createApp(options: AppOptions = {}): Application {
  const { enableRateLimiting = true, rateLimitStoreProvider } = options;
  const app = express();

  // Express trust proxy (required for reverse proxies on Render/Vercel/fly)
  app.set('trust proxy', 1);

  app.set('enableRateLimiting', enableRateLimiting);

  // 1. Response compression (threshold 1KB)
  app.use(compression({ threshold: 1024 }));

  // 2. Request ID tracking
  app.use(requestIdMiddleware);

  // 3. Strict Security Headers (Helmet with API CSP)
  app.use(securityMiddleware());

  // 4. CORS from CLIENT_ORIGINS only
  app.use(corsMiddleware());

  // 5. Pino HTTP logger with body and header redaction
  app.use(httpLogger);

  // 6. Strict Content-Type check for JSON payloads
  app.use(strictJsonContentTypeMiddleware);

  // 7. Body parser with strict 256 KB size limit
  app.use(express.json({ limit: '256kb' }));

  // 8. Global rate limiter (optional flag for testing scenarios)
  if (enableRateLimiting) {
    app.use('/api', globalRateLimiter(rateLimitStoreProvider));
  }

  // 8. API Routes
  app.use('/api', healthRouter);
  app.use('/api', analyzeRouter);
  app.use('/api', linksRouter);
  app.use('/api', resourcesRouter);
  app.use('/api', feedbackRouter);
  app.use('/api', stubsRouter);
  app.use('/api', reportsRouter);
  app.use('/api/moderation', moderationRouter);
  app.use('/api', historyRouter);
  app.use('/api', configRouter);
  app.use('/api', challengeRouter);
  app.use('/api/whatsapp', whatsappRouter);

  // 9. 404 Handler for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route '${req.method} ${req.path}' not found`,
        requestId: req.id,
      },
    });
  });

  // 10. Central Error Handler (zero stack leaks)
  app.use(errorHandler);

  return app;
}

