// Core API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  status?: number;
  details?: any;
}

// Pagination types
export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Evaluation Status enum
export enum EvaluationStatus {
  DRAFT = 'Draft',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

// Base Search Request
export interface BaseSearchRequest {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Evaluation Dashboard DTO
export interface EvaluationDashboardDto {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
  averageScore: number;
  recentEvaluations: EvaluationListDto[];
  departmentStats: {
    departmentId: number;
    departmentName: string;
    evaluationCount: number;
    averageScore: number;
  }[];
}

// Core entity types matching backend DTOs exactly
export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  roleIds: number[];
  roleNames: string[];
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
}

export interface DepartmentDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
  userCount: number;
}

export interface TeamDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: Date;
  memberCount: number;
  evaluatorId?: number;
  evaluatorName?: string;
}

export interface CriteriaDto {
  id: number;
  categoryId: number;
  name: string;
  baseDescription: string;
  categoryName: string;
  categoryWeight: number;
  isActive: boolean;
  createdDate: Date;
  roleDescriptions: CriteriaRoleDescriptionDto[];
}

export interface CriteriaCategoryDto {
  id: number;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
  criteriaCount: number;
}

export interface EvaluationDto {
  id: number;
  evaluatorId: number;
  evaluatorName: string;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  period: string;
  status: string;
  totalScore?: number;
  createdDate: Date;
  completedDate?: Date;
}

export interface EvaluationListDto {
  id: number;
  evaluatorId: number;
  evaluatorName: string;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  period: string;
  status: string;
  totalScore?: number;
  createdDate: Date;
  completedDate?: Date;
}

export interface EvaluationDetailDto {
  id: number;
  evaluatorId: number;
  evaluatorName: string;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  period: string;
  status: string;
  totalScore?: number;
  createdDate: Date;
  completedDate?: Date;
  scores?: EvaluationScoreDto[];
  comments?: CommentDto[];
}

export interface EvaluationFormDto {
  id: number;
  evaluationId?: number; // Add missing property
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  evaluatorName?: string; // Add missing property
  period: string;
  status: string;
  totalScore?: number; // Add missing property
  generalComments?: string; // Add missing property
  criteriaWithScores: CriteriaWithScoreDto[];
}

export interface CriteriaWithScoreDto {
  criteriaId: number;
  name: string;
  criteriaName?: string; // Add missing property
  categoryName: string;
  categoryWeight: number;
  baseDescription: string;
  description?: string; // Add missing property
  roleDescription?: string;
  score?: number;
  comments: string[];
}

export interface EvaluationScoreDto {
  id: number;
  evaluationId: number;
  criteriaId: number;
  score: number;
  createdDate: Date;
  updatedDate?: Date;
}

export interface CommentDto {
  id: number;
  evaluationId: number;
  criteriaId: number;
  comment: string;
  description?: string; // Add missing property
  createdBy: number;
  createdByName: string;
  authorName?: string; // Add missing property
  createdDate: Date;
  lastModifiedDate?: Date; // Add missing property
  updatedDate?: Date;
}

export interface CriteriaRoleDescriptionDto {
  id: number;
  criteriaId: number;
  roleId: number;
  description: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate?: Date;
}

// Request DTOs
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId?: number;
  roleIds: number[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  roleIds: number[];
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  evaluatorId?: number;
}

export interface UpdateTeamRequest {
  name: string;
  description: string;
  evaluatorId?: number;
  isActive: boolean;
}

export interface CreateEvaluationRequest {
  employeeId: number;
  evaluatorId?: number; // Add missing property
  period: string;
  startDate?: string; // Add missing property
  endDate?: string; // Add missing property
}

export interface UpdateEvaluationRequest {
  employeeId: number;
  period: string;
  status: string;
  generalComments?: string; // Add missing property
}

export interface UpdateScoreRequest {
  evaluationId: number;
  criteriaId: number;
  score: number;
}

