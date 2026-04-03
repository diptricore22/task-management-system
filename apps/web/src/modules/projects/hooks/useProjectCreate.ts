'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { createProjectSchema } from '../validations/projects.schema';
import type { CreateProjectFormData } from '../validations/projects.schema';
import type { Project } from '../types/projects.types';
import { ZodError } from 'zod';

interface UseProjectCreateReturn {
  name: string;
  description: string;
  color: string;
  loading: boolean;
  error: string | null;
  nameError: string | null;
  descriptionError: string | null;
  colorError: string | null;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setColor: (color: string) => void;
  handleCreate: (e?: React.FormEvent) => Promise<void>;
  clearError: () => void;
  validateField: (field: 'name' | 'description' | 'color') => boolean;
}

/**
 * useProjectCreate Hook
 * Manages create project form state, validation, and submission
 */
export function useProjectCreate(): UseProjectCreateReturn {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5cf6'); // Default purple from design
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);

  const validateField = useCallback(
    (field: 'name' | 'description' | 'color'): boolean => {
      try {
        if (field === 'name') {
          createProjectSchema.pick({ name: true }).parse({ name });
          setNameError(null);
          return true;
        } else if (field === 'description') {
          createProjectSchema.pick({ description: true }).parse({ description });
          setDescriptionError(null);
          return true;
        } else if (field === 'color') {
          createProjectSchema.pick({ color: true }).parse({ color });
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

  const handleCreate = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Validate all fields
      const nameValid = validateField('name');
      const colorValid = validateField('color');

      if (!nameValid || !colorValid) {
        return;
      }

      setLoading(true);
      setError(null);

      const projectData: CreateProjectFormData = {
        name,
        description: description || undefined,
        color,
      };

      try {
        const newProject = await api.post<Project>('/projects', projectData);
        // Redirect to project detail page
        router.push(`/projects/${newProject.id}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create project';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [name, description, color, router, validateField]
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
    handleCreate,
    clearError,
    validateField,
  };
}
