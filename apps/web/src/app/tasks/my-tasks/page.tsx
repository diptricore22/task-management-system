'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';

function MyTasksContent() {
  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            All tasks assigned to you across projects
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            Filter
          </button>
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            Sort
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-slate-500 dark:text-slate-400 text-center">
            My tasks list component will be implemented here
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-2">
            Cross-project task view with filtering and sorting options
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MyTasksPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <MyTasksContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
