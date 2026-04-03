'use client';

import React from 'react';
import { X } from 'lucide-react';
import { StatusFilter } from './StatusFilter';
import { PriorityFilter } from './PriorityFilter';
import { LabelFilter } from './LabelFilter';
import { SortOption, TaskStatus, TaskPriority } from '@/modules/tasks/types/filters.types';
import { Label } from '@/modules/labels/types/labels.types';

interface FilterBarProps {
  // Status
  statuses: TaskStatus[];
  onStatusToggle: (status: TaskStatus) => void;

  // Priority
  priorities: TaskPriority[];
  onPriorityToggle: (priority: TaskPriority) => void;

  // Labels
  selectedLabelIds: string[];
  onLabelToggle: (labelId: string) => void;
  labels: Label[];
  labelsLoading?: boolean;

  // Sort
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;

  // Clear filters
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'due_date_asc', label: 'Due Date (Earliest)' },
  { value: 'priority_desc', label: 'Priority (High→Low)' },
  { value: 'title_asc', label: 'Title (A→Z)' },
];

/**
 * FilterBar component - Main task filtering interface
 * Combines status, priority, labels, and sort controls
 * Shows active filter count and clear all button
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  statuses,
  onStatusToggle,
  priorities,
  onPriorityToggle,
  selectedLabelIds,
  onLabelToggle,
  labels,
  labelsLoading,
  sort,
  onSortChange,
  hasActiveFilters,
  onClearAllFilters,
}) => {
  const totalActiveFilters = (statuses?.length || 0) + (priorities?.length || 0) + (selectedLabelIds?.length || 0);

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white">Filters</h3>
          {totalActiveFilters > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-violet-600 text-white">
              {totalActiveFilters}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2">
        <StatusFilter
          selected={statuses}
          onToggle={onStatusToggle}
        />

        <PriorityFilter
          selected={priorities}
          onToggle={onPriorityToggle}
        />

        <LabelFilter
          selected={selectedLabelIds}
          onToggle={onLabelToggle}
          labels={labels}
          loading={labelsLoading}
        />

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23${
                document.documentElement.classList.contains('dark') ? '9ca3af' : '4b5563'
              }' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              paddingRight: '28px',
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          {totalActiveFilters > 0 && (
            <div>
              {statuses.length > 0 && (
                <div>Status: {statuses.join(', ')}</div>
              )}
              {priorities.length > 0 && (
                <div>Priority: {priorities.join(', ')}</div>
              )}
              {selectedLabelIds.length > 0 && (
                <div>
                  Labels:{' '}
                  {labels
                    .filter((l) => selectedLabelIds.includes(l.id))
                    .map((l) => l.name)
                    .join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
