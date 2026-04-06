'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ProjectHealthCard } from '../types/dashboard.types';

export interface UseDashboardProjectsReturn {
  projects: ProjectHealthCard[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardProjects(): UseDashboardProjectsReturn {
  const [projects, setProjects] = useState<ProjectHealthCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // The backend may return either an array or an object like { projects: [...] }
      const response = await api.get<
        | ProjectHealthCard[]
        | { projects: ProjectHealthCard[] }
      >('/dashboard/projects');

      if (Array.isArray(response)) {
        setProjects(response);
      } else if (response && typeof response === 'object' && 'projects' in response) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        setProjects((response as { projects: ProjectHealthCard[] }).projects ?? []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}
