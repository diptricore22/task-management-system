// Authentication middleware for JWT token verification
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/middlewares/error.middleware';
import JWTUtils from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import type { JWTPayload, User } from '@/modules/auth/auth.types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenPayload?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  // Verify JWT access token from cookie
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.access_token;

      if (!token) {
        throw new AppError('Access token not provided', 401, 'UNAUTHORIZED');
      }

      // Verify the JWT token
      const payload = JWTUtils.verifyAccessToken(token);

      // Get user from database (excluding password_hash)
      const user = await prisma.user.findFirst({
        where: {
          id: payload.sub,
          deleted_at: null // Only active users
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        }
      });

      if (!user) {
        throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
      }

      // Attach user to request
      req.user = user;
      req.tokenPayload = payload;

      next();
    } catch (error) {
      next(error); // Let error middleware handle JWT and other errors
    }
  }

  // Require specific role(s)
  static requireRole(...allowedRoles: ('ADMIN' | 'MEMBER' | 'VIEWER')[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
      }

      const userRole = req.user.role as 'ADMIN' | 'MEMBER' | 'VIEWER';

      if (!allowedRoles.includes(userRole)) {
        return next(new AppError(
          'Insufficient permissions for this action',
          403,
          'INSUFFICIENT_PERMISSIONS'
        ));
      }

      next();
    };
  }

  // Admin only middleware
  static requireAdmin = AuthMiddleware.requireRole('ADMIN');

  // Member or Admin (excludes Viewer)
  static requireMemberOrAdmin = AuthMiddleware.requireRole('ADMIN', 'MEMBER');

  // Optional authentication (doesn't fail if no token)
  static optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.access_token;

      if (token) {
        const payload = JWTUtils.verifyAccessToken(token);

        const user = await prisma.user.findFirst({
          where: {
            id: payload.sub,
            deleted_at: null
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
          }
        });

        if (user) {
          req.user = user;
          req.tokenPayload = payload;
        }
      }

      next();
    } catch (error) {
      // For optional auth, just continue without user if token is invalid
      next();
    }
  };
}

// Export individual middleware functions for convenience
export const authMiddleware = AuthMiddleware.verifyToken;
export const requireRole = AuthMiddleware.requireRole;
export const requireAdmin = AuthMiddleware.requireAdmin;
export const requireMemberOrAdmin = AuthMiddleware.requireMemberOrAdmin;
export const optionalAuth = AuthMiddleware.optionalAuth;

export default AuthMiddleware;