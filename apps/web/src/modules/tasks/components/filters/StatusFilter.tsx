'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TaskStatus } from '@/modules/tasks/types/filters.types';

interface StatusFilterProps {
  selected: TaskStatus[];
  onToggle: (status: TaskStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'TODO', label: 'To Do', color: 'slate' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'purple' },
  { value: 'BLOCKED', label: 'Blocked', color: 'red' },
  { value: 'DONE', label: 'Done', color: 'green' },
];

/**
 * StatusFilter component - Multi-select dropdown for task status
 * OR logic: matches tasks with ANY selected status
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  selected,
  onToggle,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Status
        {selected.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-violet-600 text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
