'use client';

import React, { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * DeleteConfirmModal Component
 * Simple confirm/cancel modal for task deletion.
 * Supports Escape key to dismiss and backdrop click to cancel.
 */
export function DeleteConfirmModal({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => !loading && onCancel()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Warning banner */}
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="text-red-600 dark:text-red-400 text-xl flex-shrink-0">⚠️</span>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                This action cannot be undone. The task will be soft-deleted and removed from the list.
              </p>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Delete task?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 truncate">
              <span className="font-medium text-slate-900 dark:text-white">"{taskTitle}"</span>{' '}
              will be permanently removed.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 min-w-[100px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
