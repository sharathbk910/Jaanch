import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import { requestIdMiddleware } from './middleware/requestId.js';
import { securityMiddleware } from './middleware/security.js';
import { corsMiddleware } from './middleware/cors.js';
import { httpLogger } from './lib/logger.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import { healthRouter } from './routes/health.js';
import { analyzeRouter } from './routes/analyze.js';
import { linksRouter } from './routes/links.js';
import { resourcesRouter } from './routes/resources.js';
import { feedbackRouter } from './routes/feedback.js';
import { stubsRouter } from './routes/stubs.js';
import { historyRouter } from './routes/history.js';

export interface AppOptions {
  enableRateLimiting?: boolean;
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
  const { enableRateLimiting = true } = options;
  const app = express();

  // 1. Request ID tracking
  app.use(requestIdMiddleware);

  // 2. Strict Security Headers (Helmet with API CSP)
  app.use(securityMiddleware());

  // 3. CORS from CLIENT_ORIGINS only
  app.use(corsMiddleware());

  // 4. Pino HTTP logger with body and header redaction
  app.use(httpLogger);

  // 5. Strict Content-Type check for JSON payloads
  app.use(strictJsonContentTypeMiddleware);

  // 6. Body parser with strict 256 KB size limit
  app.use(express.json({ limit: '256kb' }));

  // 7. Global rate limiter (optional flag for testing scenarios)
  if (enableRateLimiting) {
    app.use('/api', globalRateLimiter());
  }

  // 8. API Routes
  app.use('/api', healthRouter);
  app.use('/api', analyzeRouter);
  app.use('/api', linksRouter);
  app.use('/api', resourcesRouter);
  app.use('/api', feedbackRouter);
  app.use('/api', stubsRouter);
  app.use('/api', historyRouter);

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
