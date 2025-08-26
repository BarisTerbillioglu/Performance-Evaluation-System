// Core API types - all backend DTOs exported from api.ts
export * from './api';
export * from './auth';
export * from './roles';
export * from './analytics';

// Additional entity types for extended functionality
export * from './user';
export * from './department';
export * from './team';
export * from './evaluation';
export * from './criteria';
export * from './dashboard';
export * from './file';
export * from './notification';
export * from './reports';
export * from './settings';

// Common types
export * from './common';

// Loading state type - updated to include all used values
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'succeeded' | 'failed';

// Re-export key types from api.ts for convenience
export type {
  // Core DTOs
  UserDto,
  DepartmentDto,
  TeamDto,
  CriteriaDto,
  CriteriaCategoryDto,
  EvaluationDto,
  EvaluationListDto,
  EvaluationDetailDto,
  EvaluationFormDto,
  CriteriaWithScoreDto,
  EvaluationScoreDto,
  CommentDto,
  CriteriaRoleDescriptionDto,

  // Request DTOs
  LoginRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  UpdateScoreRequest,
  AddCommentRequest,
  UpdateCommentRequest,
  CreateCriteriaRequest,
  UpdateCriteriaRequest,
  AddRoleDescriptionRequest,
  UpdateRoleDescriptionRequest,
  CreateCriteriaCategoryRequest,
  UpdateCriteriaCategoryRequest,

  // Response DTOs
  PagedResult,
  LoginResponse,
  UserInfo,
  DashboardOverviewDto,
  AdminStatisticsDto,
  TeamPerformanceDto,
  PersonalPerformanceDto,
  FileUploadDto,
  FileInfoDto,
  UserListDto,
  UserWithDetailsDto,
  DepartmentWithUsersDto,
  TeamWithMembersDto,
  CriteriaCategoryWithCriteriaDto,
  EvaluationSummaryDto,
  UserSearchDto,
  UserSearchRequest,

  // API types
  ApiResponse,
  ApiError,
  WeightValidationDto,
  RebalanceWeightRequest
} from './api';

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

// Category weight types (extended from api.ts)
export interface CategoryWeightDto {
  categoryId: number;
  categoryName: string;
  currentWeight: number;
  suggestedWeight: number;
  difference: number;
  isBalanced: boolean;
}

// Store types for Zustand stores
export interface BaseStoreState {
  loading: boolean;
  error: string | null;
}

export interface BaseStoreActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}
