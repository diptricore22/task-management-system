'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectAdminOverview } from '../types/dashboard.types';

export interface ProjectHealthTableProps {
  projects: ProjectAdminOverview[];
  loading: boolean;
}

type SortField =  | 'project_name'
  | 'total_tasks'
  | 'blocked_count'
  | 'overdue_count';

/**
 * ProjectHealthTable Component
 * Admin-only table showing project health overview
 * With sortable columns and health indicators
 */
export function ProjectHealthTable({ projects, loading }: ProjectHealthTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('project_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    aVal = aVal as number;
    bVal = bVal as number;
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getHealthIndicator = (indicator: 'red' | 'yellow' | 'green') => {
    const icons = {
      red: '🔴',
      yellow: '🟡',
      green: '🟢',
    };
    return icons[indicator];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th
                onClick={() => handleSort('project_name')}
                className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Project {sortField === 'project_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('total_tasks')}
                className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Total {sortField === 'total_tasks' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                Done
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                In Progress
              </th>
              <th
                onClick={() => handleSort('blocked_count')}
                className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Blocked {sortField === 'blocked_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('overdue_count')}
                className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Overdue {sortField === 'overdue_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                Health
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedProjects.map((project) => (
              <tr
                key={project.project_id}
                onClick={() => router.push(`/projects/${project.project_id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {project.project_name}
                </td>
                <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                  {project.total_tasks}
                </td>
                <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">
                  {project.done_count}
                </td>
                <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400 font-medium">
                  {project.in_progress_count}
                </td>
                <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">
                  {project.blocked_count}
                </td>
                <td className="px-4 py-3 text-center text-orange-600 dark:text-orange-400 font-medium">
                  {project.overdue_count}
                </td>
                <td className="px-4 py-3 text-center text-xl">
                  {getHealthIndicator(project.health_indicator)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
