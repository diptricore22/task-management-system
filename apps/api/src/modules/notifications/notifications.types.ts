/**
 * Notifications Module - Type Definitions
 */

export type NotificationType = 'task_assigned';

export interface NotificationPayload {
  title: string;
  message: string;
  task_id: string;
  project_id: string;
}

export interface NotificationResponse {
  id: string;
  user_id: string;
  task_id: string | null;
  type: NotificationType;
  payload: NotificationPayload;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MyTasksGroup {
  project_id: string;
  project_name: string;
  project_color: string;
  tasks: TaskInMyTasks[];
}

export interface TaskInMyTasks {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export interface MyTasksResponse {
  tasks: TaskInMyTasks[];
  grouped_by_project: MyTasksGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedNotificationResponse {
  notifications: NotificationResponse[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
