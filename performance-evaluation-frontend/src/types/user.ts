import { BaseEntity } from './common';
import { RoleAssignmentDto } from './role';

// User DTOs matching backend
export interface UserDto extends BaseEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  departmentId: number;
  isActive: boolean;
}

export interface UserSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface UserListDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
  createdDate: string;
}

export interface UserWithDetailsDto extends BaseEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  departmentName: string;
  roles: RoleAssignmentDto[];
  teams: TeamSummaryDto[];
  isActive: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  departmentId: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  isActive?: boolean;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Search DTOs
export interface UserSearchDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
  createdDate: string;
  lastLoginDate?: string;
}

export interface UserSearchRequest {
  searchTerm?: string;
  departmentId?: number;
  roleId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// Supporting types

export interface TeamSummaryDto {
  teamId: number;
  teamName: string;
  role: string;
}

export interface RoleAssignmentSummaryDto {
  userId: number;
  systemRoles: string[];
  jobRoles: string[];
}

// Employee and Evaluator specific DTOs
export interface EmployeeListDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface EvaluatorListDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  totalEvaluations: number;
  activeEvaluations: number;
}
