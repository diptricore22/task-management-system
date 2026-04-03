/**
 * Notification Preferences - Service Layer
 * Business logic for managing user notification settings
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesRequest,
} from './notification-preferences.types';

export class NotificationPreferencesService {
  /**
   * Get notification preferences for user
   * Creates default preferences if user has none
   */
  static async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get preferences, or create defaults
    let preferences = await prisma.notificationPreference.findUnique({
      where: { user_id: userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreference.create({
        data: {
          user_id: userId,
          email_due_tomorrow: true,
          email_overdue: true,
          email_assigned: true,
          email_commented: false,
        },
      });
    }

    return this.formatPreferencesResponse(preferences);
  }

  /**
   * Update notification preferences for user
   * Only user can update their own preferences
   */
  static async updatePreferences(
    userId: string,
    data: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get current preferences (create if doesn't exist)
    const current = await this.getPreferences(userId);

    // Build update data from provided fields
    const updateData: any = {};
    if (data.email_due_tomorrow !== undefined) {
      updateData.email_due_tomorrow = data.email_due_tomorrow;
    }
    if (data.email_overdue !== undefined) {
      updateData.email_overdue = data.email_overdue;
    }
    if (data.email_assigned !== undefined) {
      updateData.email_assigned = data.email_assigned;
    }
    if (data.email_commented !== undefined) {
      updateData.email_commented = data.email_commented;
    }

    // Update preferences
    const updated = await prisma.notificationPreference.update({
      where: { user_id: userId },
      data: updateData,
    });

    return this.formatPreferencesResponse(updated);
  }

  /**
   * Check if user has enabled email notification for a type
   */
  static async isEmailNotificationEnabled(
    userId: string,
    notificationType: 'due_tomorrow' | 'overdue' | 'assigned' | 'commented'
  ): Promise<boolean> {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { user_id: userId },
    });

    if (!preferences) {
      // Default to enabled if no preferences exist
      return true;
    }

    switch (notificationType) {
      case 'due_tomorrow':
        return preferences.email_due_tomorrow;
      case 'overdue':
        return preferences.email_overdue;
      case 'assigned':
        return preferences.email_assigned;
      case 'commented':
        return preferences.email_commented;
      default:
        return false;
    }
  }

  /**
   * Format preferences response for API
   */
  private static formatPreferencesResponse(
    preferences: any
  ): NotificationPreferencesResponse {
    return {
      user_id: preferences.user_id,
      email_due_tomorrow: preferences.email_due_tomorrow,
      email_overdue: preferences.email_overdue,
      email_assigned: preferences.email_assigned,
      email_commented: preferences.email_commented,
      updated_at: preferences.updated_at.toISOString(),
    };
  }
}
