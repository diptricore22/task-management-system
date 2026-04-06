// App configuration and constants
import { webEnv } from '@/lib/env';

export const APP_CONFIG = {
  name: 'Task Management System',
  description: 'Collaborative task management for engineering teams',
  version: '1.0.0',

  // URLs - using validated environment
  urls: {
    api: webEnv.api.baseUrl,
    web: webEnv.app.url,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Feature flags - using validated environment
  features: {
    emailNotifications: webEnv.features.emailNotifications,
    publicRegistration: webEnv.features.publicRegistration,
    kanbanBoard: true,
    reports: true,
  },

  // Task configuration
  tasks: {
    statuses: ['todo', 'in-progress', 'in-review', 'completed', 'blocked'] as const,
    priorities: ['low', 'medium', 'high', 'urgent'] as const,
    maxDescriptionLength: 2000,
    maxTitleLength: 200,
  },

  // Project configuration
  projects: {
    maxNameLength: 100,
    maxDescriptionLength: 500,
    colors: [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#EC4899', // pink
    ],
  },

  // User roles
  roles: ['ADMIN', 'MEMBER', 'VIEWER'] as const,

  // File upload limits (future feature)
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
};

export type TaskStatus = (typeof APP_CONFIG.tasks.statuses)[number];
export type TaskPriority = (typeof APP_CONFIG.tasks.priorities)[number];
export type UserRole = (typeof APP_CONFIG.roles)[number];

export default APP_CONFIG;