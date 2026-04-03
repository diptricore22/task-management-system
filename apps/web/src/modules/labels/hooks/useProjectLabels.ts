'use client';

import { useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Label, ProjectLabelsResponse } from '../types/labels.types';

interface UseProjectLabelsResult {
  labels: Label[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all labels for a project
 * Used by label management UI and filter dropdowns
 */
export function useProjectLabels(projectId: string | null | undefined): UseProjectLabelsResult {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!projectId) {
      setLabels([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Label[]>(`/projects/${projectId}/labels`);
      setLabels(Array.isArray(response) ? response : []);
    } catch (err) {
      let message = 'Failed to fetch labels';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setLabels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(async () => {
    await fetchLabels();
  }, [fetchLabels]);

  // Fetch on mount or when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchLabels();
    }
  }, [projectId, fetchLabels]);

  return {
    labels,
    loading,
    error,
    refetch,
  };
}
