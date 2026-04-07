'use client';

import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type {
  UpdateMemberRolePayload,
  UpdateMemberResponse,
  ProjectMember,
} from '../types/members.types';

export interface UseUpdateMemberRoleReturn {
  loading: boolean;
  error: string | null;
  updateRole: (projectId: string, userId: string, payload: UpdateMemberRolePayload) => Promise<ProjectMember | null>;
  clearError: () => void;
}

/**
 * Hook to update a member's role in a project
 */
export function useUpdateMemberRole(options?: { onSuccess?: () => void }): UseUpdateMemberRoleReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateRole = useCallback(
    async (
      projectId: string,
      userId: string,
      payload: UpdateMemberRolePayload
    ): Promise<ProjectMember | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.patch<UpdateMemberResponse>(
          `/projects/${projectId}/members/${userId}`,
          payload
        );

        options?.onSuccess?.();
        return response.member;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to update member role');
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
    updateRole,
    clearError,
  };
}
