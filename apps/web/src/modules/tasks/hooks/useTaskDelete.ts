'use client';

import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';

interface UseTaskDeleteReturn {
  isDeleting: boolean;
  error: string | null;
  handleDelete: (taskId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * useTaskDelete Hook
 * Handles task soft-deletion via DELETE /api/tasks/:id
 * Called after delete confirmation modal confirms intent
 */
export function useTaskDelete(
  options?: {
    onSuccess?: (taskId: string) => void;
    onError?: (error: Error) => void;
  }
): UseTaskDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async (taskId: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      await api.delete(`/tasks/${taskId}`);
      options?.onSuccess?.(taskId);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to delete task';
      setError(errorMessage);
      options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

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
