'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Project, ProjectListResponse } from '../types/projects.types';

interface UseProjectListReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filter: 'all' | 'active' | 'archived';
  setFilter: (filter: 'all' | 'active' | 'archived') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * useProjectList Hook
 * Fetches and manages projects list with filtering and search
 * Admin sees all projects, non-admin sees only their projects
 */
export function useProjectList(): UseProjectListReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: filter === 'all' ? 'all' : filter,
      });

      const response = await api.get<ProjectListResponse>(
        `/projects?${params.toString()}`
      );

      // Filter by search query client-side
      let filtered = response.projects;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
        );
      }

      setProjects(filtered);
      setPagination(response.pagination);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch,
    clearError,
  };
}
