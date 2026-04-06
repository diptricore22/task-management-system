'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';

interface UseProjectArchiveReturn {
  isArchiving: boolean;
  error: string | null;
  handleArchive: (projectId: string, isArchive: boolean) => Promise<void>;
  clearError: () => void;
}

/**
 * useProjectArchive Hook
 * Handles project archive/restore operations
 * isArchive = true → archive; false → restore
 */
export function useProjectArchive(): UseProjectArchiveReturn {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = useCallback(
    async (projectId: string, isArchive: boolean) => {
      setIsArchiving(true);
      setError(null);

      try {
        await api.patch(`/projects/${projectId}/archive`, {
          archived: isArchive,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Failed to ${isArchive ? 'archive' : 'restore'} project`;
        setError(errorMessage);
        throw err;
      } finally {
        setIsArchiving(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isArchiving,
    error,
    handleArchive,
    clearError,
  };
}
