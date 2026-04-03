'use client';

import { useEffect } from 'react';
import { ProjectForm } from './ProjectForm';
import { useProjectCreate } from '../hooks/useProjectCreate';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * CreateProjectModal Component
 * Modal wrapper around ProjectForm for creating new projects
 */
export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    loading,
    error,
    nameError,
    descriptionError,
    colorError,
    handleCreate,
    clearError,
    validateField,
  } = useProjectCreate();

  const handleSubmitAndClose = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      await handleCreate(e);
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the hook
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create New Project
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none disabled:opacity-50"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <ProjectForm
              onSubmit={handleSubmitAndClose}
              loading={loading}
              error={error}
              nameValue={name}
              descriptionValue={description}
              colorValue={color}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onColorChange={setColor}
              nameError={nameError}
              descriptionError={descriptionError}
              colorError={colorError}
              onClearError={clearError}
              onBlurField={validateField}
              submitButtonText="Create Project"
            />
          </div>
        </div>
      </div>
    </>
  );
}
