'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginForm } from '@/types/shared';
import { loginSchema } from '@/modules/auth/validations/auth.schema';
import { useAuth } from './useAuth';
import { ZodError } from 'zod';

interface UseLoginReturn {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
  emailError: string | null;
  passwordError: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberMe: (remember: boolean) => void;
  handleLogin: (e?: React.FormEvent) => Promise<void>;
  clearError: () => void;
  validateField: (field: 'email' | 'password') => boolean;
}

/**
 * useLogin hook
 * Manages login form state, validation, and submission
 * Includes field-level validation with inline error display
 * Remember me feature for email persistence
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load persisted email from localStorage on mount if remember me was checked
  useEffect(() => {
    const persistedEmail = localStorage.getItem('remembered_email');
    if (persistedEmail) {
      setEmail(persistedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateField = useCallback((field: 'email' | 'password'): boolean => {
    try {
      if (field === 'email') {
        loginSchema.pick({ email: true }).parse({ email });
        setEmailError(null);
        return true;
      } else if (field === 'password') {
        loginSchema.pick({ password: true }).parse({ password });
        setPasswordError(null);
        return true;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldError = err.errors[0]?.message;
        if (field === 'email') {
          setEmailError(fieldError || null);
        } else if (field === 'password') {
          setPasswordError(fieldError || null);
        }
      }
      return false;
    }
    return true;
  }, [email, password]);

  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Client-side validation
    const emailValid = validateField('email');
    const passwordValid = validateField('password');

    if (!emailValid || !passwordValid) {
      return;
    }

    setLoading(true);
    setError(null);

    const credentials: LoginForm = {
      email,
      password,
      rememberMe,
    };

    try {
      await auth.login(credentials);

      // Persist email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, auth, router, validateField]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading: loading || auth.loading,
    error: error || auth.error,
    emailError,
    passwordError,
    handleLogin,
    clearError,
    validateField,
  };
}
