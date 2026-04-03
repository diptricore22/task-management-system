// JWT utilities for token generation and verification
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@/config/env';
import type { JWTPayload, RefreshTokenPayload } from '@/modules/auth/auth.types';

export class JWTUtils {
  // Generate access token (15 minutes)
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiration as any,
      algorithm: 'HS256',
    } as any);
  }

  // Generate refresh token (7 days)
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshTokenExpiration as any,
      algorithm: 'HS256',
    } as any);
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256']
      }) as JWTPayload;
    } catch (error) {
      throw error;
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        algorithms: ['HS256']
      }) as RefreshTokenPayload;
    } catch (error) {
      throw error;
    }
  }

  // Generate secure random token for invitations
  static generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash token for database storage
  static async hashToken(token: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(token, config.security.bcryptRounds);
  }

  // Verify hashed token
  static async verifyHashedToken(token: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(token, hash);
  }

  // Extract token from Authorization header
  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Get token expiry date for database storage
  static getTokenExpiry(expiresIn: string): Date {
    const now = new Date();
    switch (expiresIn) {
      case '15m':
        return new Date(now.getTime() + 15 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '72h':
        return new Date(now.getTime() + 72 * 60 * 60 * 1000);
      default:
        throw new Error(`Unsupported expiry format: ${expiresIn}`);
    }
  }

  // Check if token is expired
  static isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}

export default JWTUtils;
