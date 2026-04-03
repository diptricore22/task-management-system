import { z } from 'zod';

// Create project validation schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or fewer'),
  description: z
    .string()
    .max(1000, 'Project description must be 1000 characters or fewer')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #RRGGBB)'),
});

// Update project validation schema
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(100, 'Project name must be 100 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(1000, 'Project description must be 1000 characters or fewer')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #RRGGBB)')
    .optional(),
});

// Archive project validation schema
export const archiveProjectSchema = z.object({
  archived: z.boolean(),
});

// Add member validation schema
export const addMemberSchema = z.object({
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, MEMBER, or VIEWER' }),
  }),
});

// Update member role validation schema
export const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, MEMBER, or VIEWER' }),
  }),
});
