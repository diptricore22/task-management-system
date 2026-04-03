'use client';

import { useEffect } from 'react';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

/**
 * ArchiveConfirmModal Component
 * Simple confirmation modal for archiving projects
 */
export function ArchiveConfirmModal({
  isOpen,
  projectName,
  onConfirm,
  onCancel,
  loading,
}: ArchiveConfirmModalProps) {
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Archive this project?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The project "{projectName}" will be hidden from your active projects list. You can restore it later.
            </p>

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
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 min-w-[100px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  'Archive'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
