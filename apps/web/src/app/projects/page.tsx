'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProjectList } from '@/modules/projects/components/ProjectList';
import { CreateProjectModal } from '@/modules/projects/components/CreateProjectModal';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProjectList } from '@/modules/projects/hooks/useProjectList';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

function PageContent() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    projects,
    loading,
    error,
    pagination,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch,
    clearError,
  } = useProjectList();

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage and organize your projects
          </p>
        </div>

        {/* Create Project Button */}
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 dark:text-red-400">❌</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} height="h-48" />
          ))}
        </div>
      ) : (
        /* Project List */
        <ProjectList
          projects={projects}
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <PageContent />
      </AppLayout>
    </ProtectedRoute>
  );
}