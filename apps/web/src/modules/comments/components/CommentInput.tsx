'use client';

import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

const CHAR_LIMIT = 5000;
const WARN_THRESHOLD = 4000;

/**
 * CommentInput component for creating new comments
 * Features:
 * - Character counter
 * - Ctrl/Cmd+Enter keyboard shortcut
 * - Submit button with loading state
 * - Error display
 */
export const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  onClearError,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = value.trim().length === 0;
  const charCount = value.length;
  const showCharCount = charCount > WARN_THRESHOLD;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty && !loading) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!isEmpty && !loading) {
      onSubmit();
    }
  };

  // Auto clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(onClearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className={`relative rounded-lg border transition-colors ${
        isFocused
          ? 'border-violet-500 dark:border-violet-400 bg-white dark:bg-slate-800'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
      }`}>
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... (Max 5000 characters)"
          disabled={loading}
          rows={4}
          className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
          {showCharCount && (
            <div className={`text-xs font-medium ${
              charCount > CHAR_LIMIT
                ? 'text-red-600 dark:text-red-400'
                : charCount > WARN_THRESHOLD
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
            }`}>
              {charCount}/{CHAR_LIMIT}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isEmpty || loading || charCount > CHAR_LIMIT}
            title="Send comment (or Ctrl+Enter)"
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Use <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono">Ctrl+Enter</kbd> to submit
      </p>
    </div>
  );
};
