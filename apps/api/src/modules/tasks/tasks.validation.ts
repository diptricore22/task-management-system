/**
 * Task Module - Validation Schemas
 * Zod schemas for task request validation
 */

import { z } from 'zod';

// Create task validation schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(255, 'Task title must be 255 characters or fewer'),
  description: z
    .string()
    .max(5000, 'Task description must be 5000 characters or fewer')
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
      errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or CRITICAL' }),
    })
    .optional(),
  due_date: z
    .string()
    .refine(
      (date) => /^\d{4}-\d{2}-\d{2}/.test(date) && !isNaN(Date.parse(date)),
      'Due date must be a valid ISO date'
    )
    .optional(),
  assignee_id: z
    .string()
    .uuid('Invalid assignee ID format')
    .optional(),
});

// Update task validation schema
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title cannot be empty')
    .max(255, 'Task title must be 255 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(5000, 'Task description must be 5000 characters or fewer')
    .optional()
    .nullable(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'], {
      errorMap: () => ({
        message: 'Status must be TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, or DONE',
      }),
    })
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
      errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or CRITICAL' }),
    })
    .optional(),
  due_date: z
    .string()
    .refine(
      (date) => /^\d{4}-\d{2}-\d{2}/.test(date) && !isNaN(Date.parse(date)),
      'Due date must be a valid ISO date'
    )
    .optional()
    .nullable(),
  assignee_id: z
    .string()
    .uuid('Invalid assignee ID format')
    .optional()
    .nullable(),
});

// List tasks query validation schema
export const listTasksSchema = z.object({
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
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'])
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .optional(),
  assignee_id: z
    .string()
    .uuid('Invalid assignee ID format')
    .optional(),
  sort: z
    .enum(['created_at_desc', 'due_date_asc', 'priority_desc'])
    .optional()
    .default('created_at_desc'),
});
