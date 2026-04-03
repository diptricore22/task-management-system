'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unread_count: number;
  onClick: () => void;
  isOpen?: boolean;
}

/**
 * NotificationBell component - Header notification icon with unread badge
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  unread_count,
  onClick,
  isOpen = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors relative ${
        isOpen
          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
          : 'text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-800'
      }`}
      aria-label={`Notifications (${unread_count} unread)`}
      title={unread_count > 0 ? `${unread_count} unread notification${unread_count !== 1 ? 's' : ''}` : 'Notifications'}
    >
      <Bell size={20} />

      {/* Unread badge */}
      {unread_count > 0 && (
        <>
          {/* Pulse animation background (optional) */}
          <span
            className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
            aria-hidden="true"
          />
          {/* Badge with count */}
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-red-600 text-white shadow-md">
            {unread_count > 99 ? '99+' : unread_count}
          </span>
        </>
      )}
    </button>
  );
};
