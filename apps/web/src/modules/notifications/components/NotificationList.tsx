'use client';

import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { Notification } from '../types/notifications.types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

/**
 * NotificationList component - Display paginated notifications
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  hasMore,
  onLoadMore,
  onMarkAsRead,
}) => {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Notifications list */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            isRead={notification.read_at !== null}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="p-4 text-center border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Error below list */}
      {error && notifications.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
};
