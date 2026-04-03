'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword, type PasswordValidationResult } from '@/modules/auth/utils/password';
import { useAuth } from './useAuth';
import { ZodError } from 'zod';
import { inviteAcceptSchema } from '@/modules/auth/validations/auth.schema';

interface UseInviteAcceptReturn {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  passwordStrength: PasswordValidationResult;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleAcceptInvite: (token: string, e?: React.FormEvent) => Promise<void>;
  clearError: () => void;
  validateField: (field: string) => boolean;
  passwordMatch: boolean;
  isFormValid: boolean;
}

/**
 * useInviteAccept hook
 * Manages invite acceptance form state with validation
 * Includes password setup and profile name initialization
 */
export function useInviteAccept(): UseInviteAcceptReturn {
  const router = useRouter();
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordMatch = password === confirmPassword && password.length > 0;
  const passwordStrength = validatePassword(password);
  const isFormValid =
    firstName.length > 0 &&
    lastName.length > 0 &&
    passwordMatch &&
    passwordStrength.isValid &&
    !firstNameError &&
    !lastNameError &&
    !passwordError &&
    !confirmPasswordError;

  const validateField = useCallback((field: string): boolean => {
    try {
      // Just validate the entire form object to avoid ZodEffects pick() issues
      inviteAcceptSchema.parse({ firstName, lastName, password, confirmPassword });
      setFirstNameError(null);
      setLastNameError(null);
      setPasswordError(null);
      setConfirmPasswordError(null);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0] === 'firstName') setFirstNameError(err.message);
          if (err.path[0] === 'lastName') setLastNameError(err.message);
          if (err.path[0] === 'password') setPasswordError(err.message);
          if (err.path[0] === 'confirmPassword') setConfirmPasswordError(err.message);
        });
      }
      return false;
    }
  }, [firstName, lastName, password, confirmPassword]);

  const handleAcceptInvite = useCallback(async (token: string, e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const firstNameValid = validateField('firstName');
    const lastNameValid = validateField('lastName');
    const passwordValid = validateField('password');
    const confirmPasswordValid = validateField('confirmPassword');

    if (!firstNameValid || !lastNameValid || !passwordValid || !confirmPasswordValid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to accept invite
      const response = await fetch(`/api/auth/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          password,
          confirmPassword,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept invite');
      }

      // Redirect to dashboard on successful registration
      // The AuthProvider will load the user data on dashboard mount
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      // Handle specific error messages
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setError('This invite link has expired or is invalid. Please request a new invite.');
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('already')) {
        setError('An account with this email already exists.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, password, confirmPassword, validateField, auth, router]);

  const clearError = useCallback(() => setError(null), []);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading: loading || auth.loading,
    error: error || auth.error,
    firstNameError,
    lastNameError,
    passwordError,
    confirmPasswordError,
    passwordStrength,
    handleAcceptInvite,
    clearError,
    validateField,
    passwordMatch,
    isFormValid,
  };
}
