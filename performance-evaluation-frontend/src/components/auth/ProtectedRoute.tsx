import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: { resource: string; action: string };
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermission,
  redirectTo = '/login'
}) => {
  const { state } = useAuth();
  const { user, isAuthenticated, isLoading } = state;
  const { hasPermission } = usePermissions();

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

  // Check permission-based access
  if (requiredPermission) {
    const { resource, action } = requiredPermission;
    if (!hasPermission(resource, action)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
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
