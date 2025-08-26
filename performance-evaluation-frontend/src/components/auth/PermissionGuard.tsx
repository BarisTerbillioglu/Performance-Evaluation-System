import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/access-denied'
}) => {
  const { state } = useAuth();
  const { user, isAuthenticated, isLoading } = state;
  const { hasRole, hasPermission } = usePermissions();

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
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      return hasPermission(resource, action);
    });
    
    if (!hasRequiredPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

// Convenience components for common permission checks

export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children }) => (
  <PermissionGuard
    requiredRoles={[UserRole.ADMIN]}
    redirectTo="/access-denied"
  >
    {children}
  </PermissionGuard>
);

export const CanManageUsers: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children }) => (
  <PermissionGuard
    requiredPermissions={[
      'users:create',
      'users:update',
      'users:delete'
    ]}
    redirectTo="/access-denied"
  >
    {children}
  </PermissionGuard>
);

export const CanViewReports: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children }) => (
  <PermissionGuard
    requiredPermissions={['reports:read']}
    redirectTo="/access-denied"
  >
    {children}
  </PermissionGuard>
);

export const CanManageEvaluations: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children }) => (
  <PermissionGuard
    requiredPermissions={[
      'evaluations:create',
      'evaluations:update'
    ]}
    redirectTo="/access-denied"
  >
    {children}
  </PermissionGuard>
);

export const CanExportData: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children }) => (
  <PermissionGuard
    requiredPermissions={[
      'reports:export',
      'users:read',
      'evaluations:read'
    ]}
    redirectTo="/access-denied"
  >
    {children}
  </PermissionGuard>
);
