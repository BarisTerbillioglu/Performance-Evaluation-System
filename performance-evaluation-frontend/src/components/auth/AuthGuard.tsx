import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { state } = useAuth();
  const { user, isAuthenticated, isLoading } = state;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (requireAuth) {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
  } else {
    if (isAuthenticated && user) {
      return <Navigate to="/dashboard" replace />;
    }
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
