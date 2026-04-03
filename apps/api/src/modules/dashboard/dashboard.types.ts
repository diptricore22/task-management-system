/**
 * Dashboard Module - Type Definitions
 */

export type HealthIndicator = 'red' | 'yellow' | 'green';

export interface DashboardSummaryResponse {
  overdue_count: number;
  due_today_count: number;
  in_progress_count: number;
  overdue_empty: boolean;
}

export interface TaskStatusCounts {
  todo: number;
  in_progress: number;
  in_review: number;
  blocked: number;
  done: number;
}

export interface ProjectCard {
  id: string;
  name: string;
  color: string;
  task_counts: TaskStatusCounts;
  total_tasks: number;
  percent_complete: number;
  is_completed: boolean;
  updated_at: string;
}

export interface DashboardProjectsResponse {
  projects: ProjectCard[];
}

export interface ActivityActor {
  id: string;
  name: string;
}

export interface ActivityTaskRef {
  id: string;
  title: string;
}

export interface ActivityProjectRef {
  id: string;
  name: string;
}

export interface ActivityFeedItem {
  id: string;
  actor: ActivityActor;
  action: string;
  task: ActivityTaskRef | null;
  project: ActivityProjectRef | null;
  created_at: string;
  timestamp_relative: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardActivityResponse {
  activities: ActivityFeedItem[];
  pagination: PaginationInfo;
}

export interface ProjectAdminOverview {
  id: string;
  name: string;
  color: string;
  total_tasks: number;
  task_counts: TaskStatusCounts;
  overdue_count: number;
  member_count: number;
  health_indicator: HealthIndicator;
  created_at: string;
}

export interface DashboardAdminOverviewResponse {
  projects: ProjectAdminOverview[];
}
