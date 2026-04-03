'use client';

import { useEffect, useState } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

/**
 * DeleteConfirmModal Component
 * Type-to-confirm modal for deleting projects
 * User must type the exact project name to enable delete button
 */
export function DeleteConfirmModal({
  isOpen,
  projectName,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  const [confirmInput, setConfirmInput] = useState('');

  const isConfirmed = confirmInput === projectName;

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmInput('');
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6">
            {/* Warning */}
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                This action cannot be undone. This will permanently delete the project and all associated data.
              </p>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Delete "{projectName}"?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Type the project name to confirm deletion:
            </p>

            {/* Confirmation Input */}
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={projectName}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition mb-6 font-mono"
              autoFocus
              autoComplete="off"
            />

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading || !isConfirmed}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 min-w-[100px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
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
