'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { TaskDetail } from '../types/tasks.types';

export interface UseTaskReturn {
  task: TaskDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTask(
  taskId: string | null | undefined,
  projectId?: string
): UseTaskReturn {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ task: TaskDetail } | TaskDetail>(
        `/tasks/${taskId}`
      );

      const taskData = (response as any).task || response;
      setTask(taskData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch task');
      }
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const refetch = useCallback(async () => {
    await fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, error, refetch };
}
