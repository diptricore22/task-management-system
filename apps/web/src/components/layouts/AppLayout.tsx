'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout Component
 * Main layout wrapper for authenticated pages
 * Includes header, sidebar, and responsive mobile menu
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-background">
      {/* Sidebar */}
      <Sidebar user={user} isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onMenuToggle={handleSidebarToggle} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
