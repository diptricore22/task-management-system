'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProfileForm } from '@/modules/account/components/ProfileForm';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function SettingsNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Profile', href: '/settings' },
    { label: 'Account', href: '/settings/account' },
  ];

  return (
    <nav className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            pathname === item.href
              ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SettingsContent() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your profile and preferences
        </p>
      </div>

      <SettingsNav />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <ProfileForm />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <SettingsContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
