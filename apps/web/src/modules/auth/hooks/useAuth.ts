'use client';

import { useAuthContext } from '@/modules/auth/context/auth.context';

/**
 * useAuth hook
 * Provides access to authentication state and methods
 * Use this in any component that needs to check auth status or call auth methods
 */
export function useAuth() {
  return useAuthContext();
}
