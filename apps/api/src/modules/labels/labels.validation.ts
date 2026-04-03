/**
 * Labels Module - Validation Schemas
 */

import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be max 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code (#RRGGBB)'),
});

export const updateLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be max 50 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code (#RRGGBB)')
    .optional(),
});

export const taskFilterSchema = z.object({
  status: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  priority: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  labels: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  assignee_id: z.string().uuid().optional(),
  due_date_from: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  due_date_to: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  sort: z
    .enum(['created_at_desc', 'due_date_asc', 'priority_desc', 'title_asc'])
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, 'Page must be 1 or greater')
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('20'),
});
