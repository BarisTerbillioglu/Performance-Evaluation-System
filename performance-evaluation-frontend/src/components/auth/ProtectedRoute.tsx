import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store';
import { UserRole } from '@/types/roles';
import { LoadingSpinner } from '@/components/common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
  fallbackPath?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermission,
  fallbackPath = '/login',
  requireAuth = true,
}) => {
  const { state, hasRole, hasPermission, canAccessRoute } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (state.isLoading || !state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If authenticated, check role-based access
  if (state.isAuthenticated && state.user) {
    // Check if user has required roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        return <AccessDenied />;
      }
    }

    // Check if user has required permission
    if (requiredPermission) {
      const { resource, action } = requiredPermission;
      if (!hasPermission(resource, action)) {
        return <AccessDenied />;
      }
    }

    // Check route-level access
    if (!canAccessRoute(location.pathname)) {
      return <AccessDenied />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

// Access denied component
const AccessDenied: React.FC = () => {
  const { state, getDefaultRedirectPath } = useAuth();
  const defaultPath = getDefaultRedirectPath();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          {state.user && (
            <span className="block mt-1 text-sm">
              Current role: {state.user.primaryRole}
            </span>
          )}
        </p>
        <div className="space-y-3">
          <Navigate to={defaultPath} replace />
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

// HOC for protecting components with roles
export const withRoleProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: UserRole[]
) => {
  return (props: P) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// HOC for protecting components with permissions
export const withPermissionProtection = <P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string
) => {
  return (props: P) => (
    <ProtectedRoute requiredPermission={{ resource, action }}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Utility component for conditional rendering based on roles
interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  roles, 
  fallback = null 
}) => {
  const { hasRole } = useAuth();
  
  const hasRequiredRole = roles.some(role => hasRole(role));
  
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
};

// Utility component for conditional rendering based on permissions
interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  resource, 
  action, 
  fallback = null 
}) => {
  const { hasPermission } = useAuth();
  
  const hasRequiredPermission = hasPermission(resource, action);
  
  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
};
