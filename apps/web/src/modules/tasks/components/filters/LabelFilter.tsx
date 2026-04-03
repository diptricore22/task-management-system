'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/modules/labels/types/labels.types';

interface LabelFilterProps {
  selected: string[];
  onToggle: (labelId: string) => void;
  labels: Label[];
  loading?: boolean;
  disabled?: boolean;
}

/**
 * LabelFilter component - Multi-select dropdown for labels
 * Dynamically populated from project labels
 * OR logic: matches tasks with ANY selected label
 */
export const LabelFilter: React.FC<LabelFilterProps> = ({
  selected,
  onToggle,
  labels,
  loading = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Labels
        {selected.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-violet-600 text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading labels...
            </div>
          ) : labels.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No labels yet
            </div>
          ) : (
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {labels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(label.id)}
                    onChange={() => onToggle(label.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-2 focus:ring-violet-500"
                  />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
