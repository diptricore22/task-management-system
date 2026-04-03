import { z } from 'zod';
import type { TaskStatus, TaskPriority } from '../types/tasks.types';

// Status enum validation
const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'] as const);

// Priority enum validation
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const);

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Date validation (YYYY-MM-DD)
const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
).nullable().optional();

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(255, 'Task title must be less than 255 characters'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
  priority: priorityEnum.default('MEDIUM').optional(),
  due_date: dateSchema,
  assignee_id: uuidSchema.optional().or(z.literal('')).transform(val => val || undefined),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

/**
 * Schema for updating a task
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(255, 'Task title must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  due_date: dateSchema,
  assignee_id: uuidSchema.optional().or(z.literal('')).transform(val => val || undefined),
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

/**
 * Schema for updating only task status
 */
export const updateTaskStatusSchema = z.object({
  status: statusEnum,
});

export type UpdateTaskStatusData = z.infer<typeof updateTaskStatusSchema>;

/**
 * Partial schema for validating individual fields
 */
export const taskFieldSchemas = {
  title: createTaskSchema.pick({ title: true }),
  description: createTaskSchema.pick({ description: true }),
  priority: createTaskSchema.pick({ priority: true }),
  due_date: createTaskSchema.pick({ due_date: true }),
  assignee_id: createTaskSchema.pick({ assignee_id: true }),
  status: updateTaskSchema.pick({ status: true }),
};
