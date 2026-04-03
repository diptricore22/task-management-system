/**
 * Notifications Module - Route Definitions
 * HTTP routes for notification endpoints
 */

import { Router } from 'express';
import NotificationsController from './notifications.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// Notification endpoints
router.get('/', NotificationsController.list);
router.patch('/read-all', NotificationsController.markAllAsRead);
router.patch('/:id/read', NotificationsController.markAsRead);

export default router;
