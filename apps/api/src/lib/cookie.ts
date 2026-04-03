// Cookie utilities for secure JWT token storage
import { Response } from 'express';
import { config } from '@/config/env';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export class CookieUtils {
  // Default secure cookie options based on security spec
  private static getBaseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: config.app.isProduction, // HTTPS in production, HTTP in development
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Will be set per token type
    };
  }

  // Set access token cookie (15 minutes)
  static setAccessTokenCookie(res: Response, token: string): void {
    const options = {
      ...this.getBaseCookieOptions(),
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    };

    res.cookie('access_token', token, options);
  }

  // Set refresh token cookie (7 days)
  static setRefreshTokenCookie(res: Response, token: string): void {
    const options = {
      ...this.getBaseCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/api/auth', // Restrict refresh token path per security spec
    };

    res.cookie('refresh_token', token, options);
  }

  // Clear access token cookie
  static clearAccessTokenCookie(res: Response): void {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: config.app.isProduction,
      sameSite: 'strict',
      path: '/',
    });
  }

  // Clear refresh token cookie
  static clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: config.app.isProduction,
      sameSite: 'strict',
      path: '/api/auth',
    });
  }

  // Clear both authentication cookies
  static clearAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  // Set both authentication cookies
  static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }
}

export default CookieUtils;