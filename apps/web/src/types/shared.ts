// Shared types used across the application

import type { TaskStatus, TaskPriority, UserRole } from '@/lib/config';

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  emailVerified: boolean;
  lastLoginAt?: string;
  preferences: {
    emailNotifications: boolean;
    taskUpdates: boolean;
    projectUpdates: boolean;
    dueDateReminders: boolean;
  };
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  ownerId: string;
  owner: User;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: UserRole;
  joinedAt: string;
  user: User;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
  recentActivity: ActivityLogItem[];
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project: Pick<Project, 'id' | 'name' | 'color'>;
  assigneeId?: string;
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
  authorId: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName'>;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    labels: number;
  };
}

export interface TaskDetail extends Task {
  comments: Comment[];
  labels: Label[];
  activityLog: ActivityLogItem[];
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Label types
export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Activity log types
export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: 'task' | 'project' | 'comment' | 'assignment';
  entityId: string;
  entityName: string;
  actorId: string;
  actor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  projectId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  activeProjects: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  recentActivity: ActivityLogItem[];
  projectHealthCards: Array<{
    project: Project;
    completionRate: number;
    overdueCount: number;
    recentActivity: number;
  }>;
}

// API types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  color: string;
}

export interface TaskForm {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  labelIds?: string[];
}

export interface CommentForm {
  content: string;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  labelId?: string[];
  projectId?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  search?: string;
}

export interface ProjectFilters {
  isActive?: boolean;
  ownerId?: string;
  search?: string;
}