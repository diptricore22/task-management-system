'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  assistText?: string; // Help text below input
  showError?: boolean; // Conditional error display
}

/**
 * FormField Component
 * Reusable form input with label, error display, and optional features
 * Supports text, email, and password inputs
 * Password inputs have visibility toggle
 */
export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  assistText,
  showError = !!error,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = !!error && showError;

  return (
    <div className="space-y-1">
      {/* Label */}
      <label
        htmlFor={id}
        className={`block text-sm font-medium transition-colors ${
          hasError ? 'text-red-400' : 'text-slate-200'
        }`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-slate-700 border-1.5
            text-white placeholder-slate-400
            font-medium text-sm
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
            }
            focus:outline-none
          `}
        />

        {/* Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-400 mt-1 flex items-start gap-1.5"
        >
          <span className="text-red-500 flex-shrink-0">!</span>
          <span>{error}</span>
        </p>
      )}

      {/* Assist Text */}
      {assistText && !hasError && (
        <p className="text-xs text-slate-400 mt-1">{assistText}</p>
      )}
    </div>
  );
}
