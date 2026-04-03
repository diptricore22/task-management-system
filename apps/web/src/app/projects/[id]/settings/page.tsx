'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProjectSettingsPage } from '@/modules/projects/components/ProjectSettingsPage';
import { useProject } from '@/modules/projects/hooks/useProject';

function PageContent() {
  const params = useParams();
  const projectId = params.id as string;

  const { project, loading, error } = useProject(projectId);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
      </div>
    );
  }

  return <ProjectSettingsPage project={project} loading={loading} />;
}

export default function ProjectSettingsPageRoute() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <PageContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
