'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ProjectMember, ProjectMembersResponse } from '../types/members.types';

export interface UseProjectMembersReturn {
  members: ProjectMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage project members list
 * @param projectId - ID of the project
 */
export function useProjectMembers(projectId: string): UseProjectMembersReturn {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ProjectMembersResponse>(
        `/projects/${projectId}/members`
      );
      setMembers(response.members);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(async () => {
    await fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch,
  };
}
