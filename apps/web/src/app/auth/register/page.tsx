'use client';

import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useRegister } from '@/modules/auth/hooks/useRegister';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Task Management System account',
};

function RegisterForm() {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    loading,
    error,
    passwordMatch,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister,
    clearError,
  } = useRegister();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}
      className="space-y-4"
    >
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-200 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearError();
            }}
            placeholder="John"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-200 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearError();
            }}
            placeholder="Doe"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            required
          />
        </div>
      </div>

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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError();
          }}
          placeholder="••••••••"
          className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
            confirmPassword && !passwordMatch
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-600 focus:border-violet-500 focus:ring-violet-500/20'
          }`}
          required
        />
        {confirmPassword && !passwordMatch && (
          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !passwordMatch}
        className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>Already have an account?</span>
        <a href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
          Sign In
        </a>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Join TaskPro today">
      <RegisterForm />
    </AuthLayout>
  );
}