'use client';

import React from 'react';
import type { TaskPriority } from '../types/tasks.types';

interface TaskPrioritySelectProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  disabled?: boolean;
  id?: string;
}

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; icon: string }> = [
  { value: 'LOW',      label: 'Low',      icon: '⚪' },
  { value: 'MEDIUM',   label: 'Medium',   icon: '🟡' },
  { value: 'HIGH',     label: 'High',     icon: '🟠' },
  { value: 'CRITICAL', label: 'Critical', icon: '🔴' },
];

/**
 * TaskPrioritySelect Component
 * Accessible dropdown for selecting task priority.
 * All 4 priority levels with icon indicators for accessibility.
 */
export function TaskPrioritySelect({ value, onChange, disabled = false, id }: TaskPrioritySelectProps) {
  return (
    <div>
      <label
        htmlFor={id ?? 'task-priority-select'}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
      >
        Priority
      </label>
      <select
        id={id ?? 'task-priority-select'}
        value={value}
        onChange={(e) => onChange(e.target.value as TaskPriority)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.icon} {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Convenience component: renders a styled priority indicator (no interaction).
 */
export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg: Record<TaskPriority, { label: string; icon: string; className: string }> = {
    LOW:      { label: 'Low',      icon: '⚪', className: 'text-slate-500 dark:text-slate-400' },
    MEDIUM:   { label: 'Medium',   icon: '🟡', className: 'text-yellow-600 dark:text-yellow-400' },
    HIGH:     { label: 'High',     icon: '🟠', className: 'text-orange-600 dark:text-orange-400' },
    CRITICAL: { label: 'Critical', icon: '🔴', className: 'text-red-600 dark:text-red-400' },
  };

  const { label, icon, className } = cfg[priority] ?? cfg.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
