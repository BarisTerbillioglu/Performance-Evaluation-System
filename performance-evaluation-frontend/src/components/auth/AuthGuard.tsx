import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store';
import { LoadingSpinner } from '@/components/common';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component that handles authentication checks
 * and loading states during app initialization
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { state } = useAuth();

  // Show loading spinner while authentication is being initialized
  if (state.isLoading || !state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect authenticated users away from auth pages
  if (!requireAuth && state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Public route guard - redirects authenticated users
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
};

/**
 * Private route guard - requires authentication
 */
export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
};
