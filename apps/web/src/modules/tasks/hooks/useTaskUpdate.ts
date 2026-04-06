'use client';

import { useCallback, useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { updateTaskSchema } from '../validations/tasks.schema';
import type { UpdateTaskFormData } from '../validations/tasks.schema';
import type { Task, TaskStatus, TaskPriority } from '../types/tasks.types';

interface UseTaskUpdateReturn {
  // Form field values
  titleValue: string;
  descriptionValue: string;
  statusValue: TaskStatus;
  priorityValue: TaskPriority;
  dueDateValue: string;
  assigneeIdValue: string;

  // Field-level errors
  titleError: string | null;
  descriptionError: string | null;
  statusError: string | null;
  priorityError: string | null;
  dueDateError: string | null;
  assigneeIdError: string | null;
  formError: string | null;

  // State
  loading: boolean;
  isChanged: boolean;

  // Setters
  setTitleValue: (v: string) => void;
  setDescriptionValue: (v: string) => void;
  setStatusValue: (v: TaskStatus) => void;
  setPriorityValue: (v: TaskPriority) => void;
  setDueDateValue: (v: string) => void;
  setAssigneeIdValue: (v: string) => void;

  // Actions
  handleUpdate: (e?: React.FormEvent) => Promise<Task | null>;
  validateField: (field: keyof UpdateTaskFormData, value: unknown) => boolean;
  clearError: () => void;
}

/**
 * useTaskUpdate Hook
 * Manages update task form state, validation (Zod), and API PATCH submission.
 * Tracks whether any field has changed (isChanged) to prevent no-op requests.
 */
export function useTaskUpdate(
  taskId: string,
  initialTask: Task | null,
  options?: {
    onSuccess?: (task: Task) => void;
    onError?: (error: Error) => void;
  }
): UseTaskUpdateReturn {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [statusValue, setStatusValue] = useState<TaskStatus>('TODO');
  const [priorityValue, setPriorityValue] = useState<TaskPriority>('MEDIUM');
  const [dueDateValue, setDueDateValue] = useState('');
  const [assigneeIdValue, setAssigneeIdValue] = useState('');

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [assigneeIdError, setAssigneeIdError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Hydrate form fields when the initial task is provided or changes
  useEffect(() => {
    if (initialTask) {
      setTitleValue(initialTask.title);
      setDescriptionValue(initialTask.description || '');
      setStatusValue(initialTask.status);
      setPriorityValue(initialTask.priority);
      setDueDateValue(initialTask.due_date || '');
      setAssigneeIdValue(initialTask.assignee_id || '');
    }
  }, [initialTask]);

  // Detect if any field has been changed from the initial task values
  const isChanged = Boolean(
    initialTask &&
      (titleValue !== initialTask.title ||
        descriptionValue !== (initialTask.description || '') ||
        statusValue !== initialTask.status ||
        priorityValue !== initialTask.priority ||
        dueDateValue !== (initialTask.due_date || '') ||
        assigneeIdValue !== (initialTask.assignee_id || ''))
  );

  const validateField = useCallback(
    (field: keyof UpdateTaskFormData, value: unknown): boolean => {
      try {
        (updateTaskSchema as any).pick({ [field]: true }).parse({ [field]: value });
        switch (field) {
          case 'title': setTitleError(null); break;
          case 'description': setDescriptionError(null); break;
          case 'status': setStatusError(null); break;
          case 'priority': setPriorityError(null); break;
          case 'due_date': setDueDateError(null); break;
          case 'assignee_id': setAssigneeIdError(null); break;
        }
        return true;
      } catch (err) {
        if (err instanceof ZodError) {
          const message = err.errors[0]?.message || 'Validation failed';
          switch (field) {
            case 'title': setTitleError(message); break;
            case 'description': setDescriptionError(message); break;
            case 'status': setStatusError(message); break;
            case 'priority': setPriorityError(message); break;
            case 'due_date': setDueDateError(message); break;
            case 'assignee_id': setAssigneeIdError(message); break;
          }
        }
        return false;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setTitleError(null);
    setDescriptionError(null);
    setStatusError(null);
    setPriorityError(null);
    setDueDateError(null);
    setAssigneeIdError(null);
    setFormError(null);
  }, []);

  const handleUpdate = useCallback(
    async (e?: React.FormEvent): Promise<Task | null> => {
      if (e) e.preventDefault();
      if (!isChanged || !initialTask) return null;

      // Validate required fields
      const titleValid = validateField('title', titleValue);
      if (!titleValid) return null;

      setLoading(true);
      setFormError(null);

      // Build diff — only include changed fields
      const updateData: UpdateTaskFormData = {};
      if (titleValue !== initialTask.title) updateData.title = titleValue;
      if (descriptionValue !== (initialTask.description || ''))
        updateData.description = descriptionValue;
      if (statusValue !== initialTask.status) updateData.status = statusValue;
      if (priorityValue !== initialTask.priority) updateData.priority = priorityValue;
      if (dueDateValue !== (initialTask.due_date || ''))
        updateData.due_date = dueDateValue || null;
      if (assigneeIdValue !== (initialTask.assignee_id || ''))
        updateData.assignee_id = assigneeIdValue || undefined;

      try {
        const updatedTask = await api.patch<Task>(`/tasks/${taskId}`, updateData);
        options?.onSuccess?.(updatedTask);
        return updatedTask;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to update task';
        setFormError(errorMessage);
        options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      taskId,
      initialTask,
      isChanged,
      titleValue,
      descriptionValue,
      statusValue,
      priorityValue,
      dueDateValue,
      assigneeIdValue,
      validateField,
      options,
    ]
  );

  return {
    titleValue,
    descriptionValue,
    statusValue,
    priorityValue,
    dueDateValue,
    assigneeIdValue,
    titleError,
    descriptionError,
    statusError,
    priorityError,
    dueDateError,
    assigneeIdError,
    formError,
    loading,
    isChanged,
    setTitleValue,
    setDescriptionValue,
    setStatusValue,
    setPriorityValue,
    setDueDateValue,
    setAssigneeIdValue,
    handleUpdate,
    validateField,
    clearError,
  };
}
