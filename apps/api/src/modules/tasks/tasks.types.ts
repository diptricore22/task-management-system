/**
 * Task Module - Type Definitions
 * Defines all request/response interfaces for task management
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string; // ISO date string
  assignee_id?: string; // UUID
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
}

export interface ListTasksQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  sort?: 'created_at_desc' | 'due_date_asc' | 'priority_desc';
}

export interface TaskResponse {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDetailResponse extends TaskResponse {
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  comment_count?: number;
}

export interface PaginatedTaskResponse {
  success: boolean;
  data: TaskResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}
