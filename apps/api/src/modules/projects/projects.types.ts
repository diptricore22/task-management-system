// Projects types and interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface AddMemberRequest {
  userId: string;
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
  isActive: boolean;
  ownerId: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberResponse {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}