'use client';

/**
 * Task Filters & Sorting - Type Definitions
 * Defines filter state structure for task list filtering with URL persistence
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SortOption = 'created_at_desc' | 'due_date_asc' | 'priority_desc' | 'title_asc';

export interface FilterState {
  statuses: TaskStatus[]; // OR logic within this array
  priorities: TaskPriority[]; // OR logic within this array
  labelIds: string[]; // Label IDs to filter by (OR logic)
  assigneeId: string | null; // Single assignee ID
  dueDateFrom: string | null; // ISO date YYYY-MM-DD
  dueDateTo: string | null; // ISO date YYYY-MM-DD
  sort: SortOption; // Sort order
  page: number; // Current page (1-indexed)
  limit: number; // Items per page (default 20, max 100)
}

export interface TaskFilters {
  status?: string; // Comma-separated status values
  priority?: string; // Comma-separated priority values
  labels?: string; // Comma-separated label IDs
  assignee_id?: string; // Single assignee UUID
  due_date_from?: string; // ISO date
  due_date_to?: string; // ISO date
  sort?: SortOption;
  page?: number;
  limit?: number;
}

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  statuses: [],
  priorities: [],
  labelIds: [],
  assigneeId: null,
  dueDateFrom: null,
  dueDateTo: null,
  sort: 'created_at_desc',
  page: 1,
  limit: 20,
};
