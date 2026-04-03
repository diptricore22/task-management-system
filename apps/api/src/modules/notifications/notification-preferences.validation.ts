/**
 * Notification Preferences - Validation Schemas
 */

import { z } from 'zod';

export const updateNotificationPreferencesSchema = z.object({
  email_due_tomorrow: z.boolean().optional(),
  email_overdue: z.boolean().optional(),
  email_assigned: z.boolean().optional(),
  email_commented: z.boolean().optional(),
});
