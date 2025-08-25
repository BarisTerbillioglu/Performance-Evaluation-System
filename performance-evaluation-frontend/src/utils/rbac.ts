import { UserInfo } from '@/types/auth';
import { UserRole } from '@/types/roles';

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.EMPLOYEE]: 1,
  [UserRole.EVALUATOR]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
};

// Policy definitions
export const POLICIES = {
  // AdminOnly: Admin role required
  ADMIN_ONLY: [UserRole.ADMIN] as UserRole[],
  
  // EvaluatorOrAdmin: Evaluator, Manager, or Admin role required
  EVALUATOR_OR_ADMIN: [UserRole.EVALUATOR, UserRole.MANAGER, UserRole.ADMIN] as UserRole[],
  
  // AllUsers: Any authenticated user (Employee, Evaluator, Manager, Admin)
  ALL_USERS: [UserRole.EMPLOYEE, UserRole.EVALUATOR, UserRole.MANAGER, UserRole.ADMIN] as UserRole[],
} as const;

/**
 * Get the primary role for a user (highest role in hierarchy)
 */
export const getUserPrimaryRole = (user: UserInfo | null): UserRole | null => {
  if (!user || !user.roleIds || user.roleIds.length === 0) {
    return null;
  }

  // Find the highest role in the hierarchy
  let highestRole: UserRole | null = null;
  let highestLevel = -1;

  for (const roleId of user.roleIds) {
    const role = roleId as UserRole;
    if (role && ROLE_HIERARCHY[role] > highestLevel) {
      highestLevel = ROLE_HIERARCHY[role];
      highestRole = role;
    }
  }

  return highestRole;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: UserInfo | null, role: UserRole): boolean => {
  if (!user || !user.roleIds) {
    return false;
  }
  return user.roleIds.includes(role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: UserInfo | null, roles: UserRole[]): boolean => {
  if (!user || !user.roleIds) {
    return false;
  }
  return roles.some(role => user.roleIds.includes(role));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (user: UserInfo | null, roles: UserRole[]): boolean => {
  if (!user || !user.roleIds) {
    return false;
  }
  return roles.every(role => user.roleIds.includes(role));
};

/**
 * Check if user has permission for a specific resource and action
 */
export const hasPermission = (user: UserInfo | null, resource: string, action: string): boolean => {
  if (!user) {
    return false;
  }

  const primaryRole = getUserPrimaryRole(user);
  if (!primaryRole) {
    return false;
  }

  // Define permissions based on role hierarchy
  const permissions: Record<UserRole, Record<string, string[]>> = {
    [UserRole.EMPLOYEE]: {
      'evaluation': ['read', 'update_own'],
      'profile': ['read', 'update_own'],
      'dashboard': ['read_own'],
    },
    [UserRole.EVALUATOR]: {
      'evaluation': ['read', 'create', 'update', 'delete', 'submit'],
      'user': ['read'],
      'team': ['read'],
      'criteria': ['read'],
      'dashboard': ['read_team'],
      'profile': ['read', 'update_own'],
    },
    [UserRole.MANAGER]: {
      'evaluation': ['read', 'create', 'update', 'delete', 'submit', 'approve'],
      'user': ['read', 'create', 'update'],
      'team': ['read', 'create', 'update', 'delete'],
      'department': ['read', 'create', 'update'],
      'criteria': ['read', 'create', 'update'],
      'dashboard': ['read_department', 'read_team'],
      'profile': ['read', 'update_own'],
    },
    [UserRole.ADMIN]: {
      'evaluation': ['read', 'create', 'update', 'delete', 'submit', 'approve'],
      'user': ['read', 'create', 'update', 'delete'],
      'team': ['read', 'create', 'update', 'delete'],
      'department': ['read', 'create', 'update', 'delete'],
      'criteria': ['read', 'create', 'update', 'delete'],
      'criteriaCategory': ['read', 'create', 'update', 'delete'],
      'dashboard': ['read_all'],
      'profile': ['read', 'update_own'],
      'system': ['manage'],
    },
  };

  const rolePermissions = permissions[primaryRole];
  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(action);
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (user: UserInfo | null, path: string): boolean => {
  if (!user) {
    return false;
  }

  // Define route access based on role
  const routeAccess: Record<string, UserRole[]> = {
    // Public routes (no auth required)
    '/login': [],
    '/forgot-password': [],
    
    // Employee routes
    '/dashboard': [...POLICIES.ALL_USERS],
    '/profile': [...POLICIES.ALL_USERS],
    '/evaluations/my': [...POLICIES.ALL_USERS],
    
    // Evaluator routes
    '/evaluations': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/evaluations/create': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/evaluations/:id': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/teams': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/users': [...POLICIES.EVALUATOR_OR_ADMIN],
    
    // Manager routes
    '/departments': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/teams/create': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/teams/:id/edit': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/users/create': [...POLICIES.EVALUATOR_OR_ADMIN],
    '/users/:id/edit': [...POLICIES.EVALUATOR_OR_ADMIN],
    
    // Admin routes
    '/admin': [...POLICIES.ADMIN_ONLY],
    '/admin/users': [...POLICIES.ADMIN_ONLY],
    '/admin/departments': [...POLICIES.ADMIN_ONLY],
    '/admin/teams': [...POLICIES.ADMIN_ONLY],
    '/admin/criteria': [...POLICIES.ADMIN_ONLY],
    '/admin/criteria-categories': [...POLICIES.ADMIN_ONLY],
    '/admin/reports': [...POLICIES.ADMIN_ONLY],
    '/admin/settings': [...POLICIES.ADMIN_ONLY],
  };

  // Find matching route pattern
  for (const [pattern, allowedRoles] of Object.entries(routeAccess)) {
    if (pattern === path || matchesPattern(path, pattern)) {
      return hasAnyRole(user, allowedRoles);
    }
  }

  // Default to false for unknown routes
  return false;
};

/**
 * Check if a path matches a pattern (simple pattern matching)
 */
const matchesPattern = (path: string, pattern: string): boolean => {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/'); // Escape slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
};

/**
 * Get the default redirect path for a user based on their role
 */
export const getRedirectPath = (user: UserInfo): string => {
  const primaryRole = getUserPrimaryRole(user);
  
  switch (primaryRole) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.MANAGER:
      return '/dashboard';
    case UserRole.EVALUATOR:
      return '/evaluations';
    case UserRole.EMPLOYEE:
      return '/evaluations/my';
    default:
      return '/dashboard';
  }
};

/**
 * Check if user can perform a specific action on a resource
 */
export const canPerformAction = (
  user: UserInfo | null, 
  resource: string, 
  action: string, 
  resourceOwnerId?: number
): boolean => {
  if (!user) {
    return false;
  }

  // Check basic permission
  if (!hasPermission(user, resource, action)) {
    return false;
  }

  // Check ownership for certain actions
  if (action.includes('own') && resourceOwnerId) {
    return user.id === resourceOwnerId;
  }

  return true;
};
