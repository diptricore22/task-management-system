'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RegisterForm } from '@/types/shared';
import { registerSchema } from '@/modules/auth/validations/auth.schema';
import { validatePassword, type PasswordStrength, type PasswordValidationResult } from '@/modules/auth/utils/password';
import { useAuth } from './useAuth';
import { ZodError } from 'zod';

interface UseRegisterReturn {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  loading: boolean;
  error: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  passwordStrength: PasswordValidationResult;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setAgreeTerms: (agree: boolean) => void;
  handleRegister: (e?: React.FormEvent) => Promise<void>;
  clearError: () => void;
  validateField: (field: string) => boolean;
  passwordMatch: boolean;
  isFormValid: boolean;
}

/**
 * useRegister hook
 * Manages registration form state with comprehensive validation
 * Includes field-level validation, password strength, and terms agreement
 */
export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const passwordMatch = password === confirmPassword && password.length > 0;
  const passwordStrength = validatePassword(password);
  const isFormValid =
    firstName.length > 0 &&
    lastName.length > 0 &&
    email.length > 0 &&
    passwordMatch &&
    passwordStrength.isValid &&
    agreeTerms &&
    !firstNameError &&
    !lastNameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError;

  const validateField = useCallback((field: string): boolean => {
    try {
      // Validate the entire form to get field-specific errors
      if (field === 'firstName') {
        registerSchema.parse({ firstName, lastName, email, password, confirmPassword });
        setFirstNameError(null);
        return true;
      } else if (field === 'lastName') {
        registerSchema.parse({ firstName, lastName, email, password, confirmPassword });
        setLastNameError(null);
        return true;
      } else if (field === 'email') {
        registerSchema.parse({ firstName, lastName, email, password, confirmPassword });
        setEmailError(null);
        return true;
      } else if (field === 'password') {
        registerSchema.parse({ firstName, lastName, email, password, confirmPassword });
        setPasswordError(null);
        return true;
      } else if (field === 'confirmPassword') {
        registerSchema.parse({ firstName, lastName, email, password, confirmPassword });
        if (password !== confirmPassword) {
          setConfirmPasswordError('Passwords do not match');
          return false;
        }
        setConfirmPasswordError(null);
        return true;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldError = err.errors.find(e => e.path[0] === field)?.message;
        if (field === 'firstName') {
          setFirstNameError(fieldError || null);
        } else if (field === 'lastName') {
          setLastNameError(fieldError || null);
        } else if (field === 'email') {
          setEmailError(fieldError || null);
        } else if (field === 'password') {
          setPasswordError(fieldError || null);
        } else if (field === 'confirmPassword') {
          setConfirmPasswordError(fieldError || null);
        }
      }
      return false;
    }
    return true;
  }, [password, firstName, lastName, email, confirmPassword]);
  const handleRegister = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const firstNameValid = validateField('firstName');
    const lastNameValid = validateField('lastName');
    const emailValid = validateField('email');
    const passwordValid = validateField('password');
    const confirmPasswordValid = validateField('confirmPassword');

    if (!firstNameValid || !lastNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, agreeTerms, validateField, auth, router]);

  const [loading, setLoading] = useState(false);
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
    agreeTerms,
    setAgreeTerms,
    loading: loading || auth.loading,
    error: error || auth.error,
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    confirmPasswordError,
    passwordStrength,
    handleRegister,
    clearError,
    validateField,
    passwordMatch,
    isFormValid,
  };
}
