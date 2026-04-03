'use client';

import Link from 'next/link';
import type { Project } from '../types/projects.types';

interface ProjectCardProps {
  project: Project;
}

/**
 * ProjectCard Component
 * Displays a single project in grid/card layout
 * Shows: name, description, color, task stats, member count
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const completionPercentage =
    project.task_stats.total > 0
      ? Math.round(
          (project.task_stats.done / project.task_stats.total) * 100
        )
      : 0;

  const isArchived = project.status === 'ARCHIVED';

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        className={`relative overflow-hidden rounded-lg border transition-all hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer group ${
          isArchived
            ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }`}
        style={{
          borderTopColor: project.color,
          borderTopWidth: '4px',
        }}
      >
        <div className="p-6">
          {/* Header with title and status badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold truncate ${
                  isArchived
                    ? 'text-slate-600 dark:text-slate-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {project.name}
              </h3>
            </div>
            <span
              className={`ml-2 whitespace-nowrap px-2.5 py-1 rounded text-xs font-medium ${
                isArchived
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isArchived ? 'Archived' : 'Active'}
            </span>
          </div>

          {/* Description */}
          {project.description && (
            <p
              className={`text-sm line-clamp-2 mb-4 ${
                isArchived
                  ? 'text-slate-500 dark:text-slate-500'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {project.description}
            </p>
          )}

          {/* Progress bar */}
          {project.task_stats.total > 0 && (
            <div className="mb-4">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${completionPercentage}%`,
                    backgroundColor: project.color,
                  }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {project.task_stats.total}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Tasks
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {project.task_stats.done}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {completionPercentage}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Progress
              </div>
            </div>
          </div>

          {/* Member count */}
          <div className="text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
            {project.member_count} {project.member_count === 1 ? 'member' : 'members'}
          </div>
        </div>
      </div>
    </Link>
  );
}
