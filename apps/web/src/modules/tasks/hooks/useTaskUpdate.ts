import { useState } from 'react';
import { Task } from '../types/tasks.types';

interface UseTaskUpdateOptions {
  onSuccess?: (task: Task) => void;
  onError?: (error: Error) => void;
}

export function useTaskUpdate(options?: UseTaskUpdateOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement task update logic
      options?.onSuccess?.(data as Task);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMsg);
      options?.onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
}
