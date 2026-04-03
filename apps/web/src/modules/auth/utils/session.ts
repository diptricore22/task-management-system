import type { User } from '@/types/shared';

const SESSION_STORAGE_KEY = 'task_mgmt_user_session';
const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes (refresh before 15 min expiry)

/**
 * Session Manager
 * Handles persistence and token refresh logic for authenticated sessions
 */
export const sessionManager = {
  /**
   * Persist user data to localStorage for quick recovery on page reload
   */
  persistUser(user: User): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.error('Failed to persist user session:', err);
    }
  },

  /**
   * Retrieve persisted user from localStorage
   */
  getPersistedUser(): User | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Failed to retrieve persisted user:', err);
      return null;
    }
  },

  /**
   * Clear all session data from localStorage
   */
  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      // Clear any auth-related cookies by requesting logout from server
      // (server handles cookie clearing via auth middleware)
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  },

  /**
   * Check if session exists (either in memory or localStorage)
   */
  hasSession(): boolean {
    return this.getPersistedUser() !== null;
  },

  /**
   * Get token refresh interval for periodic refresh
   */
  getRefreshInterval(): number {
    return TOKEN_REFRESH_INTERVAL;
  },
};
