'use client';

import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import type { User, LoginForm, RegisterForm } from '@/types/shared';
import { api } from '@/lib/api-client';
import { sessionManager } from '@/modules/auth/utils/session';

// Auth state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<User>;
  register: (data: RegisterForm) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // First, try to get persisted user from localStorage
        const persistedUser = sessionManager.getPersistedUser();
        if (persistedUser) {
          setState((prev) => ({
            ...prev,
            user: persistedUser,
            isAuthenticated: true,
            loading: false,
          }));
        }

        // Then verify with backend
        const user = await api.get<User>('/users/me');
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));
        sessionManager.persistUser(user);
      } catch (err) {
        // Clear invalid session
        sessionManager.clearSession();
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    };

    initializeSession();
  }, []);

  // Token refresh interval - refresh 2 minutes before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await api.post('/auth/refresh');
      } catch (err) {
        // If refresh fails, logout
        setState({
          user: null,
          loading: false,
          error: 'Session expired. Please login again.',
          isAuthenticated: false,
        });
        sessionManager.clearSession();
      }
    }, 13 * 60 * 1000); // 13 minutes (refresh before 15 min expiry)

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = useCallback(async (credentials: LoginForm) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await api.post<User>('/auth/login', credentials);
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
      sessionManager.persistUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterForm) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await api.post<User>('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
      sessionManager.persistUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await api.post('/auth/logout');
      sessionManager.clearSession();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    } catch (err) {
      // Even if logout fails on backend, clear local session
      sessionManager.clearSession();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await api.post('/auth/refresh');
      // Re-fetch user data to ensure it's fresh
      const user = await api.get<User>('/users/me');
      setState((prev) => ({
        ...prev,
        user,
        error: null,
      }));
      sessionManager.persistUser(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token refresh failed';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      }));
      sessionManager.clearSession();
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuthContext(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
