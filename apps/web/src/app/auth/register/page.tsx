'use client';

import { useRef, useEffect } from 'react';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useRegister } from '@/modules/auth/hooks/useRegister';
import { FormField } from '@/components/form/FormField';
import { Alert } from '@/components/common/Alert';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrength';

function RegisterForm() {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    agreeTerms,
    loading,
    error,
    passwordMatch,
    passwordStrength,
    isFormValid,
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    confirmPasswordError,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAgreeTerms,
    handleRegister,
    validateField,
  } = useRegister();

  // Auto-focus first name field on mount
  useEffect(() => {
    if (firstNameInputRef.current && !firstName) {
      firstNameInputRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Alert for errors */}
      <Alert
        type="error"
        message={error || ''}
        visible={!!error}
        onDismiss={() => {
          // Error cleared via hook
        }}
        autoHideDuration={0}
      />

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="First Name"
          id="firstName"
          type="text"
          value={firstName}
          onChange={(value) => {
            setFirstName(value);
            // Clear error when user starts typing
            if (firstNameError) {
              validateField('firstName');
            }
          }}
          onBlur={() => validateField('firstName')}
          error={firstNameError}
          placeholder="John"
          required
        />
        <FormField
          label="Last Name"
          id="lastName"
          type="text"
          value={lastName}
          onChange={(value) => {
            setLastName(value);
            // Clear error when user starts typing
            if (lastNameError) {
              validateField('lastName');
            }
          }}
          onBlur={() => validateField('lastName')}
          error={lastNameError}
          placeholder="Doe"
          required
        />
      </div>

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
      />

      {/* Password Field with Strength Meter */}
      <div>
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
        />
        {password && (
          <div className="mt-3">
            <PasswordStrengthMeter
              strength={passwordStrength.strength}
              score={passwordStrength.score}
              feedback={passwordStrength.feedback}
            />
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <FormField
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          // Clear error when user starts typing
          if (confirmPasswordError) {
            validateField('confirmPassword');
          }
        }}
        onBlur={() => validateField('confirmPassword')}
        error={confirmPasswordError}
        placeholder="••••••••"
        required
      />

      {/* Terms of Service */}
      <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
        <input
          type="checkbox"
          id="agreeTerms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-slate-500 text-violet-500 focus:ring-violet-500 cursor-pointer"
          required
          aria-label="I agree to the Terms of Service"
        />
        <label htmlFor="agreeTerms" className="text-sm text-slate-300 cursor-pointer">
          I agree to the{' '}
          <a href="/terms" className="text-violet-400 hover:text-violet-300 font-medium">
            Terms of Service
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      {/* Sign In Link */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
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