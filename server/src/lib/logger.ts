import pino from 'pino';
import { pinoHttp } from 'pino-http';
import type { Request, Response } from 'express';

const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.body',
      'body',
      'text',
      'rawText',
      '*.password',
      '*.token',
      '*.secret',
      '*.key',
      '*.pepper',
    ],
    remove: true,
  },
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: !isTest,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

