'use client';

export type NotificationType = 'task_assigned' | 'task_commented' | 'task_due_tomorrow' | 'task_overdue';

export interface NotificationPayload {
  task_id: string;
  task_title: string;
  project_id: string;
  actor_name: string;
  comment_body?: string;
  due_date?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  task_id: string;
  type: NotificationType;
  payload: NotificationPayload;
  read_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unread_count: number;
}

export interface NotificationPreferences {
  email_assigned: boolean;
  email_commented: boolean;
  email_due_tomorrow: boolean;
  email_overdue: boolean;
}

export interface NotificationPreferencesResponse {
  user_id: string;
  email_assigned: boolean;
  email_commented: boolean;
  email_due_tomorrow: boolean;
  email_overdue: boolean;
  created_at: string;
  updated_at: string;
}
