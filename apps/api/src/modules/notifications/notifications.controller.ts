/**
 * Notifications Module - Controller
 * HTTP request handlers for notifications
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { NotificationsService } from './notifications.service';
import { markAsReadSchema, listNotificationsQuerySchema } from './notifications.validation';

export class NotificationsController {
  /**
   * GET /api/notifications
   * List notifications for current user with pagination
   */
  static list = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = listNotificationsQuerySchema.parse(req.query);
    const page = validatedQuery.page ? parseInt(validatedQuery.page as unknown as string) : 1;
    const limit = validatedQuery.limit ? parseInt(validatedQuery.limit as unknown as string) : 20;

    const result = await NotificationsService.list(req.user!.id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    markAsReadSchema.parse(req.body);

    await NotificationsService.markAsRead(req.params.id, req.user!.id);

    // Get updated notification
    const notification = await NotificationsService.getById(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification,
      },
    });
  });

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for current user
   */
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await NotificationsService.markAllAsRead(req.user!.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  });
}

export default NotificationsController;
