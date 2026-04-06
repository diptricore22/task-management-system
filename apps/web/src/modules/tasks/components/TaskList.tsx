'use client';

import React, { useState, useCallback } from 'react';
import { useTaskList } from '../hooks/useTaskList';
import { useTaskCreate } from '../hooks/useTaskCreate';
import { useTaskDelete } from '../hooks/useTaskDelete';
import { TaskCard } from './TaskCard';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskForm } from './TaskForm';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { Task } from '../types/tasks.types';
import type { TaskStatus } from '../types/tasks.types';

export interface TaskListProps {
  projectId: string;
  projectMembers?: Array<{ id: string; name: string }>;
}

const STATUS_FILTERS: Array<{ value: 'all' | TaskStatus; label: string }> = [
  { value: 'all',         label: 'All' },
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW',   label: 'In Review' },
  { value: 'BLOCKED',     label: 'Blocked' },
  { value: 'DONE',        label: 'Done' },
];

/**
 * TaskList Component
 * Main task management view for a project.
 *
 * Features:
 * - Task creation (inline form, toggle with "+ Add Task" button)
 * - Task list with status-filter tabs
 * - Pagination (previous/next)
 * - Click-to-open task detail panel (slide-over)
 * - Inline status update from card
 * - Delete with confirmation modal
 */
export const TaskList: React.FC<TaskListProps> = ({ projectId, projectMembers = [] }) => {
  // ── Create form state ─────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ── Detail panel state ────────────────────────────────────────────
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ── Delete modal state ────────────────────────────────────────────
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // ── Status filter ─────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  // ── Hooks ─────────────────────────────────────────────────────────
  const { tasks, loading, error, pagination, setPage, setFilters, refetch } = useTaskList(projectId);

  const createHook = useTaskCreate();

  const { handleDelete, isDeleting } = useTaskDelete({
    onSuccess: (deletedId) => {
      // Clear detail panel if the deleted task was open
      if (selectedTask?.id === deletedId) setSelectedTask(null);
      setTaskToDelete(null);
      refetch();
    },
  });


  // ── Handlers ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateSubmit = useCallback(
    async (_data: Record<string, unknown>) => {
      const created = await createHook.handleCreate(projectId);
      if (created) {
        setShowCreateForm(false);
        refetch();
      }
    },
    [createHook, projectId, refetch]
  );

  const handleTaskSelect = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleDeleteRequest = useCallback((task: Task) => {
    setTaskToDelete(task);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!taskToDelete) return;
    await handleDelete(taskToDelete.id);
  }, [taskToDelete, handleDelete]);

  const handleUpdateFromPanel = useCallback(
    (_updated: Task) => {
      // Panel has already applied the update; refresh list from API
      refetch();
    },
    [refetch]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatusFilter(f.value);
                setFilters({ status: f.value === 'all' ? undefined : f.value });
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Add task button */}
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add Task
        </button>
      </div>

      {/* Create task form (inline, collapsible) */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            New Task
          </h3>
          <TaskForm
            projectMembers={projectMembers}
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
            loading={createHook.loading}
            formError={createHook.formError}
            titleError={createHook.titleError}
            descriptionError={createHook.descriptionError}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Task list */}
      {!loading && !error && (
        <>
          {tasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {statusFilter === 'all'
                  ? 'No tasks yet — add your first task'
                  : `No tasks with status "${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}"`}
              </p>
              {statusFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="mt-3 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={handleTaskSelect}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task detail slide-over panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectMembers={projectMembers}
          onClose={handleClosePanel}
          onUpdate={handleUpdateFromPanel}
          onDelete={(taskId) =>
            setTaskToDelete(tasks.find((t) => t.id === taskId) ?? null)
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
};
