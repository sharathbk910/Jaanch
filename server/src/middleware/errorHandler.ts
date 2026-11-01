import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { SafeFetchError } from '../lib/safeFetch.js';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.id;
  const statusCode = err.status || err.statusCode || 500;

  // Handle JSON parsing syntax error from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn({
      msg: 'Malformed JSON in request body',
      requestId,
      statusCode: 400,
      errorCode: 'INVALID_JSON',
    });

    res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
        requestId,
      },
    });
    return;
  }

  // Handle body size limit (256 KB)
  if (err.type === 'entity.too.large' || statusCode === 413) {
    logger.warn({
      msg: 'Request payload exceeded size limit',
      requestId,
      statusCode: 413,
      errorCode: 'PAYLOAD_TOO_LARGE',
    });

    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeded maximum size limit of 256KB',
        requestId,
      },
    });
    return;
  }

  // Handle CORS blockage
  if (err.message && err.message.startsWith('CORS blocked')) {
    logger.warn({
      msg: 'CORS rejection',
      requestId,
      statusCode: 403,
      errorCode: 'CORS_FORBIDDEN',
    });

    res.status(403).json({
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Cross-Origin Request Blocked: Origin is not permitted.',
        requestId,
      },
    });
    return;
  }

  // Handle SSRF / SafeFetch errors
  if (err instanceof SafeFetchError) {
    logger.warn({
      msg: `SafeFetch error: ${err.message}`,
      requestId,
      statusCode: 400,
      errorCode: err.code,
    });

    res.status(400).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
    return;
  }

  // Central fallback for unhandled 500 errors (zero stack leaks)
  logger.error({
    msg: `Internal server error: ${err.message}`,
    requestId,
    statusCode: 500,
    errorCode: 'INTERNAL_SERVER_ERROR',
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      requestId,
    },
  });
}
