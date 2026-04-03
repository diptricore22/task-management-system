'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';

function UsersContent() {
  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage user roles and permissions
          </p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition">
          Invite User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-slate-500 dark:text-slate-400 text-center">
            User management table will be implemented here
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-2">
            User list with role assignment and management controls
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <UsersContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
