'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseLogoutReturn {
  loading: boolean;
  error: string | null;
  handleLogout: () => Promise<void>;
}

/**
 * useLogout hook
 * Manages logout operation with proper cleanup and redirect
 */
export function useLogout(): UseLogoutReturn {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await auth.logout();
      // Redirect to login page after logout
      router.push('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      // Still redirect even if error occurs
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [auth, router]);

  return {
    loading,
    error,
    handleLogout,
  };
}
