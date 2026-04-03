'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileUpdate } from '@/modules/auth/hooks/useProfileUpdate';
import { FormField } from '@/components/form/FormField';
import { Alert } from '@/components/common/Alert';

/**
 * ProfileForm Component
 * Allows users to update their profile information
 * Includes dirty state tracking and validation
 */
export function ProfileForm() {
  const auth = useAuth();
  const {
    firstName,
    lastName,
    email,
    loading,
    error,
    success,
    firstNameError,
    lastNameError,
    emailError,
    isDirty,
    setFirstName,
    setLastName,
    setEmail,
    handleUpdateProfile,
    resetForm,
    validateField,
  } = useProfileUpdate(auth.user);

  if (!auth.user) {
    return (
      <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
        <p className="text-slate-400">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>

        {/* Success Alert */}
        <Alert
          type="success"
          message={success || ''}
          visible={!!success}
          onDismiss={() => {}}
          autoHideDuration={5000}
        />

        {/* Error Alert */}
        <Alert
          type="error"
          message={error || ''}
          visible={!!error}
          onDismiss={() => {}}
          autoHideDuration={0}
        />

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              id="profileFirstName"
              type="text"
              value={firstName}
              onChange={setFirstName}
              onBlur={() => validateField('firstName')}
              error={firstNameError ?? undefined}
              placeholder="John"
            />
            <FormField
              label="Last Name"
              id="profileLastName"
              type="text"
              value={lastName}
              onChange={setLastName}
              onBlur={() => validateField('lastName')}
              error={lastNameError ?? undefined}
              placeholder="Doe"
            />
          </div>

          {/* Email Field */}
          <FormField
            label="Email Address"
            id="profileEmail"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => validateField('email')}
            error={emailError ?? undefined}
            placeholder="you@example.com"
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !isDirty}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={!isDirty || loading}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-medium rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
