'use client';

import React, { useState } from 'react';
import type { Task } from '../types/tasks.types';
import { TaskForm } from './TaskForm';
import { TaskStatusBadge } from './TaskStatusSelect';
import { TaskPriorityBadge } from './TaskPrioritySelect';
import { CommentSection } from '@/modules/comments/components/CommentSection';

interface TaskDetailPanelProps {
  task: Task | null;
  projectMembers?: Array<{ id: string; name: string }>;
  onClose?: () => void;
  onUpdate?: (updated: Task) => void;
  onDelete?: (taskId: string) => void;
}

type TabType = 'details' | 'comments';

const TABS: Array<{ id: TabType; label: string }> = [
  { id: 'details', label: 'Details' },
  { id: 'comments', label: 'Comments' },
];

/**
 * TaskDetailPanel Component
 * Slide-over panel for viewing/editing a single task.
 * Tabs: Details (view + inline edit) | Comments (merged activity feed).
 */
export function TaskDetailPanel({
  task,
  projectMembers = [],
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      // Strip null values (due_date: null → undefined) to keep Task type clean
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null)
      ) as Partial<Task>;
      onUpdate?.({ ...task, ...cleaned });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    onDelete?.(task.id);
    onClose?.();
  };

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col z-40"
        role="dialog"
        aria-modal="true"
        aria-label={`Task: ${task.title}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate pr-4">
            {task.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* ── Details tab ── */}
          {activeTab === 'details' && (
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="p-6">
                  <TaskForm
                    task={task}
                    projectMembers={projectMembers}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsEditing(false)}
                    loading={submitting}
                  />
                </div>
              ) : (
                <>
                  <div className="px-6 py-5 space-y-5">
                    {/* Status + Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Status
                        </p>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Priority
                        </p>
                        <TaskPriorityBadge priority={task.priority} />
                      </div>
                    </div>

                    {/* Due date */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Due Date
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          !task.due_date
                            ? 'text-slate-400 dark:text-slate-500 italic'
                            : new Date(task.due_date) < new Date() && task.status !== 'DONE'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formattedDueDate}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Description
                      </p>
                      {task.description ? (
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {task.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                          No description provided.
                        </p>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Created
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {new Date(task.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Updated
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {new Date(task.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit Task
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Comments tab ── */}
          {activeTab === 'comments' && <CommentSection taskId={task.id} />}
        </div>
      </div>
    </>
  );
}
