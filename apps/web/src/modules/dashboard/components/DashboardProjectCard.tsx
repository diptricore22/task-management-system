'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectHealthCard } from '../types/dashboard.types';

export interface DashboardProjectCardProps {
  project: ProjectHealthCard;
  onClick?: (projectId: string) => void;
}

/**
 * DashboardProjectCard Component
 * Simplified project card for dashboard display
 * Shows completion %, task breakdown, and color indicator
 */
export function DashboardProjectCard({ project, onClick }: DashboardProjectCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(project.id);
    } else {
      router.push(`/projects/${project.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer transition-all"
      style={{ borderTopColor: project.color, borderTopWidth: '4px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {project.name}
        </h3>
        {project.is_completed && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
            Completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {project.percent_complete}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
            style={{ width: `${Math.min(project.percent_complete, 100)}%` }}
          />
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {project.total_tasks}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {project.task_counts.done}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Done</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {project.task_counts.in_progress}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
        </div>
      </div>
    </div>
  );
}
