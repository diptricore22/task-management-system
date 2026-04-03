import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskCard({ task, onSelect, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="task-card" onClick={() => onSelect?.(task)}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-card-footer">
        <span className={`status-badge status-${task.status}`}>{task.status}</span>
        <div className="task-actions">
          <button onClick={() => onEdit?.(task)}>Edit</button>
          <button onClick={() => onDelete?.(task)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
