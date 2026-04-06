'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useDashboardSummary } from '@/modules/dashboard/hooks/useDashboardSummary';
import { useDashboardProjects } from '@/modules/dashboard/hooks/useDashboardProjects';
import { useDashboardActivity } from '@/modules/dashboard/hooks/useDashboardActivity';
import { useDashboardAdminOverview } from '@/modules/dashboard/hooks/useDashboardAdminOverview';
import { StatCard } from '@/modules/dashboard/components/StatCard';
import { DashboardProjectCard } from '@/modules/dashboard/components/DashboardProjectCard';
import { ActivityFeed } from '@/modules/dashboard/components/ActivityFeed';
import { ProjectHealthTable } from '@/modules/dashboard/components/ProjectHealthTable';

function DashboardContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Fetch all dashboard data
  const { summary, loading: summaryLoading } = useDashboardSummary();
  const { projects, loading: projectsLoading } = useDashboardProjects();
  const { activities, hasMore, loadMore, loading: activityLoading } = useDashboardActivity();
  const { projects: adminProjects, loading: adminLoading } = useDashboardAdminOverview();

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome to your task management dashboard
          </p>
        </div>

        {/* Admin Project Health Table */}
        {isAdmin && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Project Health Overview
            </h2>
            <ProjectHealthTable projects={adminProjects} loading={adminLoading} />
          </section>
        )}

        {/* Stats Cards Row */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Due Today"
              value={summary?.due_today_count ?? '--'}
              color="blue"
              subtitle={summaryLoading ? 'Loading...' : undefined}
            />
            <StatCard
              label="Overdue"
              value={
                summary?.overdue_empty
                  ? 'All caught up! 🎉'
                  : summary?.overdue_count ?? '--'
              }
              color="red"
              subtitle={summaryLoading ? 'Loading...' : undefined}
            />
            <StatCard
              label="In Progress"
              value={summary?.in_progress_count ?? '--'}
              color="yellow"
              subtitle={summaryLoading ? 'Loading...' : undefined}
            />
          </div>
        </section>

        {/* Two-Column Layout: Projects + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Projects */}
          <section className="lg:col-span-7">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              My Projects
            </h2>
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
                  >
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No projects yet. Create your first project to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <DashboardProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Recent Activity */}
          <section className="lg:col-span-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <ActivityFeed
              activities={activities}
              hasMore={hasMore}
              onLoadMore={loadMore}
              loading={activityLoading}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
