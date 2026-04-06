'use client';

import React from 'react';
import type { TaskStatus } from '../types/tasks.types';

interface TaskStatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  id?: string;
}

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; colorClass: string }> = [
  { value: 'TODO',        label: 'To Do',       colorClass: 'text-slate-400' },
  { value: 'IN_PROGRESS', label: 'In Progress',  colorClass: 'text-blue-400' },
  { value: 'IN_REVIEW',   label: 'In Review',    colorClass: 'text-purple-400' },
  { value: 'BLOCKED',     label: 'Blocked',      colorClass: 'text-red-400' },
  { value: 'DONE',        label: 'Done',         colorClass: 'text-emerald-400' },
];

/**
 * TaskStatusSelect Component
 * Accessible dropdown for selecting task status.
 * Covers all 5 statuses defined in the backend schema.
 */
export function TaskStatusSelect({ value, onChange, disabled = false, id }: TaskStatusSelectProps) {
  return (
    <div>
      <label
        htmlFor={id ?? 'task-status-select'}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
      >
        Status
      </label>
      <select
        id={id ?? 'task-status-select'}
        value={value}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Convenience component: renders a styled badge for a given status (no interaction).
 */
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg: Record<TaskStatus, { label: string; className: string }> = {
    TODO:        { label: 'To Do',       className: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
    IN_REVIEW:   { label: 'In Review',   className: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
    BLOCKED:     { label: 'Blocked',     className: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
    DONE:        { label: 'Done',        className: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  };

  const { label, className } = cfg[status] ?? cfg.TODO;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
