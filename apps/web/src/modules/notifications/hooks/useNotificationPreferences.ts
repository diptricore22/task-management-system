'use client';

import { useEffect, useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import { NotificationPreferences, NotificationPreferencesResponse } from '../types/notifications.types';
import { updatePreferencesSchema, UpdatePreferencesFormData } from '../validations/notifications.schema';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (data: UpdatePreferencesFormData) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<NotificationPreferencesResponse>('/users/me/notification-preferences');
      setPreferences({
        email_assigned: response.email_assigned,
        email_commented: response.email_commented,
        email_due_tomorrow: response.email_due_tomorrow,
        email_overdue: response.email_overdue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (data: UpdatePreferencesFormData): Promise<boolean> => {
    try {
      updatePreferencesSchema.parse(data);
      setLoading(true);
      setError(null);

      const payload = {
        ...(data.email_assigned !== undefined && { email_assigned: data.email_assigned }),
        ...(data.email_commented !== undefined && { email_commented: data.email_commented }),
        ...(data.email_due_tomorrow !== undefined && { email_due_tomorrow: data.email_due_tomorrow }),
        ...(data.email_overdue !== undefined && { email_overdue: data.email_overdue }),
      };

      const response = await api.patch<NotificationPreferencesResponse>('/users/me/notification-preferences', payload);
      setPreferences({
        email_assigned: response.email_assigned,
        email_commented: response.email_commented,
        email_due_tomorrow: response.email_due_tomorrow,
        email_overdue: response.email_overdue,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch,
  };
}
