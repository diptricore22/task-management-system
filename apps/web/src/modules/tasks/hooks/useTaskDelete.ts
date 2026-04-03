import { useState } from 'react';

interface UseTaskDeleteOptions {
  onSuccess?: (taskId: string) => void;
  onError?: (error: Error) => void;
}

export function useTaskDelete(options?: UseTaskDeleteOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement task deletion logic
      options?.onSuccess?.(taskId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMsg);
      options?.onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
}
