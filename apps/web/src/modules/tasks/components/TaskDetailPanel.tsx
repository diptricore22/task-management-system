import React, { useState } from 'react';
import { Task } from '../types';
import { TaskForm } from './TaskForm';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose?: () => void;
  onUpdate?: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

export function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) {
    return null;
  }

  const handleSubmit = async (data: Partial<Task>) => {
    setLoading(true);
    try {
      await onUpdate?.({ ...task, ...data });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-detail-panel">
      <div className="panel-header">
        <h2>Task Details</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="panel-content">
        {isEditing ? (
          <TaskForm task={task} onSubmit={handleSubmit} onCancel={() => setIsEditing(false)} loading={loading} />
        ) : (
          <div className="task-details">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="details-grid">
              <div>
                <strong>Status:</strong> {task.status}
              </div>
              <div>
                <strong>Priority:</strong> {task.priority}
              </div>
              <div>
                <strong>Created:</strong> {task.createdAt}
              </div>
            </div>
            <div className="panel-actions">
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={() => onDelete?.(task.id)}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
