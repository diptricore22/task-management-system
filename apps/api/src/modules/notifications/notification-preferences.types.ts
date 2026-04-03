/**
 * Notification Preferences - Type Definitions
 */

export interface NotificationPreferencesResponse {
  user_id: string;
  email_due_tomorrow: boolean;
  email_overdue: boolean;
  email_assigned: boolean;
  email_commented: boolean;
  updated_at: string;
}

export interface UpdateNotificationPreferencesRequest {
  email_due_tomorrow?: boolean;
  email_overdue?: boolean;
  email_assigned?: boolean;
  email_commented?: boolean;
}
