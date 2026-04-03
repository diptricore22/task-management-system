'use client';

import { useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '@/lib/api-client';
import {
  MergedFeedItem,
  PaginationInfo,
  TaskActivityFeedResponse,
} from '../types/comments.types';

interface UseTaskCommentsResult {
  items: MergedFeedItem[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => void;
  loadMore: () => void;
}

/**
 * Hook to fetch task comments and activity log with pagination
 * Fetches merged chronological feed of comments and system activity
 */
export function useTaskComments(taskId: string | null | undefined): UseTaskCommentsResult {
  const [items, setItems] = useState<MergedFeedItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      if (!taskId) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('page', String(pageNum));
        params.append('limit', '20');

        const response = await api.get<TaskActivityFeedResponse>(
          `/tasks/${taskId}/comments?${params.toString()}`
        );

        setPagination(response.pagination);

        if (append) {
          // Load more: append to existing items
          setItems((prev) => [...prev, ...response.feed]);
        } else {
          // Initial fetch: replace items
          setItems(response.feed);
        }
      } catch (err) {
        let message = 'Failed to fetch comments';
        if (err instanceof ApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [taskId]
  );

  const refetch = useCallback(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    if (nextPage <= pagination.pages && !loading) {
      setPage(nextPage);
      fetchComments(nextPage, true); // true = append mode
    }
  }, [page, pagination.pages, loading, fetchComments]);

  // Fetch on mount or when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchComments(1, false);
    }
  }, [taskId, fetchComments]);

  return {
    items,
    pagination,
    loading,
    error,
    hasMore: page < pagination.pages,
    refetch,
    loadMore,
  };
}
