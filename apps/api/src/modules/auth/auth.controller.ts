// Authentication controller
// This file handles HTTP requests and responses for authentication
// Routes call validation, then service methods, then return responses

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import AuthService from './auth.service';
import CookieUtils from '@/lib/cookie';
import {
  loginSchema,
  registerSchema,
  inviteSchema,
  inviteAcceptSchema,
} from './auth.validation';

export class AuthController {
  // POST /api/auth/register
  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);

    const result = await AuthService.register(validatedData);

    // Generate tokens
    const tokens = AuthService.generateTokens({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      created_at: new Date(result.user.created_at),
      updated_at: new Date(),
      deleted_at: null,
    });

    // Store refresh token
    await AuthService.storeRefreshToken(result.user.id, tokens.refreshToken);

    // Set auth cookies
    CookieUtils.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: result.user,
      },
    });
  });

  // POST /api/auth/login
  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);

    const result = await AuthService.login(validatedData);

    // Generate tokens
    const tokens = AuthService.generateTokens({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      created_at: new Date(result.user.created_at),
      updated_at: new Date(),
      deleted_at: null,
    });

    // Store refresh token
    await AuthService.storeRefreshToken(result.user.id, tokens.refreshToken);

    // Set auth cookies
    CookieUtils.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
      },
    });
  });

  // POST /api/auth/logout
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Clear auth cookies
    CookieUtils.clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  // POST /api/auth/refresh
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not provided',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    // Generate new tokens
    const tokens = AuthService.generateTokens({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      created_at: new Date(result.user.created_at),
      updated_at: new Date(),
      deleted_at: null,
    });

    // Store new refresh token
    await AuthService.storeRefreshToken(result.user.id, tokens.refreshToken);

    // Set new auth cookies
    CookieUtils.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: null,
    });
  });

  // POST /api/auth/invite
  static sendInvite = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = inviteSchema.parse(req.body);
    const inviterId = req.user!.id; // From auth middleware

    const result = await AuthService.sendInvite(validatedData, inviterId);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        inviteId: result.inviteId
      }
    });
  });

  // POST /api/auth/invite/:token/accept
  static acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const validatedData = inviteAcceptSchema.parse({
      ...req.body,
      token,
    });

    const result = await AuthService.acceptInvite(validatedData);

    // Generate tokens for the new user
    const tokens = AuthService.generateTokens({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      created_at: new Date(result.user.created_at),
      updated_at: new Date(),
      deleted_at: null,
    });

    // Store refresh token
    await AuthService.storeRefreshToken(result.user.id, tokens.refreshToken);

    // Set auth cookies
    CookieUtils.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account activated successfully',
      data: {
        user: result.user,
      },
    });
  });
}

export default AuthController;