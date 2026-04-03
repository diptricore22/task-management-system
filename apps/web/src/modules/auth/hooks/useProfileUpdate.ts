'use client';

import { useCallback, useState, useEffect } from 'react';
import { profileUpdateSchema } from '@/modules/auth/validations/auth.schema';
import { useAuth } from './useAuth';
import { ZodError } from 'zod';
import type { User } from '@/types/shared';

interface UseProfileUpdateReturn {
  firstName: string;
  lastName: string;
  email: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  isDirty: boolean;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setEmail: (email: string) => void;
  handleUpdateProfile: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  clearMessages: () => void;
  validateField: (field: string) => boolean;
}

/**
 * useProfileUpdate hook
 * Manages profile update form state with validation
 * Includes dirty state tracking and success notifications
 */
export function useProfileUpdate(initialUser: User | null): UseProfileUpdateReturn {
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (initialUser || auth.user) {
      const user = (initialUser || auth.user)!;
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setOriginalFirstName(user.firstName || '');
      setOriginalLastName(user.lastName || '');
      setOriginalEmail(user.email || '');
    }
  }, [initialUser, auth.user]);

  const isDirty =
    firstName !== originalFirstName ||
    lastName !== originalLastName ||
    email !== originalEmail;

  const validateField = useCallback((field: string): boolean => {
    try {
      if (field === 'firstName') {
        if (firstName) {
          profileUpdateSchema.pick({ firstName: true }).parse({ firstName });
        }
        setFirstNameError(null);
        return true;
      } else if (field === 'lastName') {
        if (lastName) {
          profileUpdateSchema.pick({ lastName: true }).parse({ lastName });
        }
        setLastNameError(null);
        return true;
      } else if (field === 'email') {
        if (email) {
          profileUpdateSchema.pick({ email: true }).parse({ email });
        }
        setEmailError(null);
        return true;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldError = err.errors[0]?.message;
        if (field === 'firstName') {
          setFirstNameError(fieldError || null);
        } else if (field === 'lastName') {
          setLastNameError(fieldError || null);
        } else if (field === 'email') {
          setEmailError(fieldError || null);
        }
      }
      return false;
    }
    return true;
  }, [firstName, lastName, email]);

  const handleUpdateProfile = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const firstNameValid = validateField('firstName');
    const lastNameValid = validateField('lastName');
    const emailValid = validateField('email');

    if (!firstNameValid || !lastNameValid || !emailValid) {
      return;
    }

    if (!isDirty) {
      setError('No changes to save');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setError('Email address is already in use');
        } else {
          setError(errorData.message || 'Failed to update profile');
        }
        return;
      }

      const updatedUser: User = await response.json();

      // Update original values to reset dirty state
      setOriginalFirstName(updatedUser.firstName || '');
      setOriginalLastName(updatedUser.lastName || '');
      setOriginalEmail(updatedUser.email || '');

      setSuccess('Profile updated successfully');

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);

      return () => clearTimeout(timer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDirty, firstName, lastName, email, validateField]);

  const resetForm = useCallback(() => {
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setEmail(originalEmail);
    setError(null);
    setSuccess(null);
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
  }, [originalFirstName, originalLastName, originalEmail]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    loading,
    error,
    success,
    firstNameError,
    lastNameError,
    emailError,
    isDirty,
    handleUpdateProfile,
    resetForm,
    clearMessages,
    validateField,
  };
}
