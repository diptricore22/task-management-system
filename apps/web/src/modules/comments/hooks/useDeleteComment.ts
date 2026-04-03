'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api-client';

interface UseDeleteCommentResult {
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
  handleDelete: (commentId: string) => Promise<boolean>;
}

/**
 * Hook to delete a comment
 * Manages deletion state and API call
 */
export function useDeleteComment(): UseDeleteCommentResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleDelete = useCallback(async (commentId: string): Promise<boolean> => {
    setError(null);
    setIsDeleting(true);

    try {
      await api.delete(`/comments/${commentId}`);
      return true;
    } catch (err) {
      let message = 'Failed to delete comment';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    error,
    clearError,
    handleDelete,
  };
}
