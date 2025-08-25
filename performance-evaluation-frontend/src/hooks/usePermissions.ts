import { useAuth } from '@/hooks/useAuth';
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles';

interface Permission {
  resource: string;
  actions: string[];
}

interface RolePermissions {
  [key: string]: Permission[];
}

// Updated permission structure
const ROLE_PERMISSIONS_STRUCTURED: RolePermissions = {
  [UserRole.EMPLOYEE]: [
    { resource: 'evaluation', actions: ['view:own'] },
    { resource: 'profile', actions: ['view:own', 'edit:own'] },
    { resource: 'dashboard', actions: ['view:personal'] },
    { resource: 'reports', actions: ['view:own'] },
    { resource: 'notifications', actions: ['view:own'] },
  ],
  [UserRole.EVALUATOR]: [
    { resource: 'evaluation', actions: ['view:own', 'view:assigned', 'create', 'edit:assigned', 'submit:assigned', 'score:assigned', 'comment:assigned'] },
    { resource: 'profile', actions: ['view:own', 'edit:own'] },
    { resource: 'dashboard', actions: ['view:personal', 'view:team'] },
    { resource: 'reports', actions: ['view:own', 'view:team', 'create:basic'] },
    { resource: 'notifications', actions: ['view:own', 'send:team'] },
    { resource: 'criteria', actions: ['view:active'] },
    { resource: 'team', actions: ['view:assigned', 'manage:assigned'] },
  ],
  [UserRole.MANAGER]: [
    { resource: 'evaluation', actions: ['view:all', 'create', 'edit:all', 'submit:all', 'score:all', 'comment:all', 'approve', 'reject'] },
    { resource: 'profile', actions: ['view:all', 'edit:all'] },
    { resource: 'dashboard', actions: ['view:all'] },
    { resource: 'reports', actions: ['view:all', 'create:all', 'export:all', 'schedule:all'] },
    { resource: 'notifications', actions: ['view:all', 'send:all'] },
    { resource: 'criteria', actions: ['view:all', 'edit:all', 'create', 'delete'] },
    { resource: 'team', actions: ['view:all', 'manage:all', 'create', 'delete'] },
    { resource: 'department', actions: ['view:all', 'manage:all'] },
    { resource: 'user', actions: ['view:all', 'edit:all', 'create', 'delete'] },
    { resource: 'analytics', actions: ['view:all'] },
    { resource: 'settings', actions: ['view:system', 'edit:system'] },
  ],
  [UserRole.ADMIN]: [
    { resource: 'evaluation', actions: ['view:all', 'create', 'edit:all', 'submit:all', 'score:all', 'comment:all', 'approve', 'reject', 'delete'] },
    { resource: 'profile', actions: ['view:all', 'edit:all', 'delete'] },
    { resource: 'dashboard', actions: ['view:all'] },
    { resource: 'reports', actions: ['view:all', 'create:all', 'export:all', 'schedule:all', 'delete'] },
    { resource: 'notifications', actions: ['view:all', 'send:all', 'delete'] },
    { resource: 'criteria', actions: ['view:all', 'edit:all', 'create', 'delete'] },
    { resource: 'team', actions: ['view:all', 'manage:all', 'create', 'delete'] },
    { resource: 'department', actions: ['view:all', 'manage:all', 'create', 'delete'] },
    { resource: 'user', actions: ['view:all', 'edit:all', 'create', 'delete', 'activate', 'deactivate'] },
    { resource: 'role', actions: ['view:all', 'edit:all', 'create', 'delete'] },
    { resource: 'analytics', actions: ['view:all', 'export:all'] },
    { resource: 'settings', actions: ['view:all', 'edit:all'] },
    { resource: 'system', actions: ['maintenance', 'backup', 'restore'] },
    { resource: 'audit', actions: ['view:all', 'export:all'] },
  ],
};

export const usePermissions = () => {
  const { user } = useAuth();

  const getUserPermissions = (): Permission[] => {
    if (!user || !user.roleIds) return [];

    const permissions: Permission[] = [];
    const processedResources = new Set<string>();

    user.roleIds.forEach(roleId => {
      const role = roleId as UserRole;
      const rolePermissions = ROLE_PERMISSIONS_STRUCTURED[role] || [];
      
      rolePermissions.forEach(permission => {
        if (!processedResources.has(permission.resource)) {
          processedResources.add(permission.resource);
          permissions.push({
            resource: permission.resource,
            actions: [...permission.actions]
          });
        } else {
          // Merge actions for existing resource
          const existingPermission = permissions.find(p => p.resource === permission.resource);
          if (existingPermission) {
            permission.actions.forEach(action => {
              if (!existingPermission.actions.includes(action)) {
                existingPermission.actions.push(action);
              }
            });
          }
        }
      });
    });

    return permissions;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.roleIds) return false;

    return user.roleIds.some(roleId => {
      const role = roleId as UserRole;
      const rolePermissions = ROLE_PERMISSIONS_STRUCTURED[role] || [];
      
      return rolePermissions.some(permission => 
        permission.resource === resource && permission.actions.includes(action)
      );
    });
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user || !user.roleIds) return false;
    return user.roleIds.includes(requiredRole);
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    if (!user || !user.roleIds) return false;
    return requiredRoles.some(role => user.roleIds.includes(role));
  };

  const hasAllRoles = (requiredRoles: UserRole[]): boolean => {
    if (!user || !user.roleIds) return false;
    return requiredRoles.every(role => user.roleIds.includes(role));
  };

  const getHighestRole = (): UserRole | null => {
    if (!user || !user.roleIds || user.roleIds.length === 0) return null;
    
    const roleHierarchy = {
      [UserRole.EMPLOYEE]: 1,
      [UserRole.EVALUATOR]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
    };

    return user.roleIds.reduce((highest, current) => {
      const currentRole = current as UserRole;
      return roleHierarchy[currentRole] > roleHierarchy[highest as UserRole] ? currentRole : highest;
    }) as UserRole;
  };

  const canAccessResource = (
    resource: string,
    action: string,
    entityId?: number,
  ): boolean => {
    // Check basic permission first
    if (!hasPermission(resource, action)) {
      return false;
    }

    // Add entity-specific logic here if needed
    // For now, just return the basic permission check
    return true;
  };

  const getAccessibleResources = (): string[] => {
    const permissions = getUserPermissions();
    return permissions.map(p => p.resource);
  };

  const getResourceActions = (resource: string): string[] => {
    const permissions = getUserPermissions();
    const resourcePermission = permissions.find(p => p.resource === resource);
    return resourcePermission ? resourcePermission.actions : [];
  };

  // Role-specific permission checks
  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
  const isManager = (): boolean => hasRole(UserRole.MANAGER);
  const isEvaluator = (): boolean => hasRole(UserRole.EVALUATOR);
  const isEmployee = (): boolean => hasRole(UserRole.EMPLOYEE);

  const isManagerOrAdmin = (): boolean => hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]);
  const isEvaluatorOrAdmin = (): boolean => hasAnyRole([UserRole.EVALUATOR, UserRole.MANAGER, UserRole.ADMIN]);

  return {
    user,
    permissions: getUserPermissions(),
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getHighestRole,
    canAccessResource,
    getAccessibleResources,
    getResourceActions,
    isAdmin,
    isManager,
    isEvaluator,
    isEmployee,
    isManagerOrAdmin,
    isEvaluatorOrAdmin,
  };
};
