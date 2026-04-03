'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader } from 'lucide-react';
import { NotificationPreferences } from '../types/notifications.types';
import { UpdatePreferencesFormData } from '../validations/notifications.schema';

interface NotificationPreferencesProps {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  onUpdate: (data: UpdatePreferencesFormData) => Promise<boolean>;
}

const PREFERENCE_OPTIONS = [
  {
    key: 'email_assigned' as const,
    label: 'Task Assigned',
    description: 'Receive email when you are assigned to a task',
  },
  {
    key: 'email_commented' as const,
    label: 'Task Commented',
    description: 'Receive email when someone comments on your task',
  },
  {
    key: 'email_due_tomorrow' as const,
    label: 'Due Tomorrow Reminder',
    description: 'Receive reminder email for tasks due tomorrow',
  },
  {
    key: 'email_overdue' as const,
    label: 'Overdue Reminder',
    description: 'Receive reminder email for overdue tasks',
  },
];

/**
 * NotificationPreferencesForm component - Toggle notification preferences
 */
export const NotificationPreferencesForm: React.FC<NotificationPreferencesProps> = ({
  preferences,
  loading,
  error,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<UpdatePreferencesFormData>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSuccessMessage(null);
  }, [isDirty]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newValue = !preferences?.[key];
    setFormData({ ...formData, [key]: newValue });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    const success = await onUpdate(formData);
    setIsSaving(false);

    if (success) {
      setSuccessMessage('Preferences updated');
      setFormData({});
      setIsDirty(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Unable to load notification preferences. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email notification toggles */}
      <div className="space-y-4">
        {PREFERENCE_OPTIONS.map((option) => {
          const value = formData[option.key] !== undefined ? formData[option.key] : preferences[option.key];
          return (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex-1">
                <label className="block font-medium text-slate-900 dark:text-white mb-1">
                  {option.label}
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(option.key)}
                className={`ml-4 flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value
                    ? 'bg-violet-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={value}
                aria-label={`Toggle ${option.label}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Save button */}
      {isDirty && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            onClick={() => {
              setFormData({});
              setIsDirty(false);
              setErrorMessage(null);
            }}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
