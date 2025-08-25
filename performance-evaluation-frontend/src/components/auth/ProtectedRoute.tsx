import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login'
}) => {
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

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role.toString())
    );

    if (!hasRequiredRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

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
