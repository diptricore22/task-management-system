'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ActivityFeedItem, ActivityFeedResponse } from '../types/dashboard.types';

export interface UseDashboardActivityReturn {
  activities: ActivityFeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

export function useDashboardActivity(initialLimit: number = 20): UseDashboardActivityReturn {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', String(pageNum));
      params.append('limit', String(initialLimit));

      const response = await api.get<ActivityFeedResponse>(
        `/dashboard/activity?${params.toString()}`
      );

      if (append) {
        setActivities(prev => [...prev, ...response.activities]);
      } else {
        setActivities(response.activities);
      }

      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      }
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    if (nextPage <= pagination.totalPages && !loading) {
      setPage(nextPage);
      fetchActivities(nextPage, true);
    }
  }, [page, pagination.totalPages, loading, fetchActivities]);

  const refetch = useCallback(async () => {
    setPage(1);
    await fetchActivities(1, false);
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  return {
    activities,
    pagination,
    loading,
    error,
    hasMore: page < pagination.totalPages,
    loadMore,
    refetch,
  };
}
