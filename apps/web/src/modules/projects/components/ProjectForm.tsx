'use client';

import { useEffect } from 'react';
import { Alert } from '@/components/common/Alert';
import type { Project } from '../types/projects.types';
import type { CreateProjectFormData, UpdateProjectFormData } from '../validations/projects.schema';

interface ProjectFormProps {
  initialValues?: Project;
  onSubmit: (data: CreateProjectFormData | UpdateProjectFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  nameValue: string;
  descriptionValue: string;
  colorValue: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  nameError?: string | null;
  descriptionError?: string | null;
  colorError?: string | null;
  onClearError?: () => void;
  onBlurField?: (field: 'name' | 'description' | 'color') => void;
  submitButtonText?: string;
}

/**
 * ProjectForm Component
 * Reusable form for creating/editing projects
 * Used in both CreateProjectModal and ProjectSettingsPage
 */
export function ProjectForm({
  initialValues,
  onSubmit,
  loading,
  error,
  nameValue,
  descriptionValue,
  colorValue,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  nameError,
  descriptionError,
  colorError,
  onClearError,
  onBlurField,
  submitButtonText = initialValues ? 'Save Changes' : 'Create Project',
}: ProjectFormProps) {
  const isEditing = !!initialValues;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: nameValue,
      description: descriptionValue || undefined,
      color: colorValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          visible={!!error}
          onDismiss={onClearError}
          autoHideDuration={5000}
        />
      )}

      {/* Project Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => onBlurField?.('name')}
          placeholder="Enter project name"
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
            nameError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500'
          } focus:outline-none focus:ring-1`}
        />
        {nameError && (
          <p className="mt-1 text-sm text-red-500">{nameError}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Description <span className="text-slate-400">(Optional)</span>
        </label>
        <textarea
          id="description"
          value={descriptionValue}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onBlur={() => onBlurField?.('description')}
          placeholder="Enter project description"
          disabled={loading}
          rows={3}
          className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition resize-none ${
            descriptionError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500'
          } focus:outline-none focus:ring-1`}
        />
        {descriptionError && (
          <p className="mt-1 text-sm text-red-500">{descriptionError}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Max 1000 characters</p>
      </div>

      {/* Color Picker */}
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Project Color <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          {/* Color preview */}
          <div
            className="w-16 h-16 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm"
            style={{ backgroundColor: colorValue }}
          />
          {/* Hex input */}
          <input
            id="color"
            type="text"
            value={colorValue}
            onChange={(e) => onColorChange(e.target.value)}
            onBlur={() => onBlurField?.('color')}
            placeholder="#8b5cf6"
            disabled={loading}
            maxLength={7}
            className={`flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition font-mono uppercase ${
              colorError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-500'
            } focus:outline-none focus:ring-1`}
          />
        </div>
        {colorError && (
          <p className="mt-1 text-sm text-red-500">{colorError}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Hex format: #RRGGBB (e.g., #8b5cf6)
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{isEditing ? 'Saving...' : 'Creating...'}</span>
          </>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
}
