'use client';

import React from 'react';
import { ColorPicker } from './ColorPicker';

interface LabelFormProps {
  isCreate?: boolean;
  name: string;
  color: string;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

/**
 * LabelForm component - Reusable form for creating/editing labels
 * Handles name input, color selection, validation errors, and submission
 */
export const LabelForm: React.FC<LabelFormProps> = ({
  isCreate = true,
  name,
  color,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
  loading = false,
  error,
}) => {
  const nameError = name.length === 0 ? 'Label name is required' : name.length > 50 ? 'Name must be 50 characters or less' : '';
  const colorError = !/^#[0-9A-Fa-f]{6}$/.test(color) ? 'Invalid hex color' : '';

  const canSubmit = !nameError && !colorError && name.trim().length > 0 && !loading;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Name input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Label Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Bug, Feature, Documentation"
          maxLength={50}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            nameError
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
          } focus:outline-none focus:ring-2 focus:ring-violet-500`}
        />
        <div className="flex justify-between items-center">
          {nameError && (
            <span className="text-xs text-red-600 dark:text-red-400">{nameError}</span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
            {name.length}/50
          </span>
        </div>
      </div>

      {/* Color picker */}
      <ColorPicker
        value={color}
        onChange={onColorChange}
        label="Label Color *"
        error={colorError}
      />

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-1 px-4 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isCreate ? 'Creating...' : 'Updating...'}
            </span>
          ) : isCreate ? (
            'Create Label'
          ) : (
            'Update Label'
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
