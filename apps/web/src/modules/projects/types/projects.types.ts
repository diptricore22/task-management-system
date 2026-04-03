/**
 * Project Types
 * Mirrors backend response types from API spec
 */

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joined_at: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  in_review?: number;
  blocked?: number;
  done: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_by: string;
  member_count: number;
  task_stats: TaskStats;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface ArchiveProjectInput {
  archived: boolean;
}

export interface AddProjectMemberInput {
  user_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface UpdateProjectMemberInput {
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
