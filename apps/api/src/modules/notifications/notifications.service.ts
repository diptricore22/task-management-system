/**
 * Notifications Module - Service Layer
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  NotificationResponse,
  PaginatedNotificationResponse,
  NotificationPayload,
} from './notifications.types';

export class NotificationsService {
  /**
   * Create a notification
   */
  static async create(
    userId: string,
    type: string,
    payload: NotificationPayload,
    taskId?: string
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        user_id: userId,
        task_id: taskId || null,
        type,
        payload: payload as any,
      },
    });
  }

  /**
   * List notifications for a user with pagination
   * Unread notifications appear first
   */
  static async list(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedNotificationResponse> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          user_id: userId,
          deleted_at: null,
        },
        orderBy: [
          { read_at: { sort: 'asc', nulls: 'first' } },
          { created_at: 'desc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    return {
      notifications: notifications.map((n) => this.formatNotificationResponse(n)),
      unread_count: unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Mark a notification as read
   * Only the recipient can mark their own notifications as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        deleted_at: null,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.user_id !== userId) {
      throw new AppError(
        'Insufficient permissions',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });
  }

  /**
   * Mark all unread notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read_at: null,
        deleted_at: null,
      },
      data: { read_at: new Date() },
    });
  }

  /**
   * Get a single notification by ID
   * Verify ownership before returning
   */
  static async getById(notificationId: string, userId: string): Promise<NotificationResponse> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    return this.formatNotificationResponse(notification);
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        user_id: userId,
        read_at: null,
        deleted_at: null,
      },
    });
  }

  /**
   * Format notification response
   */
  private static formatNotificationResponse(notification: any): NotificationResponse {
    return {
      id: notification.id,
      user_id: notification.user_id,
      task_id: notification.task_id,
      type: notification.type,
      payload: notification.payload as NotificationPayload,
      read_at: notification.read_at ? notification.read_at.toISOString() : null,
      created_at: notification.created_at.toISOString(),
      updated_at: notification.updated_at.toISOString(),
    };
  }
}