export interface AddCommentRequest {
  evaluationId: number;
  criteriaId: number;
  comment: string;
}

export interface UpdateCommentRequest {
  comment: string;
}

export interface CreateCriteriaRequest {
  categoryId: number;
  name: string;
  baseDescription: string;
}

export interface UpdateCriteriaRequest {
  categoryId: number;
  name: string;
  baseDescription: string;
  isActive: boolean;
}

export interface AddRoleDescriptionRequest {
  criteriaId: number;
  roleId: number;
  description: string;
}

export interface UpdateRoleDescriptionRequest {
  description: string;
}

export interface CreateCriteriaCategoryRequest {
  name: string;
  description?: string;
  weight: number;
}

export interface UpdateCriteriaCategoryRequest {
  name?: string;
  description?: string;
  weight?: number;
  isActive?: boolean;
}

export interface WeightValidationDto {
  isValid: boolean;
  totalWeight: number;
  message: string;
  categoryWeights: {
    categoryId: number;
    categoryName: string;
    weight: number;
    isValid: boolean;
  }[];
  // Add missing properties that are being used
  categories?: {
    categoryId: number;
    categoryName: string;
    currentWeight: number;
    suggestedWeight: number;
    difference: number;
    isBalanced: boolean;
  }[];
  errors?: string[];
}

export interface RebalanceWeightRequest {
  categoryId: number;
  weight: number;
}

// Dashboard DTOs
export interface DashboardOverviewDto {
  totalUsers: number;
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageScore: number;
}

export interface AdminStatisticsDto {
  totalUsers: number;
  totalDepartments: number;
  totalTeams: number;
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
  averageScore: number;
  departmentStats: {
    departmentId: number;
    departmentName: string;
    userCount: number;
    evaluationCount: number;
    averageScore: number;
  }[];
}

export interface TeamPerformanceDto {
  teamId: number;
  teamName: string;
  memberCount: number;
  evaluationCount: number;
  completedEvaluations: number;
  averageScore: number;
  memberPerformance: {
    userId: number;
    userName: string;
    evaluationCount: number;
    averageScore: number;
  }[];
}

export interface PersonalPerformanceDto {
  userId: number;
  userName: string;
  departmentName: string;
  evaluationCount: number;
  averageScore: number;
  recentEvaluations: {
    id: number;
    period: string;
    score: number;
    status: string;
    completedDate: Date;
  }[];
}

// File DTOs
export interface FileUploadDto {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
}

export interface FileInfoDto {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  lastModified: Date;
}

// Additional DTOs for extended functionality
export interface UserListDto extends UserDto {
  departmentName?: string;
  roleNames: string[];
  teamName?: string;
  lastLoginDate?: Date;
  evaluationCount: number;
  averageScore?: number;
}

export interface UserWithDetailsDto extends UserDto {
  department: DepartmentDto;
  teams: TeamDto[];
  evaluations: EvaluationDto[];
  permissions: string[];
}

export interface DepartmentWithUsersDto extends DepartmentDto {
  users: UserDto[];
  manager?: UserDto;
}

export interface TeamWithMembersDto extends TeamDto {
  members: UserDto[];
  evaluator?: UserDto;
  performanceStats: {
    averageScore: number;
    completedEvaluations: number;
    totalMembers: number;
  };
}

export interface CriteriaCategoryWithCriteriaDto extends CriteriaCategoryDto {
  criteria: CriteriaDto[];
}

export interface EvaluationSummaryDto {
  id: number;
  employeeName: string;
  evaluatorName: string;
  period: string;
  status: string;
  totalScore?: number;
  completedDate?: Date;
  criteriaCount: number;
  commentsCount: number;
}

export interface UserSearchDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName?: string;
  roleNames: string[];
  isActive: boolean;
}

export interface UserSearchRequest {
  searchTerm?: string;
  departmentId?: number;
  roleId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
