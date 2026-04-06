'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { ProjectAdminOverview } from '../types/dashboard.types';

export interface UseDashboardAdminOverviewReturn {
  projects: ProjectAdminOverview[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardAdminOverview(): UseDashboardAdminOverviewReturn {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [projects, setProjects] = useState<ProjectAdminOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminOverview = useCallback(async () => {
    if (!isAdmin) {
      setProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ projects: ProjectAdminOverview[] }>('/dashboard/admin/overview');
      setProjects(response.projects);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin overview');
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const refetch = useCallback(async () => {
    await fetchAdminOverview();
  }, [fetchAdminOverview]);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}
