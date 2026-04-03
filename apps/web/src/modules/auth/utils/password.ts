/**
 * Password Strength Levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidationResult {
  strength: PasswordStrength;
  score: number; // 0-4
  feedback: string[];
  isValid: boolean; // scores 2+ (fair or better)
}

/**
 * Validate password strength and provide feedback
 * Checks: length, uppercase, lowercase, numbers, special characters
 */
export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Password is required'],
      isValid: false,
    };
  }

  // Length checks (1 point each)
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Complexity checks (0.5 points each, rounded)
  if (/[a-z]/.test(password)) {
    score += 0.25;
  } else {
    feedback.push('Include lowercase letters (a-z)');
  }

  if (/[A-Z]/.test(password)) {
    score += 0.25;
  } else {
    feedback.push('Include uppercase letters (A-Z)');
  }

  if (/\d/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Include numbers (0-9)');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Cap score at 4
  const finalScore = Math.min(Math.round(score * 2) / 2, 4);

  // Determine strength level
  let strength: PasswordStrength = 'weak';
  if (finalScore >= 3.5) {
    strength = 'strong';
  } else if (finalScore >= 2.5) {
    strength = 'good';
  } else if (finalScore >= 1.5) {
    strength = 'fair';
  } else {
    strength = 'weak';
  }

  return {
    strength,
    score: finalScore,
    feedback: feedback.length > 0 ? feedback : ['Great password!'],
    isValid: finalScore >= 2, // Fair or better (2/4)
  };
}

/**
 * Get color for password strength display
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return '#ef4444'; // red-500
    case 'fair':
      return '#eab308'; // yellow-500
    case 'good':
      return '#84cc16'; // lime-500
    case 'strong':
      return '#22c55e'; // green-500
  }
}

/**
 * Get strength label for display
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
  }
}
