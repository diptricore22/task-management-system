'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/config';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 *
 * Usage:
 * - Requires auth: <ProtectedRoute>{children}</ProtectedRoute>
 * - Requires specific role: <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
 * - Requires one of multiple roles: <ProtectedRoute requiredRole={['admin', 'member']}>{children}</ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  // Still loading - show spinner
  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return fallback || <LoadingSpinner />;
  }

  // Check role requirement if specified
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized - render children
  return children;
}
