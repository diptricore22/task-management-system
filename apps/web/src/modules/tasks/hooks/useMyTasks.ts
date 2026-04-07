'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { TaskDetail } from '../types/tasks.types';

export interface MyTasksGroup {
  projectId: string;
  projectName: string;
  projectColor: string;
  tasks: TaskDetail[];
}

export interface MyTasksResponse {
  tasks: TaskDetail[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UseMyTasksReturn {
  taskGroups: MyTasksGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all tasks assigned to the current user across all projects
 */
export function useMyTasks(): UseMyTasksReturn {
  const [taskGroups, setTaskGroups] = useState<MyTasksGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<MyTasksResponse>('/users/me/tasks');

      // Group tasks by project
      const grouped = response.tasks.reduce((acc, task) => {
        if (!task.project) return acc;

        const projectId = task.project.id;
        let group = acc.find((g) => g.projectId === projectId);

        if (!group) {
          group = {
            projectId: task.project.id,
            projectName: task.project.name,
            projectColor: task.project.color || '#8b5cf6',
            tasks: [],
          };
          acc.push(group);
        }

        group.tasks.push(task);
        return acc;
      }, [] as MyTasksGroup[]);

      // Sort tasks within each group by due date (nulls last), then by priority
      grouped.forEach((group) => {
        group.tasks.sort((a, b) => {
          // Sort by due date first
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;
          if (a.due_date && b.due_date) {
            const dateCompare = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            if (dateCompare !== 0) return dateCompare;
          }

          // Then by priority (CRITICAL > HIGH > MEDIUM > LOW)
          const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
      });

      // Sort groups by project name
      grouped.sort((a, b) => a.projectName.localeCompare(b.projectName));

      setTaskGroups(grouped);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch your tasks');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchMyTasks();
  }, [fetchMyTasks]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  return {
    taskGroups,
    loading,
    error,
    refetch,
  };
}
