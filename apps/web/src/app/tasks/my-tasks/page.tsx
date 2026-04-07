'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useMyTasks } from '@/modules/tasks/hooks/useMyTasks';
import { TaskCard } from '@/modules/tasks/components/TaskCard';
import { TaskDetailPanel } from '@/modules/tasks/components/TaskDetailPanel';
import { DeleteConfirmModal } from '@/modules/tasks/components/DeleteConfirmModal';
import { useTaskDelete } from '@/modules/tasks/hooks/useTaskDelete';
import type { Task } from '@/modules/tasks/types/tasks.types';

function MyTasksContent() {
  const { taskGroups, loading, error, refetch } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const { handleDelete, isDeleting } = useTaskDelete({
    onSuccess: (deletedId) => {
      if (selectedTask?.id === deletedId) setSelectedTask(null);
      setTaskToDelete(null);
      refetch();
    },
  });

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    await handleDelete(taskToDelete.id);
  };

  const handleUpdate = () => {
    refetch();
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  // Calculate statistics
  const totalTasks = taskGroups.reduce((sum, group) => sum + group.tasks.length, 0);
  const todoTasks = taskGroups.reduce(
    (sum, group) => sum + group.tasks.filter((t) => t.status === 'TODO').length,
    0
  );
  const inProgressTasks = taskGroups.reduce(
    (sum, group) => sum + group.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    0
  );
  const doneTasks = taskGroups.reduce(
    (sum, group) => sum + group.tasks.filter((t) => t.status === 'DONE').length,
    0
  );

  // Calculate overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = taskGroups.reduce(
    (sum, group) =>
      sum +
      group.tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < today && t.status !== 'DONE'
      ).length,
    0
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          All tasks assigned to you across projects
        </p>
      </div>

      {/* Statistics Cards */}
      {!loading && totalTasks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalTasks}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              To Do
            </p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-1">
              {todoTasks}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              In Progress
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {inProgressTasks}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Done
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {doneTasks}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Overdue
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{overdueTasks}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-violet-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && totalTasks === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">
            No tasks assigned to you yet
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Tasks assigned to you will appear here
          </p>
        </div>
      )}

      {/* Task Groups */}
      {!loading && !error && taskGroups.length > 0 && (
        <div className="space-y-8">
          {taskGroups.map((group) => (
            <div key={group.projectId} className="space-y-3">
              {/* Project Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: group.projectColor }}
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {group.projectName}
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    ({group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'})
                  </span>
                </h2>
              </div>

              {/* Task Cards */}
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={handleTaskSelect}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task detail slide-over panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectMembers={[]}
          onClose={handleClosePanel}
          onUpdate={handleUpdate}
          onDelete={(taskId) =>
            setTaskToDelete(
              taskGroups
                .flatMap((g) => g.tasks)
                .find((t) => t.id === taskId) ?? null
            )
          }
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        taskTitle={taskToDelete?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
        loading={isDeleting}
      />
    </div>
  );
}

export default function MyTasksPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <MyTasksContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
