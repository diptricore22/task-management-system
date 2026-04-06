'use client';

import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layouts/AppLayout';

function ReportsContent() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View team statistics and project analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Completion Trend
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            Chart component will be implemented here
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Team Workload
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            Workload table will be implemented here
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Status Distribution
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center py-8">
          Status distribution chart will be implemented here
        </p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AppLayout>
        <ReportsContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
