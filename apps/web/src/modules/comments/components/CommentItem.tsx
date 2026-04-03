'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { CommentItem as CommentItemType } from '../types/comments.types';
import { useUpdateComment } from '../hooks/useUpdateComment';
import { useDeleteComment } from '../hooks/useDeleteComment';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface CommentItemProps {
  comment: CommentItemType;
  onUpdate: (commentId: string, updatedComment: CommentItemType) => void;
  onDelete: (commentId: string) => void;
}

/**
 * CommentItem component - displays a single comment with edit/delete actions
 * Edit is only allowed:
 * - If posted within 15 minutes ago
 * - If the user is the comment author
 * Delete is allowed:
 * - If the user is the comment author or an admin
 */
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { body, error: updateError, loading: updateLoading, setBody, handleUpdate } = useUpdateComment(comment.body);
  const { isDeleting, handleDelete } = useDeleteComment();

  const isAuthor = user?.id === comment.author.id;
  const isAdmin = user?.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  // Check if within 15-minute edit window
  const createdTime = new Date(comment.created_at).getTime();
  const now = new Date().getTime();
  const elapsedMinutes = (now - createdTime) / (1000 * 60);
  const canEdit = isAuthor && elapsedMinutes < 15;

  const handleSaveEdit = async () => {
    const updated = await handleUpdate(comment.id);
    if (updated) {
      onUpdate(comment.id, updated);
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed) {
      const success = await handleDelete(comment.id);
      if (success) {
        onDelete(comment.id);
      }
    }
  };

  // Get user initials for avatar
  const initials = comment.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group flex gap-3 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      {/* Avatar */}
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
          {initials}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-slate-900 dark:text-white">
            {comment.author.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {comment.timestamp_relative}
            {comment.is_edited && ' (edited)'}
          </span>
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
            />
            {updateError && (
              <p className="text-xs text-red-600 dark:text-red-400">{updateError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={updateLoading}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-violet-600 dark:bg-violet-500 text-white rounded hover:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={updateLoading}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed break-words">
            {comment.body}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              title="Edit comment (15 min window)"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              title="Delete comment"
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
