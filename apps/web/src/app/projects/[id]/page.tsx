'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProjectDetailPage } from '@/modules/projects/components/ProjectDetailPage';
import { TaskList } from '@/modules/tasks/components/TaskList';
import { useProject } from '@/modules/projects/hooks/useProject';

function PageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'members' | 'settings'>('tasks');

  const { project, loading, error } = useProject(projectId);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <ProjectDetailPage
      project={project}
      loading={loading}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'tasks' && (
          <TaskList
            projectId={projectId}
            projectMembers={project?.members.map((m) => ({ id: m.id, name: m.name })) || []}
          />
        )}

        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Project Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task Stats */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Task Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Tasks</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{project?.task_stats.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">To Do</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{project?.task_stats.todo || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">In Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{project?.task_stats.in_progress || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Completed</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{project?.task_stats.done || 0}</span>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Project Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Status</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{project?.status || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Members</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{project?.members.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Created</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {project?.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Project Members
            </h3>
            {project?.members && project.members.length > 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {project.members.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{member.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8 text-center text-slate-600 dark:text-slate-400">
                <p>No members found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProjectDetailPage>
  );
}

export default function ProjectDetailRoute() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <PageContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
