'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { MergedFeedItem, CommentItem as CommentItemType, ActivityLogItem as ActivityLogItemType } from '../types/comments.types';
import { CommentItem } from './CommentItem';
import { ActivityLogItem } from './ActivityLogItem';

interface MergedFeedProps {
  items: MergedFeedItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onCommentUpdate: (commentId: string, updatedComment: CommentItemType) => void;
  onCommentDelete: (commentId: string) => void;
}

/**
 * MergedFeed component - displays chronological feed of comments and activity logs
 * Combines user comments with system-generated activity events
 */
export const MergedFeed: React.FC<MergedFeedProps> = ({
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const isComment = (item: MergedFeedItem): item is CommentItemType => item.type === 'comment';
  const isActivity = (item: MergedFeedItem): item is ActivityLogItemType => item.type === 'activity';

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-slate-400 dark:text-slate-500 animate-spin" />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Failed to load comments and activity
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No comments or activity yet
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Be the first to comment on this task
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {items.map((item) => (
          <div key={item.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {isComment(item) && (
              <CommentItem
                comment={item}
                onUpdate={onCommentUpdate}
                onDelete={onCommentDelete}
              />
            )}
            {isActivity(item) && <ActivityLogItem item={item} />}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {error && items.length > 0 && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};
