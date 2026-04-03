'use client';

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * AuthLayout Component
 * Minimal layout for authentication pages (login, register, invite)
 * Centered form container with branded background
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TaskPro</h1>
          {title && <h2 className="text-xl font-semibold text-slate-200 mb-1">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        {/* Form Container */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 sm:p-8">
          {children}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Collaborative task management for{' '}
            <span className="text-violet-400 font-medium">engineering teams</span>
          </p>
        </div>
      </div>
    </div>
  );
}
