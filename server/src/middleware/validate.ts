import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { type ZodType } from 'zod';

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details,
          requestId: req.id,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details,
          requestId: req.id,
        },
      });
      return;
    }

    req.query = result.data as unknown as Request['query'];
    next();
  };
}

export function validateParams<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid path parameters',
          details,
          requestId: req.id,
        },
      });
      return;
    }

    req.params = result.data as unknown as Request['params'];
    next();
  };
}

