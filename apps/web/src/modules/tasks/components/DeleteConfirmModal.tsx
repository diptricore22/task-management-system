import React from 'react';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({ title, message, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={onCancel} disabled={loading} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
