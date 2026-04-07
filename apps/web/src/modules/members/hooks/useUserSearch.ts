'use client';

import { useCallback, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { UserSearchResult } from '../types/members.types';

interface UserSearchResponse {
  users: UserSearchResult[];
}

export interface UseUserSearchReturn {
  users: UserSearchResult[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook to search for users to add as project members
 */
export function useUserSearch(): UseUserSearchReturn {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<UserSearchResponse>(
        `/users?search=${encodeURIComponent(query.trim())}`
      );
      setUsers(response.users);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setUsers([]);
    setError(null);
  }, []);

  return {
    users,
    loading,
    error,
    searchUsers,
    clearResults,
  };
}
