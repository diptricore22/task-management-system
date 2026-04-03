'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../types/notifications.types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  isRead: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getActionText = (notification: Notification): string => {
  const { type, payload } = notification;
  const { actor_name, task_title, comment_body } = payload;

  switch (type) {
    case 'task_assigned':
      return `${actor_name} assigned task to you`;
    case 'task_commented':
      return `${actor_name} commented on task`;
    case 'task_due_tomorrow':
      return `Task is due tomorrow`;
    case 'task_overdue':
      return `Task is overdue`;
    default:
      return 'New notification';
  }
};

/**
 * NotificationItem component - Display single notification
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isRead,
}) => {
  const router = useRouter();
  const { payload } = notification;

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(notification.id);
    }
    // Navigate to task
    router.push(`/projects/${payload.project_id}/tasks/${payload.task_id}`);
  };

  const actionText = getActionText(notification);
  const timestamp = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
        isRead ? 'bg-white dark:bg-slate-800' : 'bg-blue-50 dark:bg-blue-900/20'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-semibold flex items-center justify-center">
          {getInitials(payload.actor_name)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm ${isRead ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
                {actionText}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {payload.task_title}
              </p>
            </div>

            {/* Unread indicator */}
            {!isRead && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1" />
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};
