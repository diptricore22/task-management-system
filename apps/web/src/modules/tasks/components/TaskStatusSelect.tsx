import React from 'react';
import { Task } from '../types';

interface TaskStatusSelectProps {
  value: Task['status'];
  onChange: (status: Task['status']) => void;
  disabled?: boolean;
}

export function TaskStatusSelect({ value, onChange, disabled }: TaskStatusSelectProps) {
  const statusOptions: Array<{ value: Task['status']; label: string }> = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="task-status-select">
      <label>Status</label>
      <select value={value} onChange={(e) => onChange(e.target.value as Task['status'])} disabled={disabled}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
