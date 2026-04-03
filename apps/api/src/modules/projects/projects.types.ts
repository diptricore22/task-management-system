// Projects types and interfaces - aligned with DATABASE_SPEC.md and API_SPEC.md

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface ArchiveProjectRequest {
  archived: boolean;
}

export interface AddMemberRequest {
  user_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface UpdateMemberRequest {
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_by: string;
  member_count: number;
  task_stats: {
    total: number;
    todo: number;
    in_progress: number;
    in_review: number;
    blocked: number;
    done: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectDetailResponse extends ProjectResponse {
  members: ProjectMemberResponse[];
}

export interface ProjectMemberResponse {
  id: string;
  user_id: string;
  project_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  name: string;
  email: string;
  joined_at: string;
}

export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
