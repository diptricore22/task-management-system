import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  email_assigned: z.boolean().optional(),
  email_commented: z.boolean().optional(),
  email_due_tomorrow: z.boolean().optional(),
  email_overdue: z.boolean().optional(),
}).strict();

export type UpdatePreferencesFormData = z.infer<typeof updatePreferencesSchema>;
