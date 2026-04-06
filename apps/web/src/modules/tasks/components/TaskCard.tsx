'use client';

import React from 'react';
import type { Task } from '../types/tasks.types';
import { TaskStatusBadge } from './TaskStatusSelect';
import { TaskPriorityBadge } from './TaskPrioritySelect';

interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (task: Task) => void;
}

/**
 * TaskCard Component
 * Displays a single task row in the task list.
 * Shows: title, status badge, priority indicator, due date, action menu.
 */
export function TaskCard({ task, onSelect, onDelete }: TaskCardProps) {
  const isOverdue =
    task.due_date &&
    task.status !== 'DONE' &&
    new Date(task.due_date) < new Date(new Date().toDateString());

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          new Date(task.due_date).getFullYear() !== new Date().getFullYear()
            ? 'numeric'
            : undefined,
      })
    : null;

  return (
    <div
      className="group flex items-start gap-3 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSelect?.(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(task)}
      aria-label={`View task: ${task.title}`}
    >
      {/* Priority dot */}
      <div className="flex-shrink-0 mt-0.5">
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.status === 'DONE'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <TaskStatusBadge status={task.status} />

          {formattedDueDate && (
            <span
              className={`text-xs font-medium ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isOverdue ? '⚠ ' : '📅 '}
              {formattedDueDate}
            </span>
          )}
        </div>
      </div>

      {/* Delete button — only visible on hover */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          aria-label={`Delete task: ${task.title}`}
        >
          {/* Trash icon using inline SVG to avoid a dependency assumption */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
