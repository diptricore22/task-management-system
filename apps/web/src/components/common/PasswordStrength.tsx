'use client';

import { getPasswordStrengthColor, getPasswordStrengthLabel, PasswordStrength } from '@/modules/auth/utils/password';

interface PasswordStrengthProps {
  strength: PasswordStrength;
  score: number; // 0-4
  feedback: string[];
}

/**
 * PasswordStrength Component
 * Visual meter showing password strength with feedback
 */
export function PasswordStrengthMeter({
  strength,
  score,
  feedback,
}: PasswordStrengthProps) {
  const color = getPasswordStrengthColor(strength);
  const label = getPasswordStrengthLabel(strength);
  const percentage = (score / 4) * 100;

  return (
    <div className="space-y-2">
      {/* Strength Meter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <ul className="space-y-1">
          {feedback.map((item, index) => (
            <li
              key={index}
              className="text-xs text-slate-400 flex items-start gap-2"
            >
              <span className="text-slate-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
