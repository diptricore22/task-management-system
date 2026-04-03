'use client';

import { z } from 'zod';

/**
 * Labels Module - Validation Schemas
 * Zod schemas for label creation and updates
 */

export const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be 50 characters or less'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)'),
});

export const updateLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be 50 characters or less')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional(),
});

export type CreateLabelFormData = z.infer<typeof createLabelSchema>;
export type UpdateLabelFormData = z.infer<typeof updateLabelSchema>;
