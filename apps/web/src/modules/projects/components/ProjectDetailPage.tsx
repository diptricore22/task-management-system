'use client';

import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { ProjectDetail } from '../types/projects.types';

interface ProjectDetailPageProps {
  project: ProjectDetail | null;
  loading: boolean;
  activeTab?: 'tasks' | 'overview' | 'members' | 'settings';
  onTabChange?: (tab: 'tasks' | 'overview' | 'members' | 'settings') => void;
  children?: React.ReactNode;
}

/**
 * ProjectDetailPage Component
 * Shows project header, breadcrumb, tabs, and content area
 * Used in /projects/[id] route
 */
export function ProjectDetailPage({
  project,
  loading,
  activeTab = 'tasks',
  onTabChange,
  children,
}: ProjectDetailPageProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Project not found</p>
      </div>
    );
  }

  const completionPercentage =
    project.task_stats.total > 0
      ? Math.round((project.task_stats.done / project.task_stats.total) * 100)
      : 0;

  const isArchived = project.status === 'ARCHIVED';

  const tabs = [
    { id: 'tasks' as const, name: 'Tasks' },
    { id: 'overview' as const, name: 'Overview' },
    { id: 'members' as const, name: 'Members' },
    { id: 'settings' as const, name: 'Settings', adminOnly: true },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/dashboard" className="hover:text-violet-600 dark:hover:text-violet-400">
          Dashboard
        </Link>
        <span>›</span>
        <Link href="/projects" className="hover:text-violet-600 dark:hover:text-violet-400">
          Projects
        </Link>
        <span>›</span>
        <span className="text-slate-900 dark:text-white font-medium">{project.name}</span>
      </nav>

      {/* Archived Banner */}
      {isArchived && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
          <span className="text-amber-600 dark:text-amber-400 text-lg">📦</span>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            This project is archived and appears read-only. Only admins can restore it.
          </p>
        </div>
      )}

      {/* Project Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Color indicator */}
          <div
            className="w-1 h-12 rounded"
            style={{ backgroundColor: project.color }}
          />
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-2 ${
              isArchived ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
            }`}>
              {project.name}
            </h1>
            {project.description && (
              <p className={`text-sm ${
                isArchived ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'
              }`}>
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {project.task_stats.total > 0 && (
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${completionPercentage}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white min-w-[40px]">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tasks
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {project.task_stats.done}/{project.task_stats.total} completed
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Members
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {project.members.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-6 -mb-px">
          {tabs.map((tab) => {
            if (tab.adminOnly && !isAdmin) return null;

            const isActive = activeTab === tab.id;
            const href =
              tab.id === 'settings'
                ? `/projects/${project.id}/settings`
                : `#tab-${tab.id}`;

            const content = (
              <div
                onClick={(e) => {
                  if (tab.id !== 'settings') {
                    e.preventDefault();
                    onTabChange?.(tab.id);
                  }
                }}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.name}
              </div>
            );

            if (tab.id === 'settings') {
              return (
                <Link key={tab.id} href={href}>
                  {content}
                </Link>
              );
            }

            return <div key={tab.id}>{content}</div>;
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
