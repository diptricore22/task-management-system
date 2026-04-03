// Authentication routes
// This file defines the HTTP routes and their handlers for authentication

import { Router } from 'express';
import AuthController from './auth.controller';
import { authMiddleware, requireAdmin } from '@/middlewares/auth.middleware';
import {
  loginRateLimit,
  registerRateLimit,
  refreshRateLimit,
  inviteRateLimit
} from '@/middlewares/rate-limit.middleware';

const router = Router();

// Public routes - no authentication required
router.post('/register', registerRateLimit, AuthController.register);
router.post('/login', loginRateLimit, AuthController.login);
router.post('/refresh', refreshRateLimit, AuthController.refreshToken);
router.post('/invite/:token/accept', AuthController.acceptInvite);

// Protected routes - require authentication
router.post('/logout', authMiddleware, AuthController.logout);

// Admin-only routes
router.post('/invite', authMiddleware, requireAdmin, inviteRateLimit, AuthController.sendInvite);

export default router;