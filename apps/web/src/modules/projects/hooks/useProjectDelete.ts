'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';

interface UseProjectDeleteReturn {
  isDeleting: boolean;
  error: string | null;
  handleDelete: (projectId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * useProjectDelete Hook
 * Handles project soft-deletion
 * Called after type-to-confirm modal confirms delete
 */
export function useProjectDelete(): UseProjectDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async (projectId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await api.delete(`/projects/${projectId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDeleting,
    error,
    handleDelete,
    clearError,
  };
}
