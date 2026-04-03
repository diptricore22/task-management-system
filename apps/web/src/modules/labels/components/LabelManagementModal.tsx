'use client';

import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus } from 'lucide-react';
import { Label } from '../types/labels.types';
import { useProjectLabels } from '../hooks/useProjectLabels';
import { useLabelManagement } from '../hooks/useLabelManagement';
import { LabelForm } from './LabelForm';
import { LabelChip } from './LabelChip';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface LabelManagementModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LabelManagementModal component - Admin-only label management interface
 * Allows creating, editing, and deleting project labels
 * Only accessible to project admins
 */
export const LabelManagementModal: React.FC<LabelManagementModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { labels, loading: labelsLoading, refetch: refetchLabels } = useProjectLabels(projectId);
  const {
    createForm,
    setCreateFormName,
    setCreateFormColor,
    clearCreateForm,
    editForm,
    setEditFormName,
    setEditFormColor,
    clearEditForm,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useLabelManagement();

  const isAdmin = user?.role === 'admin';

  if (!isOpen) return null;

  // Get label being edited
  const editingLabel = editingLabelId ? labels.find((l) => l.id === editingLabelId) : null;

  const handleCreateLabel = async () => {
    const newLabel = await handleCreate(projectId);
    if (newLabel) {
      clearCreateForm();
      setShowCreateForm(false);
      refetchLabels();
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabelId) return;
    const updated = await handleUpdate(editingLabelId);
    if (updated) {
      clearEditForm();
      setEditingLabelId(null);
      refetchLabels();
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!window.confirm('Delete this label? It will be removed from all tasks.')) {
      return;
    }
    const success = await handleDelete(labelId);
    if (success) {
      if (editingLabelId === labelId) {
        setEditingLabelId(null);
        clearEditForm();
      }
      refetchLabels();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Manage Labels
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isAdmin ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                Only project admins can manage labels
              </div>
            ) : (
              <>
                {/* Create form */}
                {showCreateForm ? (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-900 dark:text-white">Create New Label</h3>
                    <LabelForm
                      isCreate
                      name={createForm.name}
                      color={createForm.color}
                      onNameChange={setCreateFormName}
                      onColorChange={setCreateFormColor}
                      onSubmit={handleCreateLabel}
                      onCancel={() => {
                        setShowCreateForm(false);
                        clearCreateForm();
                      }}
                      loading={isCreating}
                      error={createError || undefined}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 dark:bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Label
                  </button>
                )}

                {/* Labels list */}
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Project Labels ({labels.length})
                  </h3>

                  {labelsLoading ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Loading labels...
                    </div>
                  ) : labels.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No labels yet. Create your first label above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {labels.map((label) =>
                        editingLabelId === label.id ? (
                          // Edit form
                          <div
                            key={label.id}
                            className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                              Editing: {label.name}
                            </div>
                            <LabelForm
                              isCreate={false}
                              name={editForm.name || label.name}
                              color={editForm.color || label.color}
                              onNameChange={setEditFormName}
                              onColorChange={setEditFormColor}
                              onSubmit={handleUpdateLabel}
                              onCancel={() => {
                                setEditingLabelId(null);
                                clearEditForm();
                              }}
                              loading={isUpdating}
                              error={updateError || undefined}
                            />
                          </div>
                        ) : (
                          // Label item
                          <div
                            key={label.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <LabelChip label={label} />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingLabelId(label.id);
                                  setEditFormName(label.name);
                                  setEditFormColor(label.color);
                                }}
                                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Edit label"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteLabel(label.id)}
                                disabled={isDeleting}
                                className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete label"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {deleteError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                      {deleteError}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
