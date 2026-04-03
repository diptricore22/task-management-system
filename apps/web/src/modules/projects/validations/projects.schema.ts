'use client';

import { z } from 'zod';

/**
 * Project Validation Schemas
 * Matches backend validation from API spec
 */

// Color validation - hex format #RRGGBB
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)');

/**
 * Create Project Schema
 * name: required, 1-100 chars
 * description: optional, 0-1000 chars
 * color: required, hex format
 */
export const createProjectSchema = z.object({
  name: z
    .string({
      required_error: 'Project name is required',
    })
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or fewer'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer')
    .optional()
    .nullable(),
  color: hexColorSchema,
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

/**
 * Update Project Schema
 * All fields optional
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer')
    .optional()
    .nullable(),
  color: hexColorSchema.optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

/**
 * Archive Project Schema
 * archived: boolean flag
 */
export const archiveProjectSchema = z.object({
  archived: z.boolean({
    required_error: 'Archive status is required',
  }),
});

export type ArchiveProjectFormData = z.infer<typeof archiveProjectSchema>;

/**
 * Add Project Member Schema
 * user_id: UUID
 * role: ADMIN | MEMBER | VIEWER
 */
export const addProjectMemberSchema = z.object({
  user_id: z
    .string({
      required_error: 'User is required',
    })
    .uuid('Must be a valid user ID'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    required_error: 'Role is required',
  }),
});

export type AddProjectMemberFormData = z.infer<typeof addProjectMemberSchema>;

/**
 * Update Project Member Schema
 * role: ADMIN | MEMBER | VIEWER
 */
export const updateProjectMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    required_error: 'Role is required',
  }),
});

export type UpdateProjectMemberFormData = z.infer<typeof updateProjectMemberSchema>;
