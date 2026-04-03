'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginForm } from '@/types/shared';
import { useAuth } from './useAuth';

interface UseLoginReturn {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberMe: (remember: boolean) => void;
  handleLogin: () => Promise<void>;
  clearError: () => void;
}

/**
 * useLogin hook
 * Manages login form state and submission
 * Usage example:
 * const {email, password, loading, handleLogin, setEmail, setPassword} = useLogin();
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);

    const credentials: LoginForm = {
      email,
      password,
      rememberMe,
    };

    try {
      await auth.login(credentials);
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, auth, router]);

  const clearError = useCallback(() => setError(null), []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading: loading || auth.loading,
    error: error || auth.error,
    handleLogin,
    clearError,
  };
}
