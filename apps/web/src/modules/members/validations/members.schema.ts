/**
 * Member Management Validation Schemas
 * Zod schemas for member-related forms
 */

import { z } from 'zod';

export const memberRoleSchema = z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
  errorMap: () => ({ message: 'Role must be ADMIN, MEMBER, or VIEWER' }),
});

export const addMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: memberRoleSchema,
});

export const updateMemberRoleSchema = z.object({
  role: memberRoleSchema,
});

export type AddMemberFormData = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>;
