import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { config } from '@/config/env';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Convert operational errors to AppError
function normalizeError(err: any): AppError {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return new AppError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    if (err instanceof TokenExpiredError) {
      return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
    }
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return new AppError(`Duplicate ${field} value`, 409, 'DUPLICATE_ENTRY');
  }

  // Prisma errors (will be relevant when Prisma is set up)
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        return new AppError('Duplicate entry', 409, 'DUPLICATE_ENTRY');
      case 'P2025':
        return new AppError('Record not found', 404, 'NOT_FOUND');
      default:
        return new AppError('Database error', 500, 'DATABASE_ERROR');
    }
  }

  // Already an AppError
  if (err instanceof AppError) {
    return err;
  }

  // Generic errors
  if (err.statusCode || err.status) {
    return new AppError(
      err.message || 'An error occurred',
      err.statusCode || err.status,
      err.code || 'GENERIC_ERROR'
    );
  }

  // Unknown errors
  return new AppError(
    config.app.isProduction ? 'Internal server error' : err.message,
    500,
    'INTERNAL_ERROR',
    false
  );
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = normalizeError(err);

  // Log the error
  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(`Error: ${error.message}`, {
      error: error,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    logger.warn(`Operational error: ${error.message}`, {
      code: error.code,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send error response
  const response = {
    success: false,
    error: error.message,
    code: error.code,
  };

  // Add stack trace in development
  if (config.app.isDevelopment && error.stack) {
    (response as any).stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}

// Async error handler wrapper
export function asyncHandler<T extends Request, K extends Response>(
  fn: (req: T, res: K, next: NextFunction) => Promise<any>
) {
  return (req: T, res: K, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
}

export default errorHandler;