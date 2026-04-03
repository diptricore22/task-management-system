'use client';

import React from 'react';

export interface StatCardProps {
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
  subtitle?: string;
}

const colorClasses = {
  blue: {
    border: 'border-blue-200 dark:border-blue-900',
    value: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    border: 'border-green-200 dark:border-green-900',
    value: 'text-green-600 dark:text-green-400',
    icon: 'text-green-600 dark:text-green-400',
  },
  yellow: {
    border: 'border-yellow-200 dark:border-yellow-900',
    value: 'text-yellow-600 dark:text-yellow-400',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  red: {
    border: 'border-red-200 dark:border-red-900',
    value: 'text-red-600 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-400',
  },
};

/**
 * StatCard Component
 * Reusable card for displaying dashboard statistics
 */
export function StatCard({ label, value, color, icon, subtitle }: StatCardProps) {
  const classes = colorClasses[color];

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border ${classes.border} p-6 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</h3>
        {icon && <div className={`text-2xl ${classes.icon}`}>{icon}</div>}
      </div>
      <p className={`text-3xl font-bold mt-2 ${classes.value}`}>
        {value !== null && value !== undefined ? value : '--'}
      </p>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
