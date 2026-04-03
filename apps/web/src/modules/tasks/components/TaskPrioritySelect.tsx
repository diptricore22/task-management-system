import React from 'react';
import { Task } from '../types/tasks.types';

interface TaskPrioritySelectProps {
  value: Task['priority'];
  onChange: (priority: Task['priority']) => void;
  disabled?: boolean;
}

export function TaskPrioritySelect({ value, onChange, disabled }: TaskPrioritySelectProps) {
  const priorityOptions: Array<{ value: Task['priority']; label: string }> = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
  ];

  return (
    <div className="task-priority-select">
      <label>Priority</label>
      <select value={value} onChange={(e) => onChange(e.target.value as Task['priority'])} disabled={disabled}>
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
