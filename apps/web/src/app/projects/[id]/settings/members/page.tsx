'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useProject } from '@/modules/projects/hooks/useProject';
import { useProjectMembers } from '@/modules/members/hooks/useProjectMembers';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { MemberList } from '@/modules/members/components/MemberList';
import { AddMemberModal } from '@/modules/members/components/AddMemberModal';

function PageContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [showAddModal, setShowAddModal] = useState(false);

  const { project, loading: projectLoading, error: projectError } = useProject(projectId);
  const { members, loading: membersLoading, error: membersError, refetch } = useProjectMembers(projectId);
  const { user } = useAuth();

  const handleMemberAdded = () => {
    refetch();
  };

  const handleMemberRemoved = () => {
    refetch();
  };

  const handleMemberRoleUpdated = () => {
    refetch();
  };

  if (projectError || membersError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 font-medium">
          Error: {projectError || membersError}
        </p>
      </div>
    );
  }

  if (projectLoading) {
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Project Members
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage who has access to "{project.name}"
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add Member
        </button>
      </div>

      {/* Member List */}
      {membersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <MemberList
          projectId={projectId}
          members={members}
          currentUserId={user?.id}
          onMemberRemoved={handleMemberRemoved}
          onMemberRoleUpdated={handleMemberRoleUpdated}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        projectId={projectId}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleMemberAdded}
        existingMemberIds={members.map((m) => m.id)}
      />
    </div>
  );
}

export default function ProjectMembersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AppLayout>
        <PageContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
