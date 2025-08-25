// User roles enum matching backend
export enum UserRole {
  EMPLOYEE = 1,
  EVALUATOR = 2,
  MANAGER = 3,
  ADMIN = 4,
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: 'Employee',
  [UserRole.EVALUATOR]: 'Evaluator',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.ADMIN]: 'Administrator',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: 'Regular employee who can view their own evaluations',
  [UserRole.EVALUATOR]: 'Can evaluate employees and manage evaluations',
  [UserRole.MANAGER]: 'Can manage teams, departments, and evaluations',
  [UserRole.ADMIN]: 'Full system access and administration',
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.EMPLOYEE]: 1,
  [UserRole.EVALUATOR]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
};

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.EMPLOYEE]: [
    'evaluation:view:own',
    'profile:view:own',
    'profile:edit:own',
    'dashboard:view:personal',
    'reports:view:own',
    'notifications:view:own',
  ],
  [UserRole.EVALUATOR]: [
    'evaluation:view:own',
    'evaluation:view:assigned',
    'evaluation:create',
    'evaluation:edit:assigned',
    'evaluation:submit:assigned',
    'evaluation:score:assigned',
    'evaluation:comment:assigned',
    'profile:view:own',
    'profile:edit:own',
    'dashboard:view:personal',
    'dashboard:view:team',
    'reports:view:own',
    'reports:view:team',
    'reports:create:basic',
    'notifications:view:own',
    'notifications:send:team',
    'criteria:view:active',
    'team:view:assigned',
    'team:manage:assigned',
  ],
  [UserRole.MANAGER]: [
    'evaluation:view:all',
    'evaluation:create',
    'evaluation:edit:all',
    'evaluation:submit:all',
    'evaluation:score:all',
    'evaluation:comment:all',
    'evaluation:approve',
    'evaluation:reject',
    'profile:view:all',
    'profile:edit:all',
    'dashboard:view:all',
    'reports:view:all',
    'reports:create:all',
    'reports:export:all',
    'reports:schedule:all',
    'notifications:view:all',
    'notifications:send:all',
    'criteria:view:all',
    'criteria:edit:all',
    'criteria:create',
    'criteria:delete',
    'team:view:all',
    'team:manage:all',
    'team:create',
    'team:delete',
    'department:view:all',
    'department:manage:all',
    'user:view:all',
    'user:edit:all',
    'user:create',
    'user:delete',
    'analytics:view:all',
    'settings:view:system',
    'settings:edit:system',
  ],
  [UserRole.ADMIN]: [
    'evaluation:view:all',
    'evaluation:create',
    'evaluation:edit:all',
    'evaluation:submit:all',
    'evaluation:score:all',
    'evaluation:comment:all',
    'evaluation:approve',
    'evaluation:reject',
    'evaluation:delete',
    'profile:view:all',
    'profile:edit:all',
    'profile:delete',
    'dashboard:view:all',
    'reports:view:all',
    'reports:create:all',
    'reports:export:all',
    'reports:schedule:all',
    'reports:delete',
    'notifications:view:all',
    'notifications:send:all',
    'notifications:delete',
    'criteria:view:all',
    'criteria:edit:all',
    'criteria:create',
    'criteria:delete',
    'team:view:all',
    'team:manage:all',
    'team:create',
    'team:delete',
    'department:view:all',
    'department:manage:all',
    'department:create',
    'department:delete',
    'user:view:all',
    'user:edit:all',
    'user:create',
    'user:delete',
    'user:activate',
    'user:deactivate',
    'role:view:all',
    'role:edit:all',
    'role:create',
    'role:delete',
    'analytics:view:all',
    'analytics:export:all',
    'settings:view:all',
    'settings:edit:all',
    'system:maintenance',
    'system:backup',
    'system:restore',
    'audit:view:all',
    'audit:export:all',
  ],
};

// Helper function to get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role] || 'Unknown Role';
};

// Helper function to get role description
export const getRoleDescription = (role: UserRole): string => {
  return ROLE_DESCRIPTIONS[role] || 'No description available';
};

// Helper function to check if a role has higher privileges than another
export const hasHigherPrivileges = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Helper function to get permissions for a role
export const getRolePermissions = (role: UserRole): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Helper function to get all permissions for multiple roles
export const getPermissionsForRoles = (roles: UserRole[]): string[] => {
  const allPermissions = new Set<string>();
  roles.forEach(role => {
    ROLE_PERMISSIONS[role]?.forEach(permission => allPermissions.add(permission));
  });
  return Array.from(allPermissions);
};
