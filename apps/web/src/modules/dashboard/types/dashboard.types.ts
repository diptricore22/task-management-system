/**
 * Dashboard Types
 * Mirrors backend response types from dashboard API spec
 */

export interface DashboardSummary {
  overdue_count: number;
  due_today_count: number;
  in_progress_count: number;
  overdue_empty: boolean;
}

export interface ProjectHealthCard {
  id: string;
  name: string;
  color: string;
  task_counts: {
    todo: number;
    in_progress: number;
    done: number;
  };
  total_tasks: number;
  percent_complete: number;
  is_completed: boolean;
  updated_at: string;
}

export interface ActivityFeedItem {
  id: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ActivityFeedResponse {
  activities: ActivityFeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectAdminOverview {
  project_id: string;
  project_name: string;
  total_tasks: number;
  done_count: number;
  in_progress_count: number;
  blocked_count: number;
  overdue_count: number;
  health_indicator: 'red' | 'yellow' | 'green';
}
