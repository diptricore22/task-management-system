'use client';

import { useCallback, useState } from 'react';
import { ZodError } from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { createTaskSchema } from '../validations/tasks.schema';
import type { CreateTaskFormData } from '../validations/tasks.schema';
import type { Task } from '../types/tasks.types';

export interface UseTaskCreateReturn {
  // Form values
  titleValue: string;
  descriptionValue: string;
  priorityValue: string;
  assigneeIdValue: string;
  dueDateValue: string;

  // Error states
  titleError: string | null;
  descriptionError: string | null;
  priorityError: string | null;
  assigneeIdError: string | null;
  dueDateError: string | null;
  formError: string | null;

  // States
  loading: boolean;

  // Handlers
  setTitleValue: (value: string) => void;
  setDescriptionValue: (value: string) => void;
  setPriorityValue: (value: string) => void;
  setAssigneeIdValue: (value: string) => void;
  setDueDateValue: (value: string) => void;

  validateField: (field: keyof CreateTaskFormData, value: unknown) => boolean;
  clearError: (field: keyof CreateTaskFormData) => void;
  clearAllErrors: () => void;
  handleCreate: (projectId: string) => Promise<Task | null>;
  reset: () => void;
}

export function useTaskCreate(): UseTaskCreateReturn {
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [priorityValue, setPriorityValue] = useState('MEDIUM');
  const [assigneeIdValue, setAssigneeIdValue] = useState('');
  const [dueDateValue, setDueDateValue] = useState('');

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [assigneeIdError, setAssigneeIdError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const validateField = useCallback((field: keyof CreateTaskFormData, value: unknown): boolean => {
    try {
      const schema = createTaskSchema.pick({ [field]: true });
      schema.parse({ [field]: value });

      switch (field) {
        case 'title':
          setTitleError(null);
          break;
        case 'description':
          setDescriptionError(null);
          break;
        case 'priority':
          setPriorityError(null);
          break;
        case 'assignee_id':
          setAssigneeIdError(null);
          break;
        case 'due_date':
          setDueDateError(null);
          break;
      }
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors[0]?.message || 'Validation failed';
        switch (field) {
          case 'title':
            setTitleError(message);
            break;
          case 'description':
            setDescriptionError(message);
            break;
          case 'priority':
            setPriorityError(message);
            break;
          case 'assignee_id':
            setAssigneeIdError(message);
            break;
          case 'due_date':
            setDueDateError(message);
            break;
        }
      }
      return false;
    }
  }, []);

  const clearError = useCallback((field: keyof CreateTaskFormData) => {
    switch (field) {
      case 'title':
        setTitleError(null);
        break;
      case 'description':
        setDescriptionError(null);
        break;
      case 'priority':
        setPriorityError(null);
        break;
      case 'assignee_id':
        setAssigneeIdError(null);
        break;
      case 'due_date':
        setDueDateError(null);
        break;
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setTitleError(null);
    setDescriptionError(null);
    setPriorityError(null);
    setAssigneeIdError(null);
    setDueDateError(null);
    setFormError(null);
  }, []);

  const reset = useCallback(() => {
    setTitleValue('');
    setDescriptionValue('');
    setPriorityValue('MEDIUM');
    setAssigneeIdValue('');
    setDueDateValue('');
    clearAllErrors();
  }, [clearAllErrors]);

  const handleCreate = useCallback(
    async (projectId: string): Promise<Task | null> => {
      clearAllErrors();
      setLoading(true);

      try {
        const formData: CreateTaskFormData = {
          title: titleValue,
          description: descriptionValue || undefined,
          priority: (priorityValue as any) || 'MEDIUM',
          due_date: dueDateValue || undefined,
          assignee_id: assigneeIdValue || undefined,
        };

        const validatedData = createTaskSchema.parse(formData);

        const newTask = await api.post<Task>(
          `/projects/${projectId}/tasks`,
          validatedData
        );

        reset();
        return newTask;
      } catch (error) {
        if (error instanceof ZodError) {
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof CreateTaskFormData;
            const message = err.message;
            switch (field) {
              case 'title':
                setTitleError(message);
                break;
              case 'description':
                setDescriptionError(message);
                break;
              case 'priority':
                setPriorityError(message);
                break;
              case 'assignee_id':
                setAssigneeIdError(message);
                break;
              case 'due_date':
                setDueDateError(message);
                break;
            }
          });
        } else if (error instanceof ApiError) {
          setFormError(error.message);
        } else {
          setFormError(error instanceof Error ? error.message : 'Failed to create task');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [titleValue, descriptionValue, priorityValue, assigneeIdValue, dueDateValue, clearAllErrors, reset]
  );

  return {
    titleValue,
    descriptionValue,
    priorityValue,
    assigneeIdValue,
    dueDateValue,
    titleError,
    descriptionError,
    priorityError,
    assigneeIdError,
    dueDateError,
    formError,
    loading,
    setTitleValue,
    setDescriptionValue,
    setPriorityValue,
    setAssigneeIdValue,
    setDueDateValue,
    validateField,
    clearError,
    clearAllErrors,
    handleCreate,
    reset,
  };
}
