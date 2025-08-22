import React from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { useAuth } from '@/store';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  permissions = [],
  requireAll = false,
  fallback = null,
  showFallback = true
}) => {
  const { state } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // If user is not authenticated, don't render anything
  if (!state.isAuthenticated) {
    return showFallback ? (fallback || null) : null;
  }

  let hasAccess = false;

  // Check single permission
  if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }
  // Check multiple permissions
  else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  // If no permissions specified, allow access
  else {
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? (fallback || null) : null;
};

// Convenience components for common permission checks

export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    resource="system"
    action="manage"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const CanManageUsers: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    permissions={[
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' }
    ]}
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const CanViewReports: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    resource="reports"
    action="read"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const CanManageEvaluations: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    permissions={[
      { resource: 'evaluations', action: 'create' },
      { resource: 'evaluations', action: 'update' }
    ]}
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const CanExportData: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    permissions={[
      { resource: 'reports', action: 'export' },
      { resource: 'users', action: 'read' },
      { resource: 'evaluations', action: 'read' }
    ]}
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);
