'use client';

import React, { useState } from 'react';

interface RemoveMemberModalProps {
  isOpen: boolean;
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

/**
 * RemoveMemberModal Component
 * Confirmation dialog for removing a member from a project
 */
export function RemoveMemberModal({
  isOpen,
  memberName,
  onConfirm,
  onCancel,
  loading,
}: RemoveMemberModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-member-modal-title"
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2
              id="remove-member-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Remove Member
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Are you sure you want to remove <strong>{memberName}</strong> from this project?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              They will lose access to all tasks and won't be able to view this project anymore.
              Any tasks assigned to them will become unassigned.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                'Remove Member'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
