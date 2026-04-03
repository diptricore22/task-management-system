'use client';

import { ProjectCard } from './ProjectCard';
import type { Project } from '../types/projects.types';

interface ProjectListProps {
  projects: Project[];
  filter: 'all' | 'active' | 'archived';
  setFilter: (filter: 'all' | 'active' | 'archived') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  onCreateClick: () => void;
}

/**
 * ProjectList Component
 * Main list component with filtering, search, and grid layout
 */
export function ProjectList({
  projects,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  loading,
  onCreateClick,
}: ProjectListProps) {
  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Box */}
        <div className="flex-1 relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'active', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition capitalize ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {hasProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {searchQuery
              ? 'No projects match your search'
              : 'Get started by creating your first project to organize and track your team\'s work'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateClick}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition flex items-center justify-center gap-2 mx-auto"
            >
              <span>+</span>
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
