import { useAuth } from '@/store';
import { UserRole, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/types/roles';

export interface Permission {
  resource: string;
  action: string;
}

export const usePermissions = () => {
  const { state, hasRole } = useAuth();

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.user || !state.isAuthenticated) {
      return false;
    }

    // Admin has all permissions
    if (hasRole(UserRole.ADMIN)) {
      return true;
    }

    // Get user's roles
    const userRoles = state.user.roles || [];
    
    // Check permissions for each role
    return userRoles.some(roleName => {
      const role = roleName as UserRole;
      const permissions = ROLE_PERMISSIONS[role];
      
      if (!permissions) return false;
      
      return permissions.some(permission => 
        permission.resource === resource && 
        permission.actions.includes(action)
      );
    });
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => 
      hasPermission(permission.resource, permission.action)
    );
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => 
      hasPermission(permission.resource, permission.action)
    );
  };

  /**
   * Get all permissions for the current user
   */
  const getUserPermissions = (): Permission[] => {
    if (!state.user || !state.isAuthenticated) {
      return [];
    }

    const userRoles = state.user.roles || [];
    const permissions: Permission[] = [];

    userRoles.forEach(roleName => {
      const role = roleName as UserRole;
      const rolePermissions = ROLE_PERMISSIONS[role];
      
      if (rolePermissions) {
        rolePermissions.forEach(permission => {
          permission.actions.forEach(action => {
            // Avoid duplicates
            const exists = permissions.some(p => 
              p.resource === permission.resource && p.action === action
            );
            
            if (!exists) {
              permissions.push({
                resource: permission.resource,
                action: action
              });
            }
          });
        });
      }
    });

    return permissions;
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (path: string): boolean => {
    if (!state.user || !state.isAuthenticated) {
      return false;
    }

    // Admin can access all routes
    if (hasRole(UserRole.ADMIN)) {
      return true;
    }

    // Define route permissions
    const routePermissions: Record<string, Permission[]> = {
      '/users': [{ resource: 'users', action: 'read' }],
      '/users/create': [{ resource: 'users', action: 'create' }],
      '/evaluations': [{ resource: 'evaluations', action: 'read' }],
      '/evaluations/create': [{ resource: 'evaluations', action: 'create' }],
      '/criteria': [{ resource: 'criteria', action: 'read' }],
      '/departments': [{ resource: 'departments', action: 'read' }],
      '/teams': [{ resource: 'teams', action: 'read' }],
      '/reports': [{ resource: 'reports', action: 'read' }],
      '/admin': [{ resource: 'system', action: 'manage' }]
    };

    const requiredPermissions = routePermissions[path];
    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    return hasAnyPermission(requiredPermissions);
  };

  /**
   * Filter data based on user permissions
   */
  const filterByPermission = <T>(
    items: T[], 
    getResourceId: (item: T) => string,
    requiredAction: string = 'read'
  ): T[] => {
    if (hasRole(UserRole.ADMIN)) {
      return items; // Admin can see all
    }

    return items.filter(item => {
      const resourceId = getResourceId(item);
      return hasPermission(resourceId, requiredAction);
    });
  };

  /**
   * Check if user can perform action on specific entity
   */
  const canPerformAction = (
    entityType: string, 
    action: string, 
    entityId?: number,
    ownerId?: number
  ): boolean => {
    // Check general permission
    if (hasPermission(entityType, action)) {
      return true;
    }

    // Check ownership-based permissions
    if (ownerId && state.user?.id === ownerId) {
      // Users can usually read/update their own data
      if (action === 'read' || action === 'update') {
        return hasPermission('profile', action);
      }
    }

    return false;
  };

  /**
   * Get permission level for a resource
   */
  const getPermissionLevel = (resource: string): string[] => {
    const permissions = getUserPermissions();
    return permissions
      .filter(p => p.resource === resource)
      .map(p => p.action);
  };

  /**
   * Check if user has elevated privileges
   */
  const hasElevatedPrivileges = (): boolean => {
    return hasRole(UserRole.ADMIN) || hasRole(UserRole.MANAGER);
  };

  /**
   * Get user's highest role
   */
  const getHighestRole = (): UserRole | null => {
    if (!state.user?.roles) return null;

    const roleHierarchy = [
      UserRole.ADMIN,
      UserRole.MANAGER, 
      UserRole.HR,
      UserRole.EVALUATOR,
      UserRole.EMPLOYEE
    ];

    for (const role of roleHierarchy) {
      if (hasRole(role)) {
        return role;
      }
    }

    return null;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessRoute,
    filterByPermission,
    canPerformAction,
    getPermissionLevel,
    hasElevatedPrivileges,
    getHighestRole
  };
};
