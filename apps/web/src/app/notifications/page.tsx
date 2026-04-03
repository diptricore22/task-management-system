'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { NotificationList } from '@/modules/notifications/components/NotificationList';
import { useNotifications } from '@/modules/notifications/hooks/useNotifications';
import { useMarkNotificationAsRead } from '@/modules/notifications/hooks/useMarkNotificationAsRead';

function NotificationsContent() {
  const {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useNotifications();
  const { markAllAsRead } = useMarkNotificationAsRead();

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      await refetch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View all your notifications
            </p>
          </div>

          {/* Mark all as read button */}
          {notifications.some(n => n.read_at === null) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onMarkAsRead={(notificationId) => {
          refetch();
        }}
      />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NotificationsContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
