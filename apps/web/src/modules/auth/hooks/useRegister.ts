'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RegisterForm } from '@/types/shared';
import { useAuth } from './useAuth';

interface UseRegisterReturn {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleRegister: () => Promise<void>;
  clearError: () => void;
  passwordMatch: boolean;
}

/**
 * useRegister hook
 * Manages registration form state and submission
 * Validates password confirmation matches
 */
export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordMatch = password === confirmPassword && password.length > 0;

  const handleRegister = useCallback(async () => {
    if (!passwordMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const data: RegisterForm = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };

    try {
      await auth.register(data);
      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, passwordMatch, auth, router]);

  const clearError = useCallback(() => setError(null), []);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading: loading || auth.loading,
    error: error || auth.error,
    handleRegister,
    clearError,
    passwordMatch,
  };
}
