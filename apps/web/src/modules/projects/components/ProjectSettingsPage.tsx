'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/common/Alert';
import { ProjectForm } from './ProjectForm';
import { ArchiveConfirmModal } from './ArchiveConfirmModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useProjectUpdate } from '../hooks/useProjectUpdate';
import { useProjectDelete } from '../hooks/useProjectDelete';
import { api } from '@/lib/api-client';
import type { ProjectDetail } from '../types/projects.types';

interface ProjectSettingsPageProps {
  project: ProjectDetail | null;
  loading: boolean;
}

/**
 * ProjectSettingsPage Component
 * Allows editing project details and performing admin actions (archive/delete)
 * Used in /projects/[id]/settings route
 */
export function ProjectSettingsPage({
  project,
  loading: initialLoading,
}: ProjectSettingsPageProps) {
  const router = useRouter();
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    loading: updateLoading,
    error: updateError,
    nameError,
    descriptionError,
    colorError,
    isChanged,
    handleUpdate,
    clearError: clearUpdateError,
    validateField,
  } = useProjectUpdate(project?.id || '', project || null);

  const { isDeleting, handleDelete } = useProjectDelete();

  const handleArchive = async () => {
    if (!project) return;

    setArchiveLoading(true);
    try {
      await api.patch(`/projects/${project.id}/archive`, {
        archived: true,
      });
      setShowArchiveModal(false);
      // Redirect back to project list after archiving
      router.push('/projects?status=archived');
    } catch (error) {
      console.error('Failed to archive project:', error);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    try {
      await handleDelete(project.id);
      setShowDeleteModal(false);
      // Redirect to projects list after deletion
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const onSubmit = async () => {
    await handleUpdate();
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  if (initialLoading) {
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

  const isArchived = project.status === 'ARCHIVED';

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {updateSuccess && (
        <Alert
          type="success"
          message="Project updated successfully"
          visible={updateSuccess}
          autoHideDuration={3000}
        />
      )}

      {/* Edit Project Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Project Details
        </h3>

        <ProjectForm
          initialValues={project}
          onSubmit={onSubmit}
          loading={updateLoading}
          error={updateError}
          nameValue={name}
          descriptionValue={description}
          colorValue={color}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onColorChange={setColor}
          nameError={nameError}
          descriptionError={descriptionError}
          colorError={colorError}
          onClearError={clearUpdateError}
          onBlurField={validateField}
          submitButtonText={isChanged ? 'Save Changes' : 'No Changes'}
        />
      </div>

      {/* Danger Zone - Only for non-archived projects */}
      {!isArchived && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-red-200 dark:border-red-900 p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            These actions are irreversible. Please be careful.
          </p>

          <div className="space-y-4">
            {/* Archive Button */}
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Archive this project
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  The project will be hidden from your active list
                </p>
              </div>
              <button
                onClick={() => setShowArchiveModal(true)}
                disabled={archiveLoading}
                className="px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
              >
                Archive
              </button>
            </div>

            {/* Delete Button */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Delete this project
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  This cannot be undone. Deletes all tasks and data.
                </p>
                {project.task_stats.total > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                    ⚠️ This project has {project.task_stats.total} task(s)
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archived Project Actions */}
      {isArchived && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Archived Project
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This project is archived. You can restore it to make it active again.
          </p>
          <button
            onClick={() => setShowArchiveModal(true)}
            disabled={archiveLoading}
            className="px-6 py-2 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
          >
            Restore Project
          </button>
        </div>
      )}

      {/* Modals */}
      <ArchiveConfirmModal
        isOpen={showArchiveModal}
        projectName={project.name}
        onConfirm={handleArchive}
        onCancel={() => setShowArchiveModal(false)}
        loading={archiveLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        projectName={project.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        loading={isDeleting}
      />
    </div>
  );
}
