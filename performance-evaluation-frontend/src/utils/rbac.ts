import { UserRole, ROLE_PERMISSIONS, ROLE_HIERARCHY, ROUTE_ACCESS, ROLE_REDIRECT_PATHS } from '@/types/roles';
import { UserInfo } from '@/types/auth';

/**
 * Determine the primary role for a user based on their roles
 */
export const getUserPrimaryRole = (user: UserInfo): UserRole | null => {
  if (!user.roles || user.roles.length === 0) {
    return null;
  }

  // Check if user has admin role
  if (user.roles.includes('Admin')) return UserRole.ADMIN;
  if (user.roles.includes('Manager')) return UserRole.MANAGER;
  if (user.roles.includes('HR')) return UserRole.HR;
  if (user.roles.includes('Evaluator')) return UserRole.EVALUATOR;
  if (user.roles.includes('Employee')) return UserRole.EMPLOYEE;

  // Default to Employee if no specific role found
  return UserRole.EMPLOYEE;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: UserInfo | null, role: UserRole): boolean => {
  if (!user || !user.roles) return false;
  
  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) return false;

  // Check direct role match
  if (primaryRole === role) return true;

  // Check role hierarchy (higher roles inherit lower role permissions)
  const inheritedRoles = ROLE_HIERARCHY[primaryRole] || [];
  return inheritedRoles.includes(role);
};

/**
 * Check if user has permission for a specific resource and action
 */
export const hasPermission = (user: UserInfo | null, resource: string, action: string): boolean => {
  if (!user) return false;

  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) return false;

  // Get permissions for the user's role
  const rolePermissions = ROLE_PERMISSIONS[primaryRole] || [];
  
  // Check if user has permission for the resource and action
  return rolePermissions.some(permission => 
    permission.resource === resource && permission.actions.includes(action)
  );
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (user: UserInfo | null, path: string): boolean => {
  if (!user) return false;

  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) return false;

  // Find matching route access rule
  const routeRule = ROUTE_ACCESS.find(rule => {
    if (rule.path.endsWith('/*')) {
      const basePath = rule.path.slice(0, -2);
      return path.startsWith(basePath);
    }
    return rule.path === path;
  });

  // If no specific rule found, allow access
  if (!routeRule) return true;

  // Check if user's role is allowed
  return routeRule.roles.includes(primaryRole) || 
         routeRule.roles.some(allowedRole => hasRole(user, allowedRole));
};

/**
 * Get the appropriate redirect path for a user after login
 */
export const getRedirectPath = (user: UserInfo): string => {
  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) return '/dashboard';

  return ROLE_REDIRECT_PATHS[primaryRole] || '/dashboard';
};

/**
 * Get all permissions for a user based on their role
 */
export const getUserPermissions = (user: UserInfo | null): string[] => {
  if (!user) return [];

  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) return [];

  const rolePermissions = ROLE_PERMISSIONS[primaryRole] || [];
  const permissions: string[] = [];

  rolePermissions.forEach(permission => {
    permission.actions.forEach(action => {
      permissions.push(`${permission.resource}:${action}`);
    });
  });

  return permissions;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: UserInfo | null, roles: UserRole[]): boolean => {
  if (!user || !roles.length) return false;
  return roles.some(role => hasRole(user, role));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (user: UserInfo | null, roles: UserRole[]): boolean => {
  if (!user || !roles.length) return false;
  return roles.every(role => hasRole(user, role));
};

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.HR]: 'Human Resources',
    [UserRole.EVALUATOR]: 'Evaluator',
    [UserRole.EMPLOYEE]: 'Employee'
  };

  return displayNames[role] || role;
};

/**
 * Filter menu items based on user permissions
 */
export interface MenuItem {
  path: string;
  label: string;
  requiredRoles?: UserRole[];
  requiredPermission?: { resource: string; action: string };
}

export const filterMenuItems = (user: UserInfo | null, menuItems: MenuItem[]): MenuItem[] => {
  if (!user) return [];

  return menuItems.filter(item => {
    // Check role requirements
    if (item.requiredRoles && !hasAnyRole(user, item.requiredRoles)) {
      return false;
    }

    // Check permission requirements
    if (item.requiredPermission) {
      const { resource, action } = item.requiredPermission;
      if (!hasPermission(user, resource, action)) {
        return false;
      }
    }

    // Check route access
    return canAccessRoute(user, item.path);
  });
};
