'use client';

import React, { useState, useEffect } from 'react';
import { useAddMember } from '../hooks/useAddMember';
import { useUserSearch } from '../hooks/useUserSearch';
import type { MemberRole } from '../types/members.types';

interface AddMemberModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
  existingMemberIds?: string[];
}

const ROLE_OPTIONS: Array<{ value: MemberRole; label: string; description: string }> = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Can manage members, create/edit/delete tasks, and modify project settings',
  },
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can create and edit tasks, post comments, and view project data',
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Read-only access to project tasks and data',
  },
];

/**
 * AddMemberModal Component
 * Modal for adding a user to a project with role selection
 */
export function AddMemberModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
  existingMemberIds = [],
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>('MEMBER');

  const { users, loading: searchLoading, searchUsers, clearResults } = useUserSearch();
  const { loading: addLoading, error: addError, addMember, clearError } = useAddMember({
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
  });

  // Filter out users who are already members
  const availableUsers = users.filter((user) => !existingMemberIds.includes(user.id));

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedUserId(null);
      setSelectedRole('MEMBER');
      clearResults();
      clearError();
    }
  }, [isOpen, clearResults, clearError]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchUsers, clearResults]);

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUserId(null);
    setSelectedRole('MEMBER');
    clearResults();
    clearError();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await addMember(projectId, {
      user_id: selectedUserId,
      role: selectedRole,
    });
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-modal-title"
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2
              id="add-member-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Add Member to Project
            </h2>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Error message */}
            {addError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                {addError}
              </div>
            )}

            {/* User search */}
            <div>
              <label
                htmlFor="user-search"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Search for a user
              </label>
              <input
                id="user-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUserId(null);
                }}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                disabled={addLoading}
                autoFocus
              />

              {/* User search results */}
              {searchQuery && !selectedUserId && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {searchLoading ? (
                    <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                      Searching...
                    </div>
                  ) : availableUsers.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                      {users.length > 0 && availableUsers.length === 0
                        ? 'All matching users are already members'
                        : 'No users found'}
                    </div>
                  )}
                </div>
              )}

              {/* Selected user */}
              {selectedUser && (
                <div className="mt-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedUser.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {selectedUser.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(null)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      aria-label="Clear selection"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role selection */}
            {selectedUserId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select role
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRole === option.value
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={selectedRole === option.value}
                        onChange={() => setSelectedRole(option.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={addLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!selectedUserId || addLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
