// Rate limiting middleware for authentication endpoints
import rateLimit from 'express-rate-limit';
import { config } from '@/config/env';

// Login rate limiting - stricter as per security spec
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes per IP
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to include IP + email for more targeted limiting
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  // Skip successful requests from counting against limit
  skipSuccessfulRequests: true,
});

// Registration rate limiting
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: {
    success: false,
    error: 'Too many registration attempts from this IP, please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Token refresh rate limiting
export const refreshRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 refresh attempts per 5 minutes per IP
  message: {
    success: false,
    error: 'Too many token refresh attempts, please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Invitation rate limiting (admin only, but still limited)
export const inviteRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 invites per hour per IP
  message: {
    success: false,
    error: 'Too many invitation attempts, please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for authenticated requests
  keyGenerator: (req) => {
    const userId = req.user?.id || req.ip;
    return `invite-${userId}`;
  },
});

// General API rate limiting (applied globally)
export const generalApiRateLimit = rateLimit({
  windowMs: config.security.rateLimit.windowMs, // 15 minutes (from env)
  max: config.security.rateLimit.max, // 100 requests per 15 minutes per IP (from env)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health',
});

// Conditional rate limiting - only in production
export const createConditionalRateLimit = (rateLimitMiddleware: any) => {
  return (req: any, res: any, next: any) => {
    if (config.app.isProduction) {
      return rateLimitMiddleware(req, res, next);
    }
    next(); // Skip rate limiting in development/test
  };
};

export default {
  loginRateLimit,
  registerRateLimit,
  refreshRateLimit,
  inviteRateLimit,
  generalApiRateLimit,
  createConditionalRateLimit,
};