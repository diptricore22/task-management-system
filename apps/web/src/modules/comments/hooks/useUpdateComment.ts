'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { UpdateCommentFormData, updateCommentSchema } from '../validations/comments.schema';
import { CommentItem } from '../types/comments.types';

interface UseUpdateCommentResult {
  body: string;
  error: string | null;
  loading: boolean;
  isChanged: boolean;
  setBody: (body: string) => void;
  clearError: () => void;
  handleUpdate: (commentId: string) => Promise<CommentItem | null>;
  reset: (initialBody: string) => void;
}

/**
 * Hook to edit a comment (within 15-minute window)
 * Manages form state, validation, and API call
 */
export function useUpdateComment(initialBody: string): UseUpdateCommentResult {
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isChanged = body !== initialBody;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback((newInitialBody: string) => {
    setBody(newInitialBody);
    setError(null);
  }, []);

  const handleUpdate = useCallback(
    async (commentId: string): Promise<CommentItem | null> => {
      setError(null);

      // Validate
      try {
        updateCommentSchema.parse({ body });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        return null;
      }

      setLoading(true);

      try {
        const response = await api.patch<CommentItem>(
          `/comments/${commentId}`,
          { body }
        );

        return response;
      } catch (err) {
        let message = 'Failed to update comment';
        if (err instanceof ApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        // Check for 15-minute window error
        if (message.includes('EDIT_WINDOW_EXPIRED') || message.includes('15 minute')) {
          setError('You can only edit comments within 15 minutes of posting');
        } else {
          setError(message);
        }
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
    isChanged,
    setBody,
    clearError,
    handleUpdate,
    reset,
  };
}
