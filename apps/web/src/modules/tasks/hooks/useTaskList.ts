'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { Task, TaskFilters, TaskListResponse } from '../types/tasks.types';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseTaskListReturn {
  tasks: Task[];
  pagination: Pagination;
  filters: TaskFilters;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useTaskList(projectId: string, initialLimit: number = 20): UseTaskListReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    assignee_id: 'all',
    search: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams();
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters.assignee_id && filters.assignee_id !== 'all') {
      params.append('assignee_id', filters.assignee_id);
    }

    return params;
  }, [pagination.page, pagination.limit, filters]);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams();
      const response = await api.get<TaskListResponse>(
        `/projects/${projectId}/tasks?${queryParams.toString()}`
      );

      let filteredTasks = response.tasks;
      if (searchQuery) {
        filteredTasks = response.tasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTasks(filteredTasks);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, buildQueryParams, searchQuery]);

  const refetch = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [pagination.page, pagination.limit, filters, fetchTasks]);

  const handleSetFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    tasks,
    pagination,
    filters,
    searchQuery,
    loading,
    error,
    setFilters: handleSetFilters,
    setSearchQuery: handleSetSearchQuery,
    setPage: handleSetPage,
    refetch,
  };
}
