// User routes
// This file defines the HTTP routes for user profile management

import { Router } from 'express';
import UserController from './user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authMiddleware);

router.get('/me', UserController.getCurrentUser);
router.patch('/me', UserController.updateProfile);
router.get('/me/tasks', UserController.getMyTasks);
router.get('/me/notification-preferences', UserController.getNotificationPreferences);
router.patch('/me/notification-preferences', UserController.updateNotificationPreferences);

export default router;