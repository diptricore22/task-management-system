'use client';

import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useLogin } from '@/modules/auth/hooks/useLogin';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Task Management System',
};

function LoginForm() {
  const { email, password, loading, error, setEmail, setPassword, handleLogin, clearError } =
    useLogin();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
      className="space-y-4"
    >
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          placeholder="you@example.com"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          placeholder="••••••••"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>Don't have an account?</span>
        <a href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium">
          Register
        </a>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Sign In" subtitle="Welcome back to TaskPro">
      <LoginForm />
    </AuthLayout>
  );
}