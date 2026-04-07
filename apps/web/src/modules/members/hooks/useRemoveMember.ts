'use client';

import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { RemoveMemberResponse } from '../types/members.types';

export interface UseRemoveMemberReturn {
  loading: boolean;
  error: string | null;
  removeMember: (projectId: string, userId: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook to remove a member from a project
 */
export function useRemoveMember(options?: { onSuccess?: () => void }): UseRemoveMemberReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const removeMember = useCallback(
    async (projectId: string, userId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await api.delete<RemoveMemberResponse>(
          `/projects/${projectId}/members/${userId}`
        );

        options?.onSuccess?.();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to remove member');
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    loading,
    error,
    removeMember,
    clearError,
  };
}
