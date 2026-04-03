'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, ChevronRight } from 'lucide-react';
import { Notification } from '../types/notifications.types';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unread_count: number;
  loading: boolean;
  onMarkAsRead: (notificationId: string) => void;
}

/**
 * NotificationDropdown component - Dropdown menu showing recent notifications
 */
export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  unread_count,
  loading,
  onMarkAsRead,
}) => {
  const router = useRouter();
  const recentNotifications = notifications.slice(0, 5);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Notifications
              {unread_count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-red-600 text-white">
                  {unread_count}
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading && recentNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  isRead={notification.read_at !== null}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              onClose();
              router.push('/notifications');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
