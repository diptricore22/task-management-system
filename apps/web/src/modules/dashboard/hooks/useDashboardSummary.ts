'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { DashboardSummary } from '../types/dashboard.types';

export interface UseDashboardSummaryReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardSummary(): UseDashboardSummaryReturn {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch,
  };
}
