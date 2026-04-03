'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Task } from '../types/tasks.types';
import { TaskForm } from './TaskForm';
import { CommentSection } from '@/modules/comments/components/CommentSection';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose?: () => void;
  onUpdate?: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

type TabType = 'details' | 'comments';

const TAB_CONFIG: { id: TabType; name: string }[] = [
  { id: 'details', name: 'Details' },
  { id: 'comments', name: 'Comments' },
];

export function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) {
    return null;
  }

  const handleSubmit = async (data: Partial<Task>) => {
    setLoading(true);
    try {
      await onUpdate?.({ ...task, ...data });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {task.title}
        </h2>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 gap-0">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto">
            {isEditing ? (
              <div className="p-6">
                <TaskForm
                  task={task}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsEditing(false)}
                  loading={loading}
                />
              </div>
            ) : (
              <>
                <div className="px-6 py-4 space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                        {task.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Priority
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                        {task.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Created
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Updated
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(task.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Description
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(task.id)}
                    className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'comments' && <CommentSection taskId={task?.id} />}
      </div>
    </div>
  );
}
