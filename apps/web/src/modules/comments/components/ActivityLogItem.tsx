'use client';

import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { ActivityLogItem as ActivityLogItemType } from '../types/comments.types';

interface ActivityLogItemProps {
  item: ActivityLogItemType;
}

/**
 * ActivityLogItem component - displays a system activity log entry
 * Immutable, system-generated entries showing task changes
 * Visually distinct from user comments
 */
export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ item }) => {
  // Get icon based on action type
  const getActionIcon = (action: string) => {
    if (action.includes('status')) return '🔄';
    if (action.includes('priority')) return '📊';
    if (action.includes('assignee')) return '👤';
    if (action.includes('due_date')) return '📅';
    return '📝';
  };

  return (
    <div className="flex gap-3 py-3 px-1">
      {/* Icon */}
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">
        {getActionIcon(item.action)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-medium text-slate-700 dark:text-slate-200">{item.actor.name}</span>
          {' '}
          {item.action_description}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {item.timestamp_relative}
        </p>
      </div>
    </div>
  );
};
