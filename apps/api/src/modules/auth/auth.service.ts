// Authentication service
// This file contains the core business logic for authentication
// Including: JWT handling, password hashing, user registration, login, etc.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import JWTUtils from '@/lib/jwt';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  InviteRequest,
  InviteAcceptRequest,
  UpdateProfileRequest,
  User,
} from './auth.types';

export class AuthService {
  // User registration
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        deleted_at: null
      }
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        role: 'MEMBER', // Default role as per spec
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

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
        created_at: user.created_at.toISOString(),
      }
    };
  }

  // User login with account lockout protection
  static async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        deleted_at: null
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // TODO: Implement account lockout logic (5 failed attempts = 15 min lockout)
    // This would require adding fields to track failed attempts and lockout time

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
        created_at: user.created_at.toISOString(),
      }
    };
  }

  // Generate JWT tokens for user
  static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = JWTUtils.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Create refresh token with unique ID
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = JWTUtils.generateRefreshToken({
      sub: user.id,
      tokenId: refreshTokenId,
    });

    return { accessToken, refreshToken };
  }

  // Store refresh token in database
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = await JWTUtils.hashToken(refreshToken);
    const expiresAt = JWTUtils.getTokenExpiry('7d');

    await prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }
    });
  }

  // Token refresh with rotation
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    const payload = JWTUtils.verifyRefreshToken(refreshToken);

    // Find refresh token in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        user_id: payload.sub,
        deleted_at: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
          }
        }
      }
    });

    if (!storedToken || !storedToken.user) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Verify token hash
    const isTokenValid = await JWTUtils.verifyHashedToken(refreshToken, storedToken.token_hash);
    if (!isTokenValid) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Check if token is expired
    if (JWTUtils.isTokenExpired(storedToken.expires_at)) {
      // Clean up expired token
      await this.invalidateRefreshToken(storedToken.id);
      throw new AppError('Refresh token has expired', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Check if user is still active
    if (storedToken.user.deleted_at) {
      throw new AppError('User account is inactive', 401, 'USER_NOT_FOUND');
    }

    // Rotate refresh token (invalidate old, create new)
    await this.invalidateRefreshToken(storedToken.id);

    return {
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
        created_at: storedToken.user.created_at.toISOString(),
      }
    };
  }

  // User logout - invalidate refresh token
  static async logout(refreshToken: string): Promise<void> {
    try {
      const payload = JWTUtils.verifyRefreshToken(refreshToken);

      // Find and invalidate the refresh token
      await prisma.refreshToken.updateMany({
        where: {
          user_id: payload.sub,
          deleted_at: null
        },
        data: {
          deleted_at: new Date()
        }
      });
    } catch (error) {
      // Even if token verification fails, we just continue
      // to allow logout to complete
    }
  }

  // Invalidate specific refresh token
  static async invalidateRefreshToken(tokenId: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id: tokenId },
      data: { deleted_at: new Date() }
    });
  }

  // Send invitation
  static async sendInvite(data: InviteRequest, inviterId: string): Promise<{ inviteId: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        deleted_at: null
      }
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409, 'USER_EXISTS');
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.inviteToken.findFirst({
      where: {
        email: data.email.toLowerCase(),
        accepted_at: null,
        deleted_at: null,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (existingInvite) {
      throw new AppError('An invitation has already been sent to this email', 409, 'INVITE_EXISTS');
    }

    // Generate invitation token
    const inviteToken = JWTUtils.generateInviteToken();
    const tokenHash = await JWTUtils.hashToken(inviteToken);
    const expiresAt = JWTUtils.getTokenExpiry('72h');

    // Store invitation in database
    const invite = await prisma.inviteToken.create({
      data: {
        email: data.email.toLowerCase(),
        role: data.role,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }
    });

    // TODO: Send email with invite link
    // In a real implementation, you would send an email with:
    // `${config.app.frontendUrl}/invite/${inviteToken}`

    return { inviteId: invite.id };
  }

  // Accept invitation
  static async acceptInvite(data: InviteAcceptRequest): Promise<AuthResponse> {
    // Find and verify invitation
    const invitation = await prisma.inviteToken.findFirst({
      where: {
        accepted_at: null,
        deleted_at: null,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (!invitation) {
      throw new AppError('Invalid or expired invitation token', 410, 'INVITE_EXPIRED');
    }

    // Verify token hash
    const isTokenValid = await JWTUtils.verifyHashedToken(data.token, invitation.token_hash);
    if (!isTokenValid) {
      throw new AppError('Invalid invitation token', 404, 'INVITE_NOT_FOUND');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: invitation.email,
        deleted_at: null
      }
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user and mark invitation as accepted
    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: data.name.trim(),
          email: invitation.email,
          password_hash: passwordHash,
          role: invitation.role,
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
      }),
      prisma.inviteToken.update({
        where: { id: invitation.id },
        data: { accepted_at: new Date() }
      })
    ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
        created_at: user.created_at.toISOString(),
      }
    };
  }

  // Get user by ID (for profile endpoints)
  static async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
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

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  // Update user profile
  static async updateUserProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    // Check if email is being changed and is already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: userId },
          deleted_at: null
        }
      });

      if (existingUser) {
        throw new AppError('Email already taken', 409, 'EMAIL_EXISTS');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase() }),
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

    return updatedUser;
  }

  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  // Password verification
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default AuthService;