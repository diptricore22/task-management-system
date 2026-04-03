'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/types/shared';
import type { UserRole } from '@/lib/config';
import { X, LayoutDashboard, FolderOpen, CheckSquare, Settings, BarChart3 } from 'lucide-react';

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: UserRole[];
}

/**
 * Sidebar Component
 * Role-aware navigation sidebar with responsive behavior
 */
export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Navigation items with role-based visibility
  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      label: 'My Tasks',
      href: '/tasks/my-tasks',
      icon: CheckSquare,
    },
  ];

  const workspaceItems: NavItem[] = [
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const adminItems: NavItem[] = [
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const shouldShowItem = (item: NavItem): boolean => {
    if (!item.roles) return true; // Show if no role restriction
    if (!user) return false;
    return item.roles.includes(user.role);
  };

  const renderNavItem = (item: NavItem) => {
    if (!shouldShowItem(item)) return null;

    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          active
            ? 'bg-violet-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed sm:relative top-16 sm:top-0 left-0 h-[calc(100vh-64px)] sm:h-screen w-64 bg-slate-900 border-r border-slate-700 transition-transform duration-300 z-40 sm:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button (mobile only) */}
          <div className="sm:hidden p-4 border-b border-slate-700">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Logo (sidebar top) */}
          <div className="hidden sm:flex items-center gap-2 px-6 py-4 border-b border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-bold text-white text-lg">TaskPro</span>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 px-4 mb-3">Main</p>
              {navigationItems.map(renderNavItem)}
            </div>

            {/* Workspace Section */}
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 px-4 mb-3 mt-6">
                Workspace
              </p>
              {workspaceItems.map(renderNavItem)}
            </div>

            {/* Admin Section (only for admins) */}
            {user?.role === 'admin' && (
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500 px-4 mb-3 mt-6">
                  Admin
                </p>
                {adminItems.map(renderNavItem)}
              </div>
            )}
          </nav>

          {/* User Profile (bottom) */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800">
              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {user && user.firstName && user.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`
                  : user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
