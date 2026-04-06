'use client';

import React from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types/tasks.types';
import { TaskStatusSelect } from './TaskStatusSelect';
import { TaskPrioritySelect } from './TaskPrioritySelect';

interface TaskMember {
  id: string;
  name: string;
}

interface TaskFormProps {
  /** If provided, the form is in "edit" mode and pre-populates fields */
  task?: Task | null;
  projectMembers?: TaskMember[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;

  // Optional controlled state (used by useTaskCreate / useTaskUpdate hooks)
  formError?: string | null;
  titleError?: string | null;
  descriptionError?: string | null;
}

/**
 * TaskForm Component
 * Reusable create / edit form for a single task.
 * Handles controlled or uncontrolled usage.
 */
export function TaskForm({
  task,
  projectMembers = [],
  onSubmit,
  onCancel,
  loading = false,
  formError,
  titleError,
  descriptionError,
}: TaskFormProps) {
  const isEdit = Boolean(task);

  const [title, setTitle] = React.useState(task?.title ?? '');
  const [description, setDescription] = React.useState(task?.description ?? '');
  const [status, setStatus] = React.useState<TaskStatus>(task?.status ?? 'TODO');
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = React.useState(task?.due_date ?? '');
  const [assigneeId, setAssigneeId] = React.useState(task?.assignee_id ?? '');

  // if initial task changes (e.g. panel opened for different task), re-hydrate
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
      setAssigneeId(task.assignee_id ?? '');
    }
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate || undefined,
      assignee_id: assigneeId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Global error */}
      {formError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {formError}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="task-form-title"
          className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-form-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title…"
          disabled={loading}
          maxLength={255}
          required
          className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            titleError
              ? 'border-red-400 dark:border-red-500'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {titleError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{titleError}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-form-description"
          className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
        >
          Description
        </label>
        <textarea
          id="task-form-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional task description…"
          disabled={loading}
          maxLength={5000}
          rows={3}
          className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none ${
            descriptionError
              ? 'border-red-400 dark:border-red-500'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {descriptionError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{descriptionError}</p>
        )}
      </div>

      {/* Status + Priority grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Show status selector only in edit mode (new tasks start as TODO) */}
        {isEdit && (
          <TaskStatusSelect
            id="task-form-status"
            value={status}
            onChange={setStatus}
            disabled={loading}
          />
        )}

        <div className={isEdit ? '' : 'col-span-2'}>
          <TaskPrioritySelect
            id="task-form-priority"
            value={priority}
            onChange={setPriority}
            disabled={loading}
          />
        </div>
      </div>

      {/* Due date */}
      <div>
        <label
          htmlFor="task-form-due-date"
          className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
        >
          Due Date
        </label>
        <input
          id="task-form-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* Assignee (only when members list is provided) */}
      {projectMembers.length > 0 && (
        <div>
          <label
            htmlFor="task-form-assignee"
            className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
          >
            Assignee
          </label>
          <select
            id="task-form-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">— Unassigned —</option>
            {projectMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving…</span>
            </>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Task'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium text-sm text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
