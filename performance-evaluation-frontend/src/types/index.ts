// Core types
export * from './api';
export * from './auth';
export * from './roles';
export * from './analytics';

// Entity types - only export from api.ts to avoid conflicts
// export * from './user';
// export * from './department';
// export * from './team';
// export * from './evaluation';
// export * from './criteria';
// export * from './dashboard';
// export * from './file';
// export * from './analytics';
// export * from './notification';
// export * from './report';
// export * from './search';
// export * from './bulk';
// export * from './export';

// Settings & Configuration types
// export * from './settings';

// Common types
// export * from './common';

// Loading state type - updated to include all used values
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'succeeded' | 'failed';

// Role types
export interface RoleDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

// Category weight types
export interface CategoryWeightDto {
  categoryId: number;
  categoryName: string;
  currentWeight: number;
  suggestedWeight: number;
  difference: number;
  isBalanced: boolean;
}
