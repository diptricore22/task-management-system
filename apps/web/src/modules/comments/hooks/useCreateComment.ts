'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { CreateCommentFormData, createCommentSchema } from '../validations/comments.schema';
import { CommentItem } from '../types/comments.types';

interface UseCreateCommentResult {
  body: string;
  error: string | null;
  loading: boolean;
  setBody: (body: string) => void;
  clearError: () => void;
  handleCreate: (taskId: string) => Promise<CommentItem | null>;
}

/**
 * Hook to create a new comment on a task
 * Manages form state, validation, and API call
 */
export function useCreateComment(): UseCreateCommentResult {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleCreate = useCallback(
    async (taskId: string): Promise<CommentItem | null> => {
      setError(null);

      // Validate
      try {
        createCommentSchema.parse({ body });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        return null;
      }

      setLoading(true);

      try {
        const response = await api.post<CommentItem>(
          `/tasks/${taskId}/comments`,
          { body }
        );

        setBody(''); // Clear form on success
        return response;
      } catch (err) {
        let message = 'Failed to post comment';
        if (err instanceof ApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [body]
  );

  return {
    body,
    error,
    loading,
    setBody,
    clearError,
    handleCreate,
  };
}
