'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Label, CreateLabelRequest, UpdateLabelRequest } from '../types/labels.types';
import { createLabelSchema, updateLabelSchema } from '../validations/labels.schema';

interface UseLabelManagementResult {
  // Create form state
  createForm: {
    name: string;
    color: string;
  };
  setCreateFormName: (name: string) => void;
  setCreateFormColor: (color: string) => void;
  clearCreateForm: () => void;

  // Edit form state
  editForm: {
    name: string;
    color: string;
  };
  setEditFormName: (name: string) => void;
  setEditFormColor: (color: string) => void;
  clearEditForm: () => void;

  // Operations
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Methods
  handleCreate: (projectId: string) => Promise<Label | null>;
  handleUpdate: (labelId: string) => Promise<Label | null>;
  handleDelete: (labelId: string) => Promise<boolean>;
  clearErrors: () => void;
}

/**
 * Hook to manage label CRUD operations
 * Handles create, update, and delete with validation and error handling
 */
export function useLabelManagement(): UseLabelManagementResult {
  const [createForm, setCreateForm] = useState({ name: '', color: '#8B5CF6' });
  const [editForm, setEditForm] = useState({ name: '', color: '#8B5CF6' });
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clearErrors = useCallback(() => {
    setCreateError(null);
    setUpdateError(null);
    setDeleteError(null);
  }, []);

  const handleCreate = useCallback(
    async (projectId: string): Promise<Label | null> => {
      setCreateError(null);

      // Validate
      try {
        createLabelSchema.parse(createForm);
      } catch (err) {
        if (err instanceof Error) {
          setCreateError(err.message);
        }
        return null;
      }

      setIsCreating(true);

      try {
        const response = await api.post<Label>(
          `/projects/${projectId}/labels`,
          createForm
        );

        setCreateForm({ name: '', color: '#8B5CF6' }); // Reset form
        return response;
      } catch (err) {
        let message = 'Failed to create label';
        if (err instanceof ApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setCreateError(message);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [createForm]
  );

  const handleUpdate = useCallback(
    async (labelId: string): Promise<Label | null> => {
      setUpdateError(null);

      // Validate
      try {
        updateLabelSchema.parse(editForm);
      } catch (err) {
        if (err instanceof Error) {
          setUpdateError(err.message);
        }
        return null;
      }

      setIsUpdating(true);

      try {
        const response = await api.patch<Label>(
          `/labels/${labelId}`,
          editForm
        );

        setEditForm({ name: '', color: '#8B5CF6' }); // Reset form
        return response;
      } catch (err) {
        let message = 'Failed to update label';
        if (err instanceof ApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setUpdateError(message);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [editForm]
  );

  const handleDelete = useCallback(async (labelId: string): Promise<boolean> => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await api.delete(`/labels/${labelId}`);
      return true;
    } catch (err) {
      let message = 'Failed to delete label';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setDeleteError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createForm,
    setCreateFormName: (name) => setCreateForm((f) => ({ ...f, name })),
    setCreateFormColor: (color) => setCreateForm((f) => ({ ...f, color })),
    clearCreateForm: () => setCreateForm({ name: '', color: '#8B5CF6' }),

    editForm,
    setEditFormName: (name) => setEditForm((f) => ({ ...f, name })),
    setEditFormColor: (color) => setEditForm((f) => ({ ...f, color })),
    clearEditForm: () => setEditForm({ name: '', color: '#8B5CF6' }),

    createError,
    updateError,
    deleteError,
    isCreating,
    isUpdating,
    isDeleting,

    handleCreate,
    handleUpdate,
    handleDelete,
    clearErrors,
  };
}
