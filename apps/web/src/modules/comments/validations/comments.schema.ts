'use client';

import { z } from 'zod';

/**
 * Comments & Activity Feed Module - Validation Schemas
 */

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment is too long (max 5000 characters)'),
});

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment is too long (max 5000 characters)'),
});

export const taskActivityQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Page must be 1 or greater')
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
    .default('20'),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
export type TaskActivityQueryParams = z.infer<typeof taskActivityQuerySchema>;
