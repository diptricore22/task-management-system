'use client';

import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type {
  AddMemberPayload,
  AddMemberResponse,
  ProjectMember,
} from '../types/members.types';

export interface UseAddMemberReturn {
  loading: boolean;
  error: string | null;
  addMember: (projectId: string, payload: AddMemberPayload) => Promise<ProjectMember | null>;
  clearError: () => void;
}

/**
 * Hook to add a member to a project
 */
export function useAddMember(options?: { onSuccess?: () => void }): UseAddMemberReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addMember = useCallback(
    async (projectId: string, payload: AddMemberPayload): Promise<ProjectMember | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<AddMemberResponse>(
          `/projects/${projectId}/members`,
          payload
        );

        options?.onSuccess?.();
        return response.member;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to add member');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    loading,
    error,
    addMember,
    clearError,
  };
}
