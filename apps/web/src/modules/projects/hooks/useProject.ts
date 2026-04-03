'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { ProjectDetail } from '../types/projects.types';

interface UseProjectReturn {
  project: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * useProject Hook
 * Fetches a single project by ID with full details including members
 */
export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ project: ProjectDetail }>(
        `/projects/${projectId}`
      );
      setProject(response.project);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch,
    clearError,
  };
}
