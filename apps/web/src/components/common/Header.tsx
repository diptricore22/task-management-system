'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/shared';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { Menu, LogOut, Settings } from 'lucide-react';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { NotificationDropdown } from '@/modules/notifications/components/NotificationDropdown';
import { useNotificationPolling } from '@/modules/notifications/hooks/useNotificationPolling';
import { useNotifications } from '@/modules/notifications/hooks/useNotifications';
import { useMarkNotificationAsRead } from '@/modules/notifications/hooks/useMarkNotificationAsRead';

interface HeaderProps {
  user: User | null;
  onMenuToggle?: () => void;
}

/**
 * Header Component
 * Top navigation bar with logo, notifications, and user menu
 * Responsive design with mobile menu toggle
 */
export function Header({ user, onMenuToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { handleLogout } = useLogout();
  const { unread_count } = useNotificationPolling();
  const { notifications, loading: notificationsLoading, refetch: refetchNotifications } = useNotifications();
  const { markAsRead } = useMarkNotificationAsRead();

  const initials =
    user && user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Menu Toggle + Logo on Mobile */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              onMenuToggle?.();
            }}
            className="sm:hidden p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-200"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="text-xl font-bold text-white hidden sm:block">TaskPro</div>
        </div>

        {/* Center: Page Title (can be extended) */}
        <div className="flex-1 sm:flex-none text-center sm:text-left">
          <h1 className="text-sm sm:text-base font-semibold text-slate-200 truncate">
            Welcome, {user?.firstName || 'User'}
          </h1>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <NotificationBell
              unread_count={unread_count}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              isOpen={isNotificationOpen}
            />
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              unread_count={unread_count}
              loading={notificationsLoading}
              onMarkAsRead={(notificationId) => {
                markAsRead(notificationId);
                refetchNotifications();
              }}
            />
          </div>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                {user?.firstName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </a>
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition text-left border-t border-slate-700"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
