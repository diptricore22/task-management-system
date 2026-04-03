'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLogin } from '@/modules/auth/hooks/useLogin';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FormField } from '@/components/form/FormField';
import { Alert } from '@/components/common/Alert';

/**
 * LoginForm Component
 * Email/password login with validation, remember me, and error handling
 */
function LoginForm() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const {
    email,
    password,
    rememberMe,
    loading,
    error,
    emailError,
    passwordError,
    setEmail,
    setPassword,
    setRememberMe,
    handleLogin,
    clearError,
    validateField,
  } = useLogin();

  // Auto-focus email field on mount
  useEffect(() => {
    if (emailInputRef.current && !email) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Alert for server errors */}
      {error && (
        <Alert
          type={error.includes('locked') ? 'warning' : 'error'}
          message={error}
          visible={!!error}
          onDismiss={clearError}
          autoHideDuration={error.includes('locked') ? 0 : 7000}
        />
      )}

      {/* Email Field */}
      <FormField
        label="Email Address"
        id="email"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          // Clear error when user starts typing
          if (emailError) {
            validateField('email');
          }
        }}
        onBlur={() => validateField('email')}
        error={emailError}
        placeholder="you@example.com"
        required
        autoComplete="email"
        disabled={loading}
      />

      {/* Password Field */}
      <FormField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(value) => {
          setPassword(value);
          // Clear error when user starts typing
          if (passwordError) {
            validateField('password');
          }
        }}
        onBlur={() => validateField('password')}
        error={passwordError}
        placeholder="••••••••"
        required
        autoComplete="current-password"
        disabled={loading}
      />

      {/* Remember Me Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading}
          className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer accent-violet-600 disabled:cursor-not-allowed"
          aria-label="Remember me for 7 days"
        />
        <label
          htmlFor="rememberMe"
          className="text-sm text-slate-300 cursor-pointer select-none"
        >
          Remember me for 7 days
        </label>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <a
          href="/auth/forgot-password"
          className="text-sm text-violet-400 hover:text-violet-300 transition opacity-60 cursor-not-allowed"
          title="Coming soon"
          aria-label="Forgot password (Coming soon)"
        >
          Forgot password?
        </a>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-2.5 px-4 rounded-lg font-medium text-white
          bg-gradient-to-r from-violet-600 to-indigo-600
          hover:from-violet-700 hover:to-indigo-700
          disabled:from-slate-600 disabled:to-slate-600
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          flex items-center justify-center gap-2
        `}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-slate-700"></div>
        <span className="text-xs text-slate-400">Or continue with</span>
        <div className="flex-1 h-px bg-slate-700"></div>
      </div>

      {/* Social Buttons (Placeholder) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          className="py-2 px-4 border border-slate-600 rounded-lg text-slate-400 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Coming soon"
          aria-label="Google Sign In (Coming soon)"
        >
          Google
        </button>
        <button
          type="button"
          disabled
          className="py-2 px-4 border border-slate-600 rounded-lg text-slate-400 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Coming soon"
          aria-label="GitHub Sign In (Coming soon)"
        >
          GitHub
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium transition">
          Sign up
        </Link>
      </p>
    </form>
  );
}

/**
 * Login Page
 */
export default function LoginPage() {
  return (
    <AuthLayout title="Sign In" subtitle="Welcome back to TaskPro">
      <LoginForm />
    </AuthLayout>
  );
}