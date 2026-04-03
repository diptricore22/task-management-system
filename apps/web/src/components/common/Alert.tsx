'use client';

import { useEffect } from 'react';

type AlertType = 'error' | 'warning' | 'success';

interface AlertProps {
  type?: AlertType;
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number; // milliseconds, 0 = no auto-hide
}

/**
 * Alert Component
 * Displays error, warning, or success messages
 * Success alerts auto-hide after 5 seconds by default
 */
export function Alert({
  type = 'error',
  message,
  visible,
  onDismiss,
  autoHideDuration,
}: AlertProps) {
  // Auto-hide success messages after 5 seconds by default
  const duration = autoHideDuration !== undefined ? autoHideDuration : type === 'success' ? 5000 : 0;

  useEffect(() => {
    if (!visible || duration === 0) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const baseStyles = 'px-4 py-3 rounded-lg text-sm font-medium border flex items-center justify-between gap-4';

  const typeStyles = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`} role="alert" aria-live="polite">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-lg leading-none hover:opacity-70 transition"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
