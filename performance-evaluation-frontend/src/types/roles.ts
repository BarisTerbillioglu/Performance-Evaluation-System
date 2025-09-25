// Role-based access control types

export enum UserRole {
  ADMIN = 'Admin',
  EVALUATOR = 'Evaluator',
  EMPLOYEE = 'Employee',
  MANAGER = 'Manager',
  HR = 'HR'
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.EVALUATOR]: Permission[];
  [UserRole.EMPLOYEE]: Permission[];
  [UserRole.MANAGER]: Permission[];
  [UserRole.HR]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'evaluations', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'criteria', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'departments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'teams', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'system', actions: ['manage'] }
  ],
  [UserRole.EVALUATOR]: [
    { resource: 'evaluations', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'criteria', actions: ['read'] },
    { resource: 'reports', actions: ['read'] }
  ],
  [UserRole.EMPLOYEE]: [
    { resource: 'evaluations', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  [UserRole.MANAGER]: [
    { resource: 'evaluations', actions: ['create', 'read', 'update'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'teams', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read', 'export'] }
  ],
  [UserRole.HR]: [
    { resource: 'users', actions: ['create', 'read', 'update'] },
    { resource: 'evaluations', actions: ['read'] },
    { resource: 'departments', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['read', 'export'] }
  ]
};

// Route access configuration
export interface RouteAccess {
  path: string;
  roles: UserRole[];
  permissions?: string[];
}

export const ROUTE_ACCESS: RouteAccess[] = [
  { path: '/admin', roles: [UserRole.ADMIN] },
  { path: '/admin/*', roles: [UserRole.ADMIN] },
  { path: '/users', roles: [UserRole.ADMIN, UserRole.HR] },
  { path: '/users/*', roles: [UserRole.ADMIN, UserRole.HR] },
  { path: '/evaluations', roles: [UserRole.ADMIN, UserRole.EVALUATOR, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { path: '/evaluations/create', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: '/evaluations/*/edit', roles: [UserRole.ADMIN, UserRole.EVALUATOR, UserRole.MANAGER] },
  { path: '/criteria', roles: [UserRole.ADMIN] },
  { path: '/criteria/*', roles: [UserRole.ADMIN] },
  { path: '/departments', roles: [UserRole.ADMIN, UserRole.HR] },
  { path: '/teams', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { path: '/reports', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR] },
  { path: '/profile', roles: [UserRole.ADMIN, UserRole.EVALUATOR, UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR] },
  { path: '/dashboard', roles: [UserRole.ADMIN, UserRole.EVALUATOR, UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR] }
];

// Role hierarchy (higher roles inherit lower role permissions)
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.EVALUATOR, UserRole.EMPLOYEE, UserRole.HR],
  [UserRole.MANAGER]: [UserRole.EVALUATOR, UserRole.EMPLOYEE],
  [UserRole.HR]: [UserRole.EMPLOYEE],
  [UserRole.EVALUATOR]: [UserRole.EMPLOYEE],
  [UserRole.EMPLOYEE]: []
};

// Default redirect paths after login based on role
export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.EVALUATOR]: '/evaluations',
  [UserRole.EMPLOYEE]: '/dashboard',
  [UserRole.MANAGER]: '/evaluations',
  [UserRole.HR]: '/users'
};
