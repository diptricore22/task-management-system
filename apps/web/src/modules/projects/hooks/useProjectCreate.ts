'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { createProjectSchema } from '../validations/projects.schema';
import type { CreateProjectFormData } from '../validations/projects.schema';
import type { Project } from '../types/projects.types';
import { ZodError } from 'zod';

type ProjectApiResponse = Project | { project: Project };

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
  handleCreate: (e?: React.FormEvent) => Promise<boolean>;
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
          createProjectSchema.pick({ name: true }).parse({ name: name.trim() });
          setNameError(null);
          return true;
        } else if (field === 'description') {
          createProjectSchema.pick({ description: true }).parse({ description: description || undefined });
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
    [description, name]
  );

  const handleCreate = useCallback(
    async (e?: React.FormEvent): Promise<boolean> => {
      if (e) {
        e.preventDefault();
      }

      const projectData: CreateProjectFormData = {
        name: name.trim(),
        description: description || undefined,
        color,
      };

      try {
        createProjectSchema.parse(projectData);
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldError = err.errors[0];
          if (fieldError?.path.includes('name')) {
            setNameError(fieldError.message);
          }
          if (fieldError?.path.includes('description')) {
            setDescriptionError(fieldError.message);
          }
          if (fieldError?.path.includes('color')) {
            setColorError(fieldError.message);
          }
        }
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const newProjectResult = await api.post<ProjectApiResponse>('/projects', projectData);
        const newProject =
          'project' in newProjectResult ? newProjectResult.project : newProjectResult;

        router.push(`/projects/${newProject.id}`);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create project';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [name, description, color, router]
  );

  useEffect(() => {
    if (nameError && name.trim().length > 0) {
      setNameError(null);
    }
  }, [name, nameError]);

  useEffect(() => {
    if (descriptionError && description.length > 0) {
      setDescriptionError(null);
    }
  }, [description, descriptionError]);

  useEffect(() => {
    if (colorError && color.length > 0) {
      setColorError(null);
    }
  }, [color, colorError]);

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
