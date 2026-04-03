'use client';

import { useCallback, useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { updateProjectSchema } from '../validations/projects.schema';
import type { UpdateProjectFormData } from '../validations/projects.schema';
import type { Project } from '../types/projects.types';
import { ZodError } from 'zod';

interface UseProjectUpdateReturn {
  name: string;
  description: string;
  color: string;
  loading: boolean;
  error: string | null;
  nameError: string | null;
  descriptionError: string | null;
  colorError: string | null;
  isChanged: boolean;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setColor: (color: string) => void;
  handleUpdate: (e?: React.FormEvent) => Promise<void>;
  clearError: () => void;
  validateField: (field: 'name' | 'description' | 'color') => boolean;
}

/**
 * useProjectUpdate Hook
 * Manages update project form state, validation, and submission
 */
export function useProjectUpdate(
  projectId: string,
  initialProject: Project | null
): UseProjectUpdateReturn {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);

  // Initialize form with project data
  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
      setColor(initialProject.color);
    }
  }, [initialProject]);

  // Check if form has changed
  const isChanged =
    initialProject &&
    (name !== initialProject.name ||
      description !== (initialProject.description || '') ||
      color !== initialProject.color);

  const validateField = useCallback(
    (field: 'name' | 'description' | 'color'): boolean => {
      try {
        if (field === 'name') {
          updateProjectSchema.pick({ name: true }).parse({ name });
          setNameError(null);
          return true;
        } else if (field === 'description') {
          updateProjectSchema.pick({ description: true }).parse({ description });
          setDescriptionError(null);
          return true;
        } else if (field === 'color') {
          updateProjectSchema.pick({ color: true }).parse({ color });
          setColorError(null);
          return true;
        }
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldError = err.errors[0]?.message;
          if (field === 'name') {
            setNameError(fieldError || null);
          } else if (field === 'description') {
            setDescriptionError(fieldError || null);
          } else if (field === 'color') {
            setColorError(fieldError || null);
          }
        }
        return false;
      }
      return true;
    },
    []
  );

  const handleUpdate = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!isChanged) {
        return;
      }

      // Validate relevant fields
      const nameValid = !name || validateField('name');
      const colorValid = !color || validateField('color');

      if (!nameValid || !colorValid) {
        return;
      }

      setLoading(true);
      setError(null);

      const updateData: UpdateProjectFormData = {};
      if (initialProject) {
        if (name !== initialProject.name) updateData.name = name;
        if (description !== (initialProject.description || ''))
          updateData.description = description;
        if (color !== initialProject.color) updateData.color = color;
      }

      try {
        await api.patch<Project>(`/projects/${projectId}`, updateData);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update project';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [projectId, initialProject, name, description, color, isChanged, validateField]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
    isChanged: isChanged || false,
    handleUpdate,
    clearError,
    validateField,
  };
}
