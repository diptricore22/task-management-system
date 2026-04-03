'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';

interface UseMarkNotificationAsReadReturn {
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export function useMarkNotificationAsRead(): UseMarkNotificationAsReadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.patch(`/notifications/${notificationId}/read`, {});
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.patch('/notifications/read-all', {});
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
