'use client';

import { useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useInviteAccept } from '@/modules/auth/hooks/useInviteAccept';
import { FormField } from '@/components/form/FormField';
import { Alert } from '@/components/common/Alert';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrength';

function InviteAcceptForm({ token }: { token: string }) {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const {
    firstName,
    lastName,
    password,
    confirmPassword,
    loading,
    error,
    passwordMatch,
    passwordStrength,
    isFormValid,
    firstNameError,
    lastNameError,
    passwordError,
    confirmPasswordError,
    setFirstName,
    setLastName,
    setPassword,
    setConfirmPassword,
    handleAcceptInvite,
    validateField,
  } = useInviteAccept();

  // Auto-focus first name field on mount
  useEffect(() => {
    if (firstNameInputRef.current && !firstName) {
      firstNameInputRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={(e) => handleAcceptInvite(token, e)} className="space-y-4">
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
      >
        {loading ? 'Completing registration...' : 'Complete Registration'}
      </button>
    </form>
  );
}

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;

  if (!token) {
    return (
      <AuthLayout title="Invalid Invite" subtitle="The invite link is missing">
        <div className="text-center">
          <p className="text-slate-400 mb-6">
            This invite link appears to be invalid or expired.
          </p>
          <a
            href="/auth/login"
            className="text-violet-400 hover:text-violet-300 font-medium"
          >
            Return to Login
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Complete Your Registration"
      subtitle="Set your password to activate your account"
    >
      <InviteAcceptForm token={token} />
    </AuthLayout>
  );
}
