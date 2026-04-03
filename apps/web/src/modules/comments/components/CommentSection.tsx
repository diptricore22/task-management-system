'use client';

import React, { useCallback } from 'react';
import { CommentInput } from './CommentInput';
import { MergedFeed } from './MergedFeed';
import { useTaskComments } from '../hooks/useTaskComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { CommentItem as CommentItemType } from '../types/comments.types';

interface CommentSectionProps {
  taskId: string | null | undefined;
}

/**
 * CommentSection component - main container for comments and activity
 * Orchestrates:
 * - Fetching merged feed of comments and activity
 * - Creating new comments
 * - Updating comments
 * - Deleting comments  * - Pagination/load-more
 */
export const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const {
    items,
    pagination,
    loading,
    error,
    hasMore,
    refetch,
    loadMore,
  } = useTaskComments(taskId);

  const {
    body,
    error: createError,
    loading: createLoading,
    setBody,
    clearError: clearCreateError,
    handleCreate,
  } = useCreateComment();

  const handleCreateComment = useCallback(async () => {
    if (!taskId) return;

    const newComment = await handleCreate(taskId);
    if (newComment) {
      // Refetch to update feed with new comment
      refetch();
    }
  }, [taskId, handleCreate, refetch]);

  const handleCommentUpdate = useCallback(
    (commentId: string, updatedComment: CommentItemType) => {
      // Update the item in the feed
      const updatedItems = items.map((item) =>
        item.id === commentId && item.type === 'comment'
          ? { ...item, ...updatedComment }
          : item
      );
      // In a real app, we'd update state, but since hooks manage state,
      // we'll just refetch to stay in sync
      refetch();
    },
    [items, refetch]
  );

  const handleCommentDelete = useCallback(
    (commentId: string) => {
      // Remove item from feed
      const updatedItems = items.filter((item) => item.id !== commentId);
      // In a real app, update state, but we refetch
      refetch();
    },
    [items, refetch]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Feed Container */}
      <div className="flex-1 overflow-y-auto">
        <MergedFeed
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
        />
      </div>

      {/* Comment Input */}
      <CommentInput
        value={body}
        onChange={setBody}
        onSubmit={handleCreateComment}
        loading={createLoading}
        error={createError}
        onClearError={clearCreateError}
      />
    </div>
  );
};
